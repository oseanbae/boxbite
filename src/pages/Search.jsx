import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import RecipeCard, { SkeletonCard } from '../components/RecipeCard'
import useMealDB from '../hooks/useMealDB'

export default function Search() {
  const navigate = useNavigate()
  const { searchRecipes } = useMealDB()
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')
    setSearched(true)
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

  return (
    <section className="pt-10">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300">
          Search Recipes
        </p>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Find your perfect dish
        </h2>
        <p className="max-w-2xl text-slate-300">
          Search by recipe name to discover new dishes or find your favorites.
        </p>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSearch}
        isLoading={loading}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
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
            <p className="text-sm text-slate-300">
              Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} for
              &quot;{query}&quot;
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={() => navigate(`/recipe/${recipe.id}`)}
              />
            ))}
          </div>
        </>
      ) : searched && recipes.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-slate-900/70 px-4 py-12 text-center text-slate-200">
          <p className="text-lg">No recipes found for &quot;{query}&quot;</p>
          <p className="mt-2 text-sm text-slate-400">
            Try searching for a different recipe name.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-slate-900/70 px-4 py-12 text-center text-slate-200">
          <p className="text-lg">Search for recipes by name</p>
          <p className="mt-2 text-sm text-slate-400">
            Enter a recipe name in the search bar above to get started.
          </p>
        </div>
      )}
    </section>
  )
}

