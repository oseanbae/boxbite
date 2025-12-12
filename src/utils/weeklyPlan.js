const STORAGE_KEY_V1 = 'boxbite_weekly_plans'
const STORAGE_KEY_V2 = 'boxbite_weekly_plans_v2'

/**
 * Migrates old format (array of 7 recipes) to new format (slots with breakfast/lunch/dinner)
 * @param {Array} oldPlan - Old plan with recipes array
 * @returns {Object} New plan format
 */
function migrateOldPlan(oldPlan) {
  if (!oldPlan.recipes || !Array.isArray(oldPlan.recipes)) {
    return null
  }

  // Convert array of 7 recipes to slots format
  const slots = oldPlan.recipes.map((recipe) => ({
    breakfast: null,
    lunch: recipe || null,
    dinner: null,
  }))

  return {
    id: oldPlan.id,
    createdAt: oldPlan.createdAt || new Date().toISOString(),
    name: oldPlan.name,
    categories: oldPlan.category ? [oldPlan.category] : [],
    slots,
  }
}

export const weeklyPlan = {
  get: () => {
    try {
      // Check for v2 format first
      const v2Data = localStorage.getItem(STORAGE_KEY_V2)
      if (v2Data) {
        return JSON.parse(v2Data)
      }

      // Migrate from v1 if exists
      const v1Data = localStorage.getItem(STORAGE_KEY_V1)
      if (v1Data) {
        try {
          const oldPlans = JSON.parse(v1Data)
          const migrated = oldPlans.map(migrateOldPlan).filter(Boolean)
          if (migrated.length > 0) {
            localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated))
            localStorage.removeItem(STORAGE_KEY_V1)
            return migrated
          }
        } catch (err) {
          console.warn('Failed to migrate old plans:', err)
        }
      }

      return []
    } catch {
      return []
    }
  },

  save: (plan) => {
    try {
      // Validate plan structure
      if (!plan.slots || !Array.isArray(plan.slots) || plan.slots.length !== 7) {
        console.error('Invalid plan format: slots must be array of 7 items')
        return null
      }

      const plans = weeklyPlan.get()
      const newPlan = {
        id: plan.id || Date.now().toString(),
        createdAt: plan.createdAt || new Date().toISOString(),
        name: plan.name || `Plan ${new Date().toLocaleDateString()}`,
        categories: plan.categories || [],
        slots: plan.slots,
      }
      const updated = [newPlan, ...plans.filter((p) => p.id !== newPlan.id)].slice(0, 50)
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(updated))
      return newPlan.id
    } catch (error) {
      console.error('Error saving weekly plan:', error)
      return null
    }
  },

  delete: (planId) => {
    try {
      const plans = weeklyPlan.get()
      const filtered = plans.filter((p) => p.id !== planId)
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(filtered))
    } catch (error) {
      console.error('Error deleting weekly plan:', error)
    }
  },

  getById: (planId) => {
    try {
      const plans = weeklyPlan.get()
      return plans.find((p) => p.id === planId) || null
    } catch {
      return null
    }
  },
}

/**
 * Firestore Schema Note:
 *
 * Collection: users/{uid}/weekly_plans/{planId}
 *
 * Document structure:
 * {
 *   id: string,
 *   createdAt: Timestamp,
 *   name: string,
 *   categories: string[],
 *   slots: [
 *     { breakfast: Recipe|null, lunch: Recipe|null, dinner: Recipe|null }, // Monday (index 0)
 *     ... // 7 items total (Monday-Sunday)
 *   ]
 * }
 *
 * Recipe object stored:
 * {
 *   id: string,
 *   name: string,
 *   image: string,
 *   category?: string,
 *   area?: string,
 *   instructions?: string,
 *   ingredients?: [{ ingredient: string, measure: string }]
 * }
 */


