const STORAGE_KEY = 'boxbite_weekly_plans'

export const weeklyPlan = {
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  save: (plan) => {
    try {
      const plans = weeklyPlan.get()
      const newPlan = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...plan,
      }
      const updated = [newPlan, ...plans].slice(0, 50)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
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

