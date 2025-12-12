import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import RecipeCard, { SkeletonCard } from '../components/RecipeCard'
import RecentlyViewedSlider from '../components/RecentlyViewedSlider'
import useMealDB from '../hooks/useMealDB'
import PageFadeIn from '../components/PageFadeIn'

export default function Home() {
  const { getMultipleRandom, getCategories, getMultipleByCategories } = useMealDB()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Track if initial load has happened
  const initialLoadRef = useRef(false)
  // Debounce timer for category changes
  const categoryDebounceRef = useRef(null)

  // Load categories on mount (one-time)
  useEffect(() => {
    const bootstrap = async () => {
      if (initialLoadRef.current) return
      initialLoadRef.current = true
      
      const catList = await getCategories()
      setCategories(catList)
      // Load random grid on initial load only
      await loadRandomGrid()
    }
    bootstrap()
  }, [getCategories])

  // Load random grid (6 recipes) - only called explicitly
  const loadRandomGrid = useCallback(async () => {
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
  }, [getMultipleRandom])

  // Show recipes for selected categories (1 per category)
  const showSelected = useCallback(async () => {
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
  }, [selectedCategories, getMultipleByCategories, loadRandomGrid])

  // Surprise Me - respects selected categories or shows random
  const surpriseSelected = useCallback(async () => {
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
    } catch (err) {
      console.error('Error fetching surprise recipes:', err)
      setError('Failed to load recipes. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedCategories, getMultipleByCategories, getMultipleRandom])

  // Toggle category selection
  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
      return newCategories
    })
  }

  // Debounced effect: Update recipes when categories change (with 200ms debounce)
  useEffect(() => {
    // Clear existing timer
    if (categoryDebounceRef.current) {
      clearTimeout(categoryDebounceRef.current)
    }

    // Don't run on initial mount (initial load handles it)
    if (!initialLoadRef.current) return

    // Set new timer
    categoryDebounceRef.current = setTimeout(() => {
      showSelected()
    }, 200)

    // Cleanup
    return () => {
      if (categoryDebounceRef.current) {
        clearTimeout(categoryDebounceRef.current)
      }
    }
  }, [selectedCategories, showSelected])

  return (
    <PageFadeIn>
      <>
        <RecentlyViewedSlider />
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
            <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-100 animate-fadeIn">
              {error}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
              : recipes.map((recipe, index) => (
                  <div key={recipe.id} style={{ animationDelay: `${index * 50}ms` }}>
                    <RecipeCard
                      recipe={recipe}
                      onSelect={() => navigate(`/recipe/${recipe.id}`)}
                    />
                  </div>
                ))}
          </div>
        </section>
      </>
    </PageFadeIn>
  )
}
