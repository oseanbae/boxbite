import { collection, doc, getDoc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const FAVORITES_LEGACY_KEY = 'boxbite_favorites_v1'
const FAVORITES_CURRENT_KEY = 'boxbite_favorites' // Also check current key for migration
const PLANS_V1_KEY = 'boxbite_weekly_plans_v1'
const PLANS_V2_KEY = 'boxbite_weekly_plans_v2'
const CURRENT_PLAN_KEY = 'boxbite_current_plan_v2'

/**
 * Migrate favorites from localStorage to Firestore
 * Only migrates if documents don't already exist in Firestore
 * @param {string} uid - User ID
 * @returns {Promise<{migratedCount: number, skippedCount: number}>}
 */
export const migrateFavorites = async (uid) => {
  if (!uid) {
    return { migratedCount: 0, skippedCount: 0 }
  }

  try {
    // Check both legacy and current keys
    let favorites = []
    const legacyData = localStorage.getItem(FAVORITES_LEGACY_KEY)
    const currentData = localStorage.getItem(FAVORITES_CURRENT_KEY)
    
    if (legacyData) {
      try {
        favorites = JSON.parse(legacyData)
      } catch (err) {
        console.warn('Failed to parse legacy favorites:', err)
      }
    }
    
    // If no legacy data, check current key
    if (favorites.length === 0 && currentData) {
      try {
        favorites = JSON.parse(currentData)
      } catch (err) {
        console.warn('Failed to parse current favorites:', err)
      }
    }

    if (!favorites || favorites.length === 0) {
      return { migratedCount: 0, skippedCount: 0 }
    }

    const favoritesRef = collection(db, 'users', uid, 'favorites')
    const existingSnapshot = await getDocs(favoritesRef)
    const existingIds = new Set(existingSnapshot.docs.map(doc => doc.id))

    let migratedCount = 0
    let skippedCount = 0

    for (const recipe of favorites) {
      if (!recipe || !recipe.id) continue

      // Skip if already exists in Firestore
      if (existingIds.has(recipe.id)) {
        skippedCount++
        continue
      }

      try {
        const recipeRef = doc(favoritesRef, recipe.id)
        await setDoc(recipeRef, recipe, { merge: true })
        migratedCount++
      } catch (error) {
        console.error(`Failed to migrate favorite ${recipe.id}:`, error)
        skippedCount++
      }
    }

    return { migratedCount, skippedCount }
  } catch (error) {
    console.error('Error migrating favorites:', error)
    return { migratedCount: 0, skippedCount: 0 }
  }
}

/**
 * Migrate weekly plans from localStorage to Firestore
 * Only migrates if documents don't already exist in Firestore
 * @param {string} uid - User ID
 * @returns {Promise<{migratedCount: number, skippedCount: number}>}
 */
export const migrateWeeklyPlans = async (uid) => {
  if (!uid) {
    return { migratedCount: 0, skippedCount: 0 }
  }

  try {
    // Check v2 format first (preferred)
    let plans = []
    const v2Data = localStorage.getItem(PLANS_V2_KEY)
    
    if (v2Data) {
      try {
        plans = JSON.parse(v2Data)
      } catch (err) {
        console.warn('Failed to parse v2 plans:', err)
      }
    }

    // If no v2 data, check v1 format (legacy)
    if (plans.length === 0) {
      const v1Data = localStorage.getItem(PLANS_V1_KEY)
      if (v1Data) {
        try {
          const v1Plans = JSON.parse(v1Data)
          // Migrate v1 format to v2 format
          plans = v1Plans.map(plan => {
            if (!plan.recipes || !Array.isArray(plan.recipes)) {
              return null
            }
            // Convert array of 7 recipes to slots format
            const slots = plan.recipes.map(recipe => ({
              breakfast: null,
              lunch: recipe || null,
              dinner: null,
            }))
            
            const createdAt = plan.createdAt ? new Date(plan.createdAt) : new Date()
            const weekStart = new Date(createdAt)
            weekStart.setHours(0, 0, 0, 0)
            const dayOfWeek = weekStart.getDay()
            const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
            weekStart.setDate(diff)

            return {
              id: plan.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: plan.createdAt || new Date().toISOString(),
              weekStart: weekStart.toISOString(),
              name: plan.name || null,
              categories: plan.category ? [plan.category] : [],
              slots,
            }
          }).filter(Boolean)
        } catch (err) {
          console.warn('Failed to parse v1 plans:', err)
        }
      }
    }

    // Also migrate current plan if it exists
    const currentPlanData = localStorage.getItem(CURRENT_PLAN_KEY)
    if (currentPlanData) {
      try {
        const currentPlan = JSON.parse(currentPlanData)
        if (currentPlan && currentPlan.id) {
          // Check if it's already in plans array
          const existsInPlans = plans.some(p => p.id === currentPlan.id)
          if (!existsInPlans) {
            plans.push(currentPlan)
          }
        }
      } catch (err) {
        console.warn('Failed to parse current plan:', err)
      }
    }

    if (!plans || plans.length === 0) {
      return { migratedCount: 0, skippedCount: 0 }
    }

    const plansRef = collection(db, 'users', uid, 'weekly_plans')
    const existingSnapshot = await getDocs(plansRef)
    const existingIds = new Set(existingSnapshot.docs.map(doc => doc.id))

    let migratedCount = 0
    let skippedCount = 0

    for (const plan of plans) {
      if (!plan || !plan.id) continue

      // Skip if already exists in Firestore
      if (existingIds.has(plan.id)) {
        skippedCount++
        continue
      }

      try {
        // Ensure weekStart exists
        let weekStart = plan.weekStart
        if (!weekStart) {
          const startDate = plan.createdAt ? new Date(plan.createdAt) : new Date()
          startDate.setHours(0, 0, 0, 0)
          const dayOfWeek = startDate.getDay()
          const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
          startDate.setDate(diff)
          weekStart = startDate.toISOString()
        }

        const planRef = doc(plansRef, plan.id)
        await setDoc(planRef, {
          id: plan.id,
          createdAt: plan.createdAt || new Date().toISOString(),
          weekStart,
          name: plan.name || null,
          categories: plan.categories || [],
          slots: plan.slots || [],
        }, { merge: true })
        migratedCount++
      } catch (error) {
        console.error(`Failed to migrate plan ${plan.id}:`, error)
        skippedCount++
      }
    }

    return { migratedCount, skippedCount }
  } catch (error) {
    console.error('Error migrating weekly plans:', error)
    return { migratedCount: 0, skippedCount: 0 }
  }
}

/**
 * Check if migration has been performed for this user
 * If not, run migrations and mark as migrated
 * @param {string} uid - User ID
 * @returns {Promise<void>}
 */
export const performMigrationIfNeeded = async (uid) => {
  if (!uid) {
    return
  }

  try {
    // Check if migration has already been performed
    const metaRef = doc(db, 'users', uid, 'meta', 'migration')
    const metaDoc = await getDoc(metaRef)

    if (metaDoc.exists() && metaDoc.data().migratedAt) {
      // Migration already performed
      return
    }

    // Perform migrations
    const favoritesResult = await migrateFavorites(uid)
    const plansResult = await migrateWeeklyPlans(uid)

    // Mark migration as complete
    await setDoc(metaRef, {
      migratedAt: serverTimestamp(),
      favoritesMigrated: favoritesResult.migratedCount,
      plansMigrated: plansResult.migratedCount,
    }, { merge: true })

    console.log(`Migration complete: ${favoritesResult.migratedCount} favorites, ${plansResult.migratedCount} plans migrated`)
  } catch (error) {
    console.error('Error performing migration:', error)
    // Don't throw - migration failure shouldn't block user from using the app
  }
}

