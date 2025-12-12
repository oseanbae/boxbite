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

  const searchRecipes = useCallback(async (query) => {
    if (!query || !query.trim()) return []
    try {
      const res = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`)
      const data = await res.json()
      return data.meals?.map((meal) => normalizeMeal(meal)) ?? []
    } catch (error) {
      console.error('searchRecipes', error)
      return []
    }
  }, [])

  const getByIngredient = useCallback(async (ingredient) => {
    if (!ingredient || !ingredient.trim()) return []
    try {
      const res = await fetch(`${API_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`)
      const data = await res.json()
      return (
        data.meals?.map((meal) =>
          normalizeMeal({
            ...meal,
            strCategory: meal.strCategory || '',
            strArea: meal.strArea || '',
            strInstructions: '',
          }),
        ) ?? []
      )
    } catch (error) {
      console.error('getByIngredient', error)
      return []
    }
  }, [])

  const getMultipleRandom = useCallback(async (count = 7) => {
    try {
      const promises = Array.from({ length: count }).map(() =>
        fetch(`${API_BASE}/random.php`).then((res) => res.json()),
      )
      const results = await Promise.all(promises)
      return results
        .map((data) => (data.meals?.[0] ? normalizeMeal(data.meals[0]) : null))
        .filter(Boolean)
    } catch (error) {
      console.error('getMultipleRandom', error)
      return []
    }
  }, [])

  const getMultipleByIngredients = useCallback(async (ingredientsArray, matchAll = false) => {
    if (!ingredientsArray?.length) return []
    try {
      if (matchAll) {
        const allResults = await Promise.all(
          ingredientsArray.map((ing) => getByIngredient(ing)),
        )
        const recipeMap = new Map()
        allResults.forEach((recipes) => {
          recipes.forEach((recipe) => {
            const count = recipeMap.get(recipe.id) || 0
            recipeMap.set(recipe.id, count + 1)
          })
        })
        return Array.from(recipeMap.entries())
          .filter(([_, count]) => count === ingredientsArray.length)
          .map(([id]) => {
            const found = allResults[0].find((r) => r.id === id)
            return found
          })
          .filter(Boolean)
      } else {
        const results = await getByIngredient(ingredientsArray[0])
        return results
      }
    } catch (error) {
      console.error('getMultipleByIngredients', error)
      return []
    }
  }, [getByIngredient])

  return {
    getRandomRecipe,
    getRecipeById,
    getCategories,
    getFilteredRecipes,
    searchRecipes,
    getByIngredient,
    getMultipleRandom,
    getMultipleByIngredients,
  }
}


