import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import IngredientInput from '../components/IngredientInput'
import RecipeCard, { SkeletonCard } from '../components/RecipeCard'
import useMealDB from '../hooks/useMealDB'
import usePersistentPageState from '../hooks/usePersistentPageState'
import PageFadeIn from '../components/PageFadeIn'

export default function Pantry() {
  const navigate = useNavigate()
  const { getMultipleByIngredients } = useMealDB()
  
  // Persistent state
  const [savedIngredients, setSavedIngredients, restoreScroll] = usePersistentPageState('boxbite_pantry_ingredients', [])
  const [savedMatchAll, setSavedMatchAll] = usePersistentPageState('boxbite_pantry_matchAll', false)
  const [savedRecipes, setSavedRecipes] = usePersistentPageState('boxbite_pantry_recipes', [])
  
  // Local state
  const [ingredients, setIngredients] = useState(savedIngredients)
  const [recipes, setRecipes] = useState(savedRecipes)
  const [loading, setLoading] = useState(false)
  const [matchAll, setMatchAll] = useState(savedMatchAll)
  const [error, setError] = useState('')
  
  // Track if we've restored state to prevent unnecessary fetches
  const hasRestoredRef = useRef(false)
  const lastFiltersRef = useRef(JSON.stringify({ ingredients: savedIngredients, matchAll: savedMatchAll }))

  // Restore state on mount
  useEffect(() => {
    if (!hasRestoredRef.current) {
      hasRestoredRef.current = true
      setIngredients(savedIngredients)
      setMatchAll(savedMatchAll)
      setRecipes(savedRecipes)
      lastFiltersRef.current = JSON.stringify({ ingredients: savedIngredients, matchAll: savedMatchAll })
      // Restore scroll after render
      requestAnimationFrame(() => {
        restoreScroll()
      })
    }
  }, []) // Only run once on mount

  // Persist ingredients changes (debounced)
  useEffect(() => {
    if (hasRestoredRef.current) {
      setSavedIngredients(ingredients)
    }
  }, [ingredients, setSavedIngredients])

  // Persist matchAll changes
  useEffect(() => {
    if (hasRestoredRef.current) {
      setSavedMatchAll(matchAll)
    }
  }, [matchAll, setSavedMatchAll])

  // Persist recipes when they change
  useEffect(() => {
    if (hasRestoredRef.current && recipes.length > 0) {
      setSavedRecipes(recipes)
    }
  }, [recipes, setSavedRecipes])

  const handleIngredientChange = (newIngredients) => {
    if (Array.isArray(newIngredients)) {
      setIngredients(newIngredients)
    } else {
      if (!ingredients.includes(newIngredients)) {
        setIngredients([...ingredients, newIngredients])
      }
    }
  }

  useEffect(() => {
    const searchRecipes = async () => {
      if (ingredients.length === 0) {
        setRecipes([])
        return
      }

      // Only fetch if filters actually changed
      const currentFilters = JSON.stringify({ ingredients, matchAll })
      if (currentFilters === lastFiltersRef.current && recipes.length > 0) {
        return
      }

      lastFiltersRef.current = currentFilters
      hasRestoredRef.current = true

      setLoading(true)
      setError('')
      try {
        const results = await getMultipleByIngredients(ingredients, matchAll)
        setRecipes(results)
        if (results.length === 0) {
          setError(
            `No recipes found ${matchAll ? 'using all' : 'using'} these ingredients.`,
          )
        }
      } catch (err) {
        console.error('Error fetching recipes:', err)
        setError('Failed to fetch recipes. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    // Only run if we've restored state or ingredients changed
    if (hasRestoredRef.current) {
      const timeoutId = setTimeout(searchRecipes, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [ingredients, matchAll, getMultipleByIngredients])

  return (
    <PageFadeIn>
      <section className="pt-10">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
            Pantry Search
          </p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            What&apos;s in your kitchen?
          </h2>
          <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            Add the ingredients you have on hand, and we&apos;ll find recipes that use
            them. Toggle between matching all ingredients or any ingredient.
          </p>
        </div>

        <IngredientInput ingredients={ingredients} onAdd={handleIngredientChange} />

        {ingredients.length > 0 && (
          <div className="glass mb-6 flex items-center gap-4 rounded-xl p-4 shadow-sm">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={matchAll}
                onChange={(e) => setMatchAll(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 bg-white text-fuchsia-500 focus:ring-fuchsia-400 transition-all duration-200 dark:border-white/20 dark:bg-slate-900"
              />
              <span>Match all ingredients (otherwise matches any)</span>
            </label>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-100 animate-fadeIn">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe, index) => (
                <div key={recipe.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <RecipeCard
                    recipe={recipe}
                    onSelect={() => navigate(`/recipe/${recipe.id}`)}
                  />
                </div>
              ))}
            </div>
          </>
        ) : ingredients.length > 0 && !loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-slate-700 dark:border-white/5 dark:bg-slate-900/70 dark:text-slate-200 animate-fadeIn">
            <p className="text-lg">No recipes found for these ingredients.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try adding more ingredients or changing the match mode.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-slate-700 dark:border-white/5 dark:bg-slate-900/70 dark:text-slate-200 animate-fadeIn">
            <p className="text-lg">Start by adding ingredients you have.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              We&apos;ll find recipes that use them.
            </p>
          </div>
        )}
      </section>
    </PageFadeIn>
  )
}
