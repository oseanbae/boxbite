import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PlannerSlot from '../components/PlannerSlot'
import useMealDB from '../hooks/useMealDB'
import { weeklyPlan } from '../utils/weeklyPlan'
import { savePlanToFirestore, loadPlanFromFirestore } from '../firebase/config'
import PageFadeIn from '../components/PageFadeIn'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']

/**
 * Initialize empty slots structure (7 days, each with breakfast/lunch/dinner)
 */
function createEmptySlots() {
  return Array.from({ length: 7 }, () => ({
    breakfast: null,
    lunch: null,
    dinner: null,
  }))
}

/**
 * Calculate weekStart (Monday at 00:00:00) for a given date
 */
function getWeekStart(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dayOfWeek = d.getDay()
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  return d.toISOString()
}

/**
 * Get date for a specific day index (0-6) from weekStart
 */
function getDateForDay(weekStart, dayIndex) {
  const start = new Date(weekStart)
  start.setDate(start.getDate() + dayIndex)
  return start
}

/**
 * Firestore Schema:
 * Collection: users/{uid}/weekly_plans/{planId}
 * Document: { id, createdAt, weekStart, name?, categories, slots: [7 items] }
 */

export default function Planner() {
  const navigate = useNavigate()
  const { getMultipleRandom, getCategories, getFilteredRecipes, getMultipleByCategories, getRandomRecipe, getRecipeById } = useMealDB()
  
  // Current working plan state
  const [currentPlan, setCurrentPlan] = useState(null)
  const [weeklySlots, setWeeklySlots] = useState(createEmptySlots())
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [slotLoading, setSlotLoading] = useState(null) // format: "dayIndex-mealType"
  const [savedPlans, setSavedPlans] = useState([])
  const [showSaved, setShowSaved] = useState(false)
  const [feedback, setFeedback] = useState('')
  const uid = null // TODO: Replace with actual auth uid when available

  // Load current plan from localStorage on mount
  useEffect(() => {
    const loadCurrentPlan = async () => {
      try {
        // Try to load current working plan
        const saved = weeklyPlan.getCurrent()
        if (saved && saved.slots) {
          setCurrentPlan(saved)
          setWeeklySlots(saved.slots)
          setSelectedCategories(saved.categories || [])
        } else {
          // Initialize new plan
          const weekStart = getWeekStart()
          const newPlan = {
            id: null,
            createdAt: new Date().toISOString(),
            weekStart,
            categories: [],
            slots: createEmptySlots(),
          }
          setCurrentPlan(newPlan)
          weeklyPlan.saveCurrent(newPlan)
        }

        // Load saved plans list
        const plans = weeklyPlan.get()
        setSavedPlans(plans)
      } catch (error) {
        console.error('Error loading current plan:', error)
      }
    }

    loadCurrentPlan()

    // Load categories
    const loadCategories = async () => {
      const cats = await getCategories()
      setCategories(cats)
    }
    loadCategories()
  }, [getCategories])

  // Persist current plan to localStorage whenever it changes
  const persistCurrentPlan = useCallback(() => {
    if (currentPlan) {
      const updated = {
        ...currentPlan,
        slots: weeklySlots,
        categories: selectedCategories,
      }
      setCurrentPlan(updated)
      weeklyPlan.saveCurrent(updated)
      
      // Also save to Firestore if uid exists
      if (uid) {
        savePlanToFirestore(uid, updated).catch((err) => {
          console.warn('Failed to save to Firestore:', err)
        })
      }
    }
  }, [currentPlan, weeklySlots, selectedCategories, uid])

  // Update weeklySlots and persist
  const updateSlots = useCallback((newSlots) => {
    setWeeklySlots(newSlots)
    // Persist after state update
    setTimeout(() => {
      if (currentPlan) {
        const updated = {
          ...currentPlan,
          slots: newSlots,
          categories: selectedCategories,
        }
        setCurrentPlan(updated)
        weeklyPlan.saveCurrent(updated)
        if (uid) {
          savePlanToFirestore(uid, updated).catch((err) => {
            console.warn('Failed to save to Firestore:', err)
          })
        }
      }
    }, 0)
  }, [currentPlan, selectedCategories, uid])

  // Toggle category selection
  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
      return newCategories
    })
  }

  // Generate entire week (21 slots)
  const generateWeek = useCallback(async ({ fillEmptyOnly = false } = {}) => {
    setLoading(true)
    setFeedback('')
    try {
      const newSlots = [...weeklySlots]
      const slotsToFill = []

      // Collect all empty slots or all slots based on fillEmptyOnly
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        for (const mealType of MEAL_TYPES) {
          if (!fillEmptyOnly || !newSlots[dayIndex][mealType]) {
            slotsToFill.push({ dayIndex, mealType })
          }
        }
      }

      if (slotsToFill.length === 0) {
        setFeedback('All slots are filled! Use "Fill Empty" to only fill missing slots.')
        setLoading(false)
        return
      }

      let recipes = []

      if (selectedCategories.length > 0) {
        // Generate from selected categories
        const recipesNeeded = slotsToFill.length
        const recipesPerCategory = Math.ceil(recipesNeeded / selectedCategories.length)
        const categoryRecipes = await getMultipleByCategories(selectedCategories, recipesPerCategory)

        // If we don't have enough, fill with randoms
        if (categoryRecipes.length < recipesNeeded) {
          const additional = await getMultipleRandom(recipesNeeded - categoryRecipes.length)
          recipes = [...categoryRecipes, ...additional].slice(0, recipesNeeded)
        } else {
          // Shuffle and take what we need
          const shuffled = [...categoryRecipes].sort(() => Math.random() - 0.5)
          recipes = shuffled.slice(0, recipesNeeded)
        }
      } else {
        // No categories selected - use random recipes
        recipes = await getMultipleRandom(slotsToFill.length)
      }

      // Fill slots with recipes
      slotsToFill.forEach(({ dayIndex, mealType }, index) => {
        if (recipes[index]) {
          newSlots[dayIndex][mealType] = recipes[index]
        }
      })

      updateSlots(newSlots)
      setFeedback(
        `Generated ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} for ${fillEmptyOnly ? 'empty slots' : 'the week'}.`,
      )
      setTimeout(() => setFeedback(''), 3000)
    } catch (error) {
      console.error('Error generating week:', error)
      setFeedback('Failed to generate plan. Please try again.')
      setTimeout(() => setFeedback(''), 3000)
    } finally {
      setLoading(false)
    }
  }, [weeklySlots, selectedCategories, getMultipleByCategories, getMultipleRandom, updateSlots])

  // Generate single slot
  const generateSlot = useCallback(async (dayIndex, mealType) => {
    const loadingKey = `${dayIndex}-${mealType}`
    setSlotLoading(loadingKey)
    try {
      let recipe = null

      if (selectedCategories.length > 0) {
        // Pick random category and get one recipe from it
        const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)]
        const categoryRecipes = await getFilteredRecipes(randomCategory)
        if (categoryRecipes.length > 0) {
          const randomFromCategory = categoryRecipes[Math.floor(Math.random() * categoryRecipes.length)]
          // Fetch full details by ID
          if (randomFromCategory.id) {
            recipe = await getRecipeById(randomFromCategory.id)
          }
          // Fallback to random if category fetch fails or no ID
          if (!recipe) recipe = await getRandomRecipe()
        } else {
          recipe = await getRandomRecipe()
        }
      } else {
        recipe = await getRandomRecipe()
      }

      if (recipe) {
        const newSlots = [...weeklySlots]
        newSlots[dayIndex][mealType] = recipe
        updateSlots(newSlots)
      } else {
        setFeedback('Failed to generate recipe for this slot.')
        setTimeout(() => setFeedback(''), 2000)
      }
    } catch (error) {
      console.error('Error generating slot:', error)
      setFeedback('Failed to generate recipe. Please try again.')
      setTimeout(() => setFeedback(''), 2000)
    } finally {
      setSlotLoading(null)
    }
  }, [weeklySlots, selectedCategories, getFilteredRecipes, getRecipeById, getRandomRecipe, updateSlots])

  // Remove slot
  const removeSlot = useCallback((dayIndex, mealType) => {
    const newSlots = [...weeklySlots]
    newSlots[dayIndex][mealType] = null
    updateSlots(newSlots)
  }, [weeklySlots, updateSlots])

  // Add slot (opens menu in PlannerSlot)
  const addSlot = useCallback((dayIndex, mealType) => {
    generateSlot(dayIndex, mealType)
  }, [generateSlot])

  // Save plan to saved plans list
  const handleSavePlan = useCallback(async () => {
    const hasAnyRecipes = weeklySlots.some((day) =>
      MEAL_TYPES.some((mealType) => day[mealType] !== null),
    )
    if (!hasAnyRecipes) {
      setFeedback('No recipes to save. Generate a plan first.')
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    const planToSave = {
      ...currentPlan,
      slots: weeklySlots,
      categories: selectedCategories,
      weekStart: currentPlan?.weekStart || getWeekStart(),
    }

    const planId = weeklyPlan.save(planToSave)
    if (planId) {
      setCurrentPlan({ ...planToSave, id: planId })
      
      // Save to Firestore if uid exists
      if (uid) {
        try {
          await savePlanToFirestore(uid, { ...planToSave, id: planId })
        } catch (err) {
          console.warn('Failed to save to Firestore:', err)
        }
      }

      setSavedPlans(weeklyPlan.get())
      setFeedback('Plan saved!')
      setTimeout(() => setFeedback(''), 3000)
    }
  }, [currentPlan, weeklySlots, selectedCategories, uid])

  // Load plan from saved plans
  const handleLoadPlan = useCallback((plan) => {
    setWeeklySlots(plan.slots)
    setSelectedCategories(plan.categories || [])
    setCurrentPlan(plan)
    weeklyPlan.saveCurrent(plan)
    setShowSaved(false)
    setFeedback('Plan loaded!')
    setTimeout(() => setFeedback(''), 2000)
  }, [])

  // Delete plan
  const handleDeletePlan = useCallback((planId) => {
    weeklyPlan.delete(planId)
    setSavedPlans(weeklyPlan.get())
    setFeedback('Plan deleted!')
    setTimeout(() => setFeedback(''), 2000)
  }, [])

  // View slot recipe
  const handleViewSlot = useCallback((dayIndex, mealType) => {
    const recipe = weeklySlots[dayIndex][mealType]
    if (recipe) {
      navigate(`/recipe/${recipe.id}`)
    }
  }, [weeklySlots, navigate])

  const weekStart = currentPlan?.weekStart || getWeekStart()

  return (
    <PageFadeIn>
      <section className="pt-10">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
          Weekly Planner
        </p>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Plan your week, cook with ease
        </h2>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Generate a week&apos;s worth of meals (breakfast, lunch, dinner) or build your own
          custom plan. Save your plans for later and never wonder what to cook again.
        </p>
      </div>

      {/* Category selection */}
      <div className="glass mb-6 rounded-xl p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
          Category Preferences (Optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => handleCategoryToggle(cat)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-fuchsia-500 to-amber-400 text-slate-900 shadow-lg shadow-fuchsia-900/40'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="glass mb-6 flex flex-wrap gap-3 rounded-xl p-4">
        <button
          onClick={() => generateWeek({ fillEmptyOnly: false })}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              Generating...
            </>
          ) : (
            '🎲 Generate Week'
          )}
        </button>
        <button
          onClick={() => generateWeek({ fillEmptyOnly: true })}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Fill Empty
        </button>
        <button
          onClick={handleSavePlan}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          💾 Save Plan
        </button>
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          📋 {showSaved ? 'Hide' : 'View'} Saved Plans
        </button>
      </div>

      {feedback && (
        <div className="mb-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-100">
          {feedback}
        </div>
      )}

      {showSaved && savedPlans.length > 0 && (
        <div className="glass mb-6 rounded-xl p-4">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Saved Plans</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedPlans.map((plan) => {
              const recipeCount = plan.slots?.reduce(
                (count, day) =>
                  count +
                  MEAL_TYPES.filter((mealType) => day[mealType] !== null).length,
                0,
              ) || 0
              return (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {plan.name || new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {recipeCount} recipes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadPlan(plan)}
                      className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:brightness-110"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Table layout: rows = Days, columns = Meals */}
      <div className="glass overflow-x-auto rounded-xl p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 text-sm font-semibold text-slate-900 dark:text-white">Day</th>
              <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Breakfast</th>
              <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Lunch</th>
              <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Dinner</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayDate = getDateForDay(weekStart, dayIndex)
              const daySlots = weeklySlots[dayIndex] || { breakfast: null, lunch: null, dinner: null }
              return (
                <tr key={dayIndex} className="border-t border-slate-200 dark:border-white/10">
                  <td className="p-3">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Day {dayIndex + 1}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </td>
                  {MEAL_TYPES.map((mealType) => (
                    <td key={mealType} className="p-3">
                      <PlannerSlot
                        mealType={mealType}
                        recipe={daySlots[mealType]}
                        onView={() => handleViewSlot(dayIndex, mealType)}
                        onRemove={() => removeSlot(dayIndex, mealType)}
                        onAdd={() => addSlot(dayIndex, mealType)}
                        onSurprise={() => generateSlot(dayIndex, mealType)}
                        isLoading={slotLoading === `${dayIndex}-${mealType}`}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
    </PageFadeIn>
  )
}
