import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import RecipeCard, { SkeletonCard } from '../components/RecipeCard'
import useMealDB from '../hooks/useMealDB'
import usePersistentPageState from '../hooks/usePersistentPageState'
import PageFadeIn from '../components/PageFadeIn'

export default function Search() {
  const navigate = useNavigate()
  const { searchRecipes } = useMealDB()
  
  // Persistent state
  const [savedQuery, setSavedQuery, restoreScroll] = usePersistentPageState('boxbite_search_query', '')
  const [savedRecipes, setSavedRecipes] = usePersistentPageState('boxbite_search_recipes', [])
  const [savedSearched, setSavedSearched] = usePersistentPageState('boxbite_search_searched', false)
  
  // Local state
  const [query, setQuery] = useState(savedQuery)
  const [recipes, setRecipes] = useState(savedRecipes)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(savedSearched)
  const [error, setError] = useState('')
  
  // Track if we've restored state to prevent unnecessary fetches
  const hasRestoredRef = useRef(false)
  const lastQueryRef = useRef(savedQuery)

  // Restore state on mount
  useEffect(() => {
    if (!hasRestoredRef.current && savedQuery) {
      hasRestoredRef.current = true
      setQuery(savedQuery)
      setRecipes(savedRecipes)
      setSearched(savedSearched)
      lastQueryRef.current = savedQuery
      // Restore scroll after render
      requestAnimationFrame(() => {
        restoreScroll()
      })
    }
  }, []) // Only run once on mount

  // Persist query changes (debounced)
  useEffect(() => {
    if (hasRestoredRef.current) {
      setSavedQuery(query)
    }
  }, [query, setSavedQuery])

  // Persist recipes when they change
  useEffect(() => {
    if (hasRestoredRef.current && searched) {
      setSavedRecipes(recipes)
      setSavedSearched(searched)
    }
  }, [recipes, searched, setSavedRecipes, setSavedSearched])

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    // Only fetch if query actually changed
    if (searchQuery === lastQueryRef.current && recipes.length > 0) {
      return
    }

    lastQueryRef.current = searchQuery
    hasRestoredRef.current = true

    setLoading(true)
    setError('')
    setSearched(true)
    setQuery(searchQuery)
    
    try {
      const results = await searchRecipes(searchQuery)
      setRecipes(results)
      if (results.length === 0) {
        setError('No recipes found. Try a different search term.')
      }
    } catch (err) {
      console.error('Error searching recipes:', err)
      setError('Failed to search recipes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle query input change
  const handleQueryChange = (newQuery) => {
    setQuery(newQuery)
  }

  return (
    <PageFadeIn>
      <section className="pt-10">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
            Search Recipes
          </p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Find your perfect dish
          </h2>
          <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            Search by recipe name to discover new dishes or find your favorites.
          </p>
        </div>

        <SearchBar
          value={query}
          onChange={handleQueryChange}
          onSubmit={handleSearch}
          isLoading={loading}
        />

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
        ) : searched && recipes.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} for
                &quot;{query}&quot;
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
        ) : searched && recipes.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-slate-700 dark:border-white/5 dark:bg-slate-900/70 dark:text-slate-200 animate-fadeIn">
            <p className="text-lg">No recipes found for &quot;{query}&quot;</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try searching for a different recipe name.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-slate-700 dark:border-white/5 dark:bg-slate-900/70 dark:text-slate-200 animate-fadeIn">
            <p className="text-lg">Search for recipes by name</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter a recipe name in the search bar above to get started.
            </p>
          </div>
        )}
      </section>
    </PageFadeIn>
  )
}
