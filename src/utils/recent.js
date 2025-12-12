const STORAGE_KEY = 'boxbite_recent'

export const recent = {
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  add: (recipeId) => {
    try {
      const current = recent.get()
      const filtered = current.filter((id) => id !== recipeId)
      const updated = [recipeId, ...filtered].slice(0, 10)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving recent recipe:', error)
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing recent recipes:', error)
    }
  },
}

