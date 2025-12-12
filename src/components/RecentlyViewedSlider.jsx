import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import RecipeCard, { SkeletonCard } from './RecipeCard'
import useMealDB from '../hooks/useMealDB'
import { recent } from '../utils/recent'
import PagerDots from './PagerDots'

/**
 * RecentlyViewedSlider - Horizontal slider with snap scrolling for recently viewed recipes
 */
export default function RecentlyViewedSlider() {
  const navigate = useNavigate()
  const { getRecipeById } = useMealDB()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const sliderRef = useRef(null)
  const cardRefs = useRef([])
  const rafRef = useRef(null)

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

  // Update active index based on scroll position
  const updateActiveIndex = useCallback(() => {
    if (!sliderRef.current || recipes.length === 0) return

    const container = sliderRef.current
    const scrollLeft = container.scrollLeft
    const containerWidth = container.clientWidth
    const itemWidth = 140 + 12 // min-w-[140px] + gap-3 (12px)

    // Calculate which item is most visible
    const index = Math.round(scrollLeft / itemWidth)
    const clampedIndex = Math.min(Math.max(0, index), recipes.length - 1)

    setActiveIndex(clampedIndex)
  }, [recipes.length])

  // Throttled scroll handler
  useEffect(() => {
    if (!sliderRef.current || recipes.length === 0) return

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(updateActiveIndex)
    }

    const container = sliderRef.current
    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [recipes.length, updateActiveIndex])

  // Scroll to specific index
  const scrollToIndex = useCallback((index) => {
    if (!sliderRef.current || recipes.length === 0) return

    const container = sliderRef.current
    const itemWidth = 140 + 12 // min-w-[140px] + gap-3 (12px)
    const scrollLeft = index * itemWidth

    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    })
  }, [recipes.length])

  // Navigate prev/next
  const scrollPrev = useCallback(() => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1)
    }
  }, [activeIndex, scrollToIndex])

  const scrollNext = useCallback(() => {
    if (activeIndex < recipes.length - 1) {
      scrollToIndex(activeIndex + 1)
    }
  }, [activeIndex, recipes.length, scrollToIndex])

  // Update initial active index after load
  useEffect(() => {
    if (!loading && recipes.length > 0) {
      updateActiveIndex()
    }
  }, [loading, recipes.length, updateActiveIndex])

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
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
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

  const showArrows = recipes.length > 4 // Only show arrows if more items than visible
  const canScrollPrev = activeIndex > 0
  const canScrollNext = activeIndex < recipes.length - 1

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

        {/* Prev arrow */}
        {showArrows && canScrollPrev && (
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-lg transition-all duration-200 ease-out hover:bg-white hover:scale-110 active:scale-95 dark:bg-slate-800/90 dark:hover:bg-slate-800"
            aria-label="Previous"
          >
            <svg
              className="h-5 w-5 text-slate-900 dark:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Next arrow */}
        {showArrows && canScrollNext && (
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-lg transition-all duration-200 ease-out hover:bg-white hover:scale-110 active:scale-95 dark:bg-slate-800/90 dark:hover:bg-slate-800"
            aria-label="Next"
          >
            <svg
              className="h-5 w-5 text-slate-900 dark:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* Scrollable slider with visible scrollbar for accessibility */}
        <div
          ref={sliderRef}
          className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(148, 163, 184, 0.5) transparent',
          }}
        >
          <style>{`
            .overflow-x-auto::-webkit-scrollbar {
              height: 8px;
            }
            .overflow-x-auto::-webkit-scrollbar-track {
              background: transparent;
            }
            .overflow-x-auto::-webkit-scrollbar-thumb {
              background-color: rgba(148, 163, 184, 0.5);
              border-radius: 4px;
            }
            .overflow-x-auto::-webkit-scrollbar-thumb:hover {
              background-color: rgba(148, 163, 184, 0.7);
            }
            .dark .overflow-x-auto::-webkit-scrollbar-thumb {
              background-color: rgba(100, 116, 139, 0.5);
            }
            .dark .overflow-x-auto::-webkit-scrollbar-thumb:hover {
              background-color: rgba(100, 116, 139, 0.7);
            }
          `}</style>
          {recipes.map((recipe, index) => (
            <div
              key={recipe.id}
              ref={(el) => (cardRefs.current[index] = el)}
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

      {/* Pager dots */}
      <PagerDots
        count={recipes.length}
        activeIndex={activeIndex}
        onDotClick={scrollToIndex}
      />
    </section>
  )
}
