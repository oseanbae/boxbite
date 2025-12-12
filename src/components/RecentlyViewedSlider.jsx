import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import RecipeCard, { SkeletonCard } from './RecipeCard'
import useMealDB from '../hooks/useMealDB'
import { recent } from '../utils/recent'

/**
 * RecentlyViewedSlider - Horizontal slider with snap scrolling for recently viewed recipes
 */
export default function RecentlyViewedSlider() {
  const navigate = useNavigate()
  const { getRecipeById } = useMealDB()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const sliderRef = useRef(null)

  useEffect(() => {
    const loadRecents = async () => {
      const recentIds = recent.get()
      if (recentIds.length === 0) {
        setLoading(false)
        return
      }

      try {
        const fetched = await Promise.all(
          recentIds.map((id) => getRecipeById(id)).filter(Boolean),
        )
        setRecipes(fetched.filter(Boolean))
      } catch (error) {
        console.error('Error loading recent recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecents()
  }, [getRecipeById])

  if (loading) {
    return (
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
              Recently Viewed
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Pick up where you left off
            </h2>
          </div>
        </div>
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="min-w-[140px] flex-shrink-0 snap-start">
                <SkeletonCard size="compact" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (recipes.length === 0) {
    return null
  }

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
            Recently Viewed
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Pick up where you left off
          </h2>
        </div>
        <button
          onClick={() => {
            recent.clear()
            setRecipes([])
          }}
          className="text-xs font-semibold text-slate-500 transition-all duration-200 ease-out hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Clear Recently Viewed
        </button>
      </div>
      
      {/* Slider container with gradient fade edges */}
      <div className="relative">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent pointer-events-none dark:from-slate-950" />
        
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent pointer-events-none dark:from-slate-950" />
        
        {/* Scrollable slider */}
        <div
          ref={sliderRef}
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="min-w-[140px] flex-shrink-0 snap-start animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <RecipeCard
                recipe={recipe}
                onSelect={() => navigate(`/recipe/${recipe.id}`)}
                size="compact"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

