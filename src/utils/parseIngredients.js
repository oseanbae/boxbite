export function parseIngredients(meal = {}) {
  const ingredients = []

  for (let i = 1; i <= 20; i += 1) {
    const ingredient = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: measure?.trim() || '',
      })
    }
  }

  return ingredients
}

