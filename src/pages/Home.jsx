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
  // Track last fetch to prevent duplicate fetches
  const lastFetchRef = useRef({ type: null, categories: null })
  // Debounce timer for category changes
  const categoryDebounceRef = useRef(null)
  // Track categories as string for stable comparison
  const categoriesKeyRef = useRef('')

  // Load categories on mount (one-time, stable dependencies)
  useEffect(() => {
    const bootstrap = async () => {
      if (initialLoadRef.current) return
      
      const catList = await getCategories()
      setCategories(catList)
      initialLoadRef.current = true
      
      // Load random grid on initial load only
      await loadRandomGrid()
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run once

  // Stable loadRandomGrid function
  const loadRandomGrid = useCallback(async () => {
    // Prevent duplicate random fetches
    if (lastFetchRef.current.type === 'random' && recipes.length > 0) {
      return
    }

    setLoading(true)
    setError('')
    lastFetchRef.current = { type: 'random', categories: null }
    
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
  }, [getMultipleRandom, recipes.length])

  // Stable showSelected function - only depends on selectedCategories string key
  const showSelected = useCallback(async () => {
    const categoriesKey = selectedCategories.sort().join(',')
    
    // Prevent duplicate fetches for same categories
    if (lastFetchRef.current.type === 'categories' && lastFetchRef.current.categories === categoriesKey) {
      return
    }

    if (selectedCategories.length === 0) {
      await loadRandomGrid()
      return
    }

    setLoading(true)
    setError('')
    lastFetchRef.current = { type: 'categories', categories: categoriesKey }
    
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

  // Stable surpriseSelected function
  const surpriseSelected = useCallback(async () => {
    setLoading(true)
    setError('')
    
    try {
      if (selectedCategories.length > 0) {
        const categoriesKey = selectedCategories.sort().join(',')
        lastFetchRef.current = { type: 'surprise-categories', categories: categoriesKey }
        
        // Fetch new random recipes from selected categories
        const categoryRecipes = await getMultipleByCategories(selectedCategories, 1)
        if (categoryRecipes.length > 0) {
          setRecipes(categoryRecipes)
        } else {
          // Fallback to random if categories yield no results
          const randomRecipes = await getMultipleRandom(selectedCategories.length || 6)
          setRecipes(randomRecipes)
          lastFetchRef.current = { type: 'surprise-random', categories: null }
        }
      } else {
        lastFetchRef.current = { type: 'surprise-random', categories: null }
        
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
  const handleCategoryToggle = useCallback((category) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
      return newCategories
    })
  }, [])

  // Track categories as string for stable comparison
  const currentCategoriesKey = selectedCategories.sort().join(',')

  // Debounced effect: Update recipes when categories change (with 200ms debounce)
  // Only trigger if categories actually changed (string comparison)
  useEffect(() => {
    // Don't run on initial mount (initial load handles it)
    if (!initialLoadRef.current) {
      categoriesKeyRef.current = currentCategoriesKey
      return
    }

    // Only trigger if categories actually changed
    if (categoriesKeyRef.current === currentCategoriesKey) {
      return
    }

    // Clear existing timer
    if (categoryDebounceRef.current) {
      clearTimeout(categoryDebounceRef.current)
    }

    // Update ref immediately to prevent duplicate triggers
    categoriesKeyRef.current = currentCategoriesKey

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
  }, [currentCategoriesKey, showSelected])

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
              Click Surprise Me to explore a new dish
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
