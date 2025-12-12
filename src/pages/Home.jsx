import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import RecipeCard, { SkeletonCard } from '../components/RecipeCard'
import useMealDB from '../hooks/useMealDB'

export default function Home() {
  const { getRandomRecipe, getCategories, getFilteredRecipes } = useMealDB()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const bootstrap = async () => {
      const catList = await getCategories()
      setCategories(catList)
      await fetchRandom()
    }
    bootstrap()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'all') return
    const run = async () => {
      setLoading(true)
      setError('')
      const results = await getFilteredRecipes(selectedCategory)
      setRecipes(results)
      if (!results.length) setError('No recipes found for this category.')
      setLoading(false)
    }
    run()
  }, [selectedCategory, getFilteredRecipes])

  const fetchRandom = async () => {
    setLoading(true)
    setError('')
    const recipe = await getRandomRecipe()
    setRecipes(recipe ? [recipe] : [])
    if (!recipe) setError('Could not fetch a random recipe. Try again.')
    setLoading(false)
  }

  const visibleRecipes = useMemo(() => recipes || [], [recipes])

  return (
    <section className="pt-8">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300">
          Tonight&apos;s pick
        </p>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Spin the wheel and cook something new
        </h2>
        <p className="max-w-2xl text-slate-300">
          Use the filters to narrow down by category or hit Surprise Me to let
          boxbite? pick a random dish for you. Click any card to view the full
          recipe.
        </p>
      </div>

      <FilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSurprise={() => {
          setSelectedCategory('all')
          fetchRandom()
        }}
        isLoading={loading}
      />

      {error ? (
        <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
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
  )
}

