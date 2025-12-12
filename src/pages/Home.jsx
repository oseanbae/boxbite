import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import RecipeCard, { SkeletonCard } from '../components/RecipeCard'
import RecentList from '../components/RecentList'
import useMealDB from '../hooks/useMealDB'

export default function Home() {
  const { getRandomRecipe, getCategories, getFilteredRecipes, getMultipleRandom, getMultipleByCategories } = useMealDB()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const bootstrap = async () => {
      const catList = await getCategories()
      setCategories(catList)
      // Load random grid on initial load
      await loadRandomGrid()
    }
    bootstrap()
  }, [])

  // Load random grid (6 recipes)
  const loadRandomGrid = async () => {
    setLoading(true)
    setError('')
    try {
      const randomRecipes = await getMultipleRandom(6)
      setRecipes(randomRecipes)
      if (!randomRecipes.length) setError('Could not fetch recipes. Try again.')
    } catch (err) {
      console.error('Error loading random grid:', err)
      setError('Failed to load recipes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show recipes for selected categories (1 per category)
  const showSelected = async () => {
    if (selectedCategories.length === 0) {
      await loadRandomGrid()
      return
    }

    setLoading(true)
    setError('')
    try {
      const categoryRecipes = await getMultipleByCategories(selectedCategories, 1)
      setRecipes(categoryRecipes)
      if (!categoryRecipes.length) {
        setError('No recipes found for selected categories.')
      }
    } catch (err) {
      console.error('Error loading category recipes:', err)
      setError('Failed to load recipes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Surprise Me - respects selected categories or shows random
  const surpriseSelected = async () => {
    setLoading(true)
    setError('')
    try {
      if (selectedCategories.length > 0) {
        // Fetch new random recipes from selected categories
        const categoryRecipes = await getMultipleByCategories(selectedCategories, 1)
        if (categoryRecipes.length > 0) {
          setRecipes(categoryRecipes)
        } else {
          // Fallback to random if categories yield no results
          const randomRecipes = await getMultipleRandom(selectedCategories.length || 6)
          setRecipes(randomRecipes)
        }
      } else {
        // No categories selected - show random grid
        const randomRecipes = await getMultipleRandom(6)
        setRecipes(randomRecipes)
      }
      if (!recipes.length) setError('Could not fetch recipes. Try again.')
    } catch (err) {
      console.error('Error fetching surprise recipes:', err)
      setError('Failed to load recipes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Toggle category selection
  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  // Update recipes when categories change
  useEffect(() => {
    if (selectedCategories.length > 0) {
      showSelected()
    } else {
      loadRandomGrid()
    }
  }, [selectedCategories])

  const visibleRecipes = useMemo(() => recipes || [], [recipes])

  return (
    <>
      <RecentList />
      <section className="pt-8">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
            Tonight&apos;s pick
          </p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Spin the wheel and cook something new
          </h2>
          <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            Select categories to filter recipes, or hit Surprise Me to let BoxBite pick
            random dishes for you. Click any card to view the full recipe.
          </p>
        </div>

        <FilterBar
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onSurprise={surpriseSelected}
          isLoading={loading}
        />

        {error ? (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
            : visibleRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={() => navigate(`/recipe/${recipe.id}`)}
                />
              ))}
        </div>
      </section>
    </>
  )
}