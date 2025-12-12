import { useCallback } from 'react'

const API_BASE = 'https://www.themealdb.com/api/json/v1/1'

const normalizeMeal = (meal) => ({
  id: meal.idMeal,
  name: meal.strMeal,
  category: meal.strCategory,
  area: meal.strArea,
  tags: meal.strTags ? meal.strTags.split(',').map((t) => t.trim()) : [],
  image: meal.strMealThumb,
  instructions: meal.strInstructions,
  raw: meal,
})

export default function useMealDB() {
  const getRandomRecipe = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/random.php`)
      const data = await res.json()
      if (!data.meals?.length) return null
      return normalizeMeal(data.meals[0])
    } catch (error) {
      console.error('getRandomRecipe', error)
      return null
    }
  }, [])

  const getRecipeById = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/lookup.php?i=${id}`)
      const data = await res.json()
      if (!data.meals?.length) return null
      return normalizeMeal(data.meals[0])
    } catch (error) {
      console.error('getRecipeById', error)
      return null
    }
  }, [])

  const getCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/list.php?c=list`)
      const data = await res.json()
      return data.meals?.map((item) => item.strCategory) ?? []
    } catch (error) {
      console.error('getCategories', error)
      return []
    }
  }, [])

  const getFilteredRecipes = useCallback(async (category) => {
    if (!category || category === 'all') return []
    try {
      const res = await fetch(`${API_BASE}/filter.php?c=${encodeURIComponent(category)}`)
      const data = await res.json()
      return (
        data.meals?.map((meal) =>
          normalizeMeal({
            ...meal,
            strCategory: category,
            strArea: meal.strArea || '',
            strInstructions: '',
          }),
        ) ?? []
      )
    } catch (error) {
      console.error('getFilteredRecipes', error)
      return []
    }
  }, [])

  return {
    getRandomRecipe,
    getRecipeById,
    getCategories,
    getFilteredRecipes,
  }
}

