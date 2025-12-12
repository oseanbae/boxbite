const STORAGE_KEY_V1 = 'boxbite_weekly_plans'
const STORAGE_KEY_V2 = 'boxbite_weekly_plans_v2'
const CURRENT_PLAN_KEY = 'boxbite_current_plan_v2'

/**
 * Migrates old format (array of 7 recipes) to new format (slots with breakfast/lunch/dinner)
 * @param {Object} oldPlan - Old plan with recipes array
 * @returns {Object} New plan format
 */
function migrateOldPlan(oldPlan) {
  if (!oldPlan.recipes || !Array.isArray(oldPlan.recipes)) {
    return null
  }

  // Convert array of 7 recipes to slots format
  // Old format had one recipe per day, put it in lunch slot
  const slots = oldPlan.recipes.map((recipe) => ({
    breakfast: null,
    lunch: recipe || null,
    dinner: null,
  }))

  // Calculate weekStart from createdAt or use current Monday
  const createdAt = oldPlan.createdAt ? new Date(oldPlan.createdAt) : new Date()
  const weekStart = new Date(createdAt)
  weekStart.setHours(0, 0, 0, 0)
  // Set to Monday of that week
  const dayOfWeek = weekStart.getDay()
  const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  weekStart.setDate(diff)

  return {
    id: oldPlan.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: oldPlan.createdAt || new Date().toISOString(),
    weekStart: weekStart.toISOString(),
    name: oldPlan.name,
    categories: oldPlan.category ? [oldPlan.category] : [],
    slots,
  }
}

export const weeklyPlan = {
  // Get all saved plans
  get: () => {
    try {
      // Check for v2 format first
      const v2Data = localStorage.getItem(STORAGE_KEY_V2)
      if (v2Data) {
        const plans = JSON.parse(v2Data)
        // Ensure all plans have weekStart - migrate old v2 plans without it
        return plans.map((plan) => {
          if (!plan.weekStart) {
            const createdAt = plan.createdAt ? new Date(plan.createdAt) : new Date()
            const weekStart = new Date(createdAt)
            weekStart.setHours(0, 0, 0, 0)
            const dayOfWeek = weekStart.getDay()
            const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
            weekStart.setDate(diff)
            return { ...plan, weekStart: weekStart.toISOString() }
          }
          return plan
        })
      }

      // Migrate from v1 if exists (one-time migration)
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

  // Save a plan to saved plans list
  save: (plan) => {
    try {
      // Validate plan structure
      if (!plan.slots || !Array.isArray(plan.slots) || plan.slots.length !== 7) {
        console.error('Invalid plan format: slots must be array of 7 items')
        return null
      }

      const plans = weeklyPlan.get()
      const planId = plan.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Calculate weekStart if not provided
      let weekStart = plan.weekStart
      if (!weekStart) {
        const startDate = new Date()
        startDate.setHours(0, 0, 0, 0)
        const dayOfWeek = startDate.getDay()
        const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        startDate.setDate(diff)
        weekStart = startDate.toISOString()
      }

      const newPlan = {
        id: planId,
        createdAt: plan.createdAt || new Date().toISOString(),
        weekStart,
        name: plan.name || `Plan ${new Date().toLocaleDateString()}`,
        categories: plan.categories || [],
        slots: plan.slots,
      }

      // Replace if exists, otherwise prepend
      const updated = [newPlan, ...plans.filter((p) => p.id !== planId)].slice(0, 50)
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(updated))
      return planId
    } catch (error) {
      console.error('Error saving weekly plan:', error)
      return null
    }
  },

  // Load a specific plan by ID
  load: (planId) => {
    try {
      const plans = weeklyPlan.get()
      return plans.find((p) => p.id === planId) || null
    } catch {
      return null
    }
  },

  // Delete a plan
  delete: (planId) => {
    try {
      const plans = weeklyPlan.get()
      const filtered = plans.filter((p) => p.id !== planId)
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(filtered))
    } catch (error) {
      console.error('Error deleting weekly plan:', error)
    }
  },

  // Get current working plan (the one being edited)
  getCurrent: () => {
    try {
      const data = localStorage.getItem(CURRENT_PLAN_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  // Save current working plan
  saveCurrent: (plan) => {
    try {
      if (!plan) {
        localStorage.removeItem(CURRENT_PLAN_KEY)
        return
      }

      // Ensure weekStart exists
      if (!plan.weekStart) {
        const startDate = new Date()
        startDate.setHours(0, 0, 0, 0)
        const dayOfWeek = startDate.getDay()
        const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        startDate.setDate(diff)
        plan.weekStart = startDate.toISOString()
      }

      localStorage.setItem(CURRENT_PLAN_KEY, JSON.stringify(plan))
    } catch (error) {
      console.error('Error saving current plan:', error)
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
 *   weekStart: ISOString,
 *   name?: string,
 *   categories: string[],
 *   slots: [
 *     { breakfast: Recipe|null, lunch: Recipe|null, dinner: Recipe|null }, // Day 1 (Monday)
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
