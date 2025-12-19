/*
 * TEST CHECKLIST:
 * 1. Start app unauthenticated — favorites & planner operate via localStorage.
 * 2. Sign up / Sign in — migration runs once; verify Firestore contains data.
 * 3. Sign in on another machine or incognito — verify data syncs from Firestore.
 * 4. Update favorite on device A — verify change visible on device B after reload.
 * 5. Delete a plan in Firestore, verify it's removed on other devices.
 */

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PlannerSlot from '../components/PlannerSlot'
import useMealDB from '../hooks/useMealDB'
import { weeklyPlan } from '../utils/weeklyPlan'
import { useAuth } from '../contexts/AuthContext'
import {
  savePlanToFirestore,
  getPlansFromFirestore,
  deletePlanFromFirestore,
} from '../firebase/firestoreHelpers'
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
  const { user, requireAuth } = useAuth()
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
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [planName, setPlanName] = useState('')

  // Load current plan from localStorage/Firestore on mount
  useEffect(() => {
    const loadCurrentPlan = async () => {
      try {
        if (user?.uid) {
          // Load from Firestore if authenticated
          const firestorePlans = await getPlansFromFirestore(user.uid)
          setSavedPlans(firestorePlans)
          
          // Try to load current working plan from localStorage first (user might be working on it)
          const saved = weeklyPlan.getCurrent()
          if (saved && saved.slots) {
            setCurrentPlan(saved)
            setWeeklySlots(saved.slots)
            setSelectedCategories(saved.categories || [])
            // Sync current plan to Firestore
            if (saved.id && user?.uid) {
              await savePlanToFirestore(user.uid, saved)
            }
          } else if (firestorePlans.length > 0) {
            // Load the most recent plan from Firestore as current
            const mostRecent = firestorePlans.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            )[0]
            setCurrentPlan(mostRecent)
            setWeeklySlots(mostRecent.slots || createEmptySlots())
            setSelectedCategories(mostRecent.categories || [])
            weeklyPlan.saveCurrent(mostRecent)
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
        } else {
          // Load from localStorage if not authenticated (temporary session only)
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

          // Do NOT load saved plans list for unauthenticated users
          setSavedPlans([])
        }
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
  }, [getCategories, user])

  // Persist current plan to localStorage whenever it changes
  const persistCurrentPlan = useCallback(() => {
    if (currentPlan) {
      const updated = {
        ...currentPlan,
        slots: weeklySlots,
        categories: selectedCategories,
      }
      setCurrentPlan(updated)
      // Always save to localStorage immediately
      weeklyPlan.saveCurrent(updated)
      
      // Also save to Firestore if user is authenticated
      if (user?.uid && updated.id) {
        savePlanToFirestore(user.uid, updated).catch((err) => {
          console.warn('Failed to save to Firestore:', err)
        })
      }
    }
  }, [currentPlan, weeklySlots, selectedCategories, user])

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
        // Always save to localStorage immediately
        weeklyPlan.saveCurrent(updated)
        // Also save to Firestore if user is authenticated and plan has ID
        if (user?.uid && updated.id) {
          savePlanToFirestore(user.uid, updated).catch((err) => {
            console.warn('Failed to save to Firestore:', err)
          })
        }
      }
    }, 0)
  }, [currentPlan, selectedCategories, user])

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
  const handleSavePlan = useCallback(async (name) => {
    requireAuth(async () => {
      if (!user?.uid) return

      const planToSave = {
        ...currentPlan,
        slots: weeklySlots,
        categories: selectedCategories,
        weekStart: currentPlan?.weekStart || getWeekStart(),
        name: name || `Plan ${new Date().toLocaleDateString()}`,
      }

      const planId = weeklyPlan.save(planToSave)
      if (planId) {
        const savedPlan = { ...planToSave, id: planId }
        setCurrentPlan(savedPlan)
        
        // Save to Firestore
        try {
          await savePlanToFirestore(user.uid, savedPlan)
          // Refresh saved plans from Firestore
          const firestorePlans = await getPlansFromFirestore(user.uid)
          setSavedPlans(firestorePlans)
        } catch (err) {
          console.warn('Failed to save to Firestore:', err)
          // Fallback to localStorage plans
          setSavedPlans(weeklyPlan.get())
        }

        setShowSaveDialog(false)
        setPlanName('')
        setFeedback('Plan saved!')
        setTimeout(() => setFeedback(''), 3000)
      }
    })
  }, [currentPlan, weeklySlots, selectedCategories, user, requireAuth])

  const handleSavePlanClick = useCallback(() => {
    const hasAnyRecipes = weeklySlots.some((day) =>
      MEAL_TYPES.some((mealType) => day[mealType] !== null),
    )
    if (!hasAnyRecipes) {
      setFeedback('No recipes to save. Generate a plan first.')
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    // If plan already has a name, save directly; otherwise show dialog
    if (currentPlan?.name) {
      handleSavePlan(currentPlan.name)
    } else {
      setPlanName(`Week of ${new Date(currentPlan?.weekStart || getWeekStart()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
      setShowSaveDialog(true)
    }
  }, [currentPlan, weeklySlots, handleSavePlan])

  // Load plan from saved plans
  const handleLoadPlan = useCallback((plan) => {
    requireAuth(() => {
      if (!user?.uid) return

      setWeeklySlots(plan.slots || createEmptySlots())
      setSelectedCategories(plan.categories || [])
      setCurrentPlan(plan)
      // Always save to localStorage
      weeklyPlan.saveCurrent(plan)
      // Also sync to Firestore if authenticated
      if (plan.id) {
        savePlanToFirestore(user.uid, plan).catch((err) => {
          console.warn('Failed to sync plan to Firestore:', err)
        })
      }
      setShowSaved(false)
      setFeedback('Plan loaded!')
      setTimeout(() => setFeedback(''), 2000)
    })
  }, [user, requireAuth])

  // Delete plan
  const handleDeletePlan = useCallback(async (planId) => {
    requireAuth(async () => {
      if (!user?.uid) return

      // Delete from localStorage
      weeklyPlan.delete(planId)
      
      // Delete from Firestore
      try {
        await deletePlanFromFirestore(user.uid, planId)
        // Refresh from Firestore
        const firestorePlans = await getPlansFromFirestore(user.uid)
        setSavedPlans(firestorePlans)
      } catch (err) {
        console.warn('Failed to delete from Firestore:', err)
        // Refresh from Firestore again (don't use localStorage fallback)
        try {
          const firestorePlans = await getPlansFromFirestore(user.uid)
          setSavedPlans(firestorePlans)
        } catch (retryErr) {
          console.error('Failed to refresh plans after delete:', retryErr)
          setSavedPlans([])
        }
      }
      
      setFeedback('Plan deleted!')
      setTimeout(() => setFeedback(''), 2000)
    })
  }, [user, requireAuth])

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
          onClick={handleSavePlanClick}
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

      {showSaved && (
        <div className="glass mb-6 rounded-xl p-4 animate-fadeIn">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Saved Plans {user?.uid ? `(${savedPlans.length})` : ''}
          </h3>
          {!user?.uid ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-slate-900/50">
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                Sign in to view and manage your saved weekly plans.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                You can still generate and plan meals, but saved plans require authentication.
              </p>
            </div>
          ) : savedPlans.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {savedPlans.map((plan, index) => {
                const recipeCount = plan.slots?.reduce(
                  (count, day) =>
                    count +
                    MEAL_TYPES.filter((mealType) => day[mealType] !== null).length,
                  0,
                ) || 0
                const weekStartDate = plan.weekStart ? new Date(plan.weekStart) : new Date(plan.createdAt)
                const isCurrentPlan = currentPlan?.id === plan.id
                return (
                  <div
                    key={plan.id}
                    className={`group relative flex flex-col rounded-lg border p-4 transition-all duration-200 ${
                      isCurrentPlan
                        ? 'border-fuchsia-500 bg-fuchsia-50/50 dark:border-fuchsia-400 dark:bg-fuchsia-950/30'
                        : 'border-slate-200 bg-white hover:border-fuchsia-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:hover:border-fuchsia-500/50'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="mb-3 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {plan.name || `Week of ${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </p>
                        {isCurrentPlan && (
                          <span className="rounded-full bg-fuchsia-500 px-2 py-0.5 text-xs font-semibold text-white">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {recipeCount} recipes • {weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadPlan(plan)}
                        className="flex-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow shadow-fuchsia-900/40 transition-all duration-200 hover:brightness-110 active:scale-95"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-slate-900/50">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No saved plans yet. Create and save a plan to get started!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Save Plan Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="glass w-full max-w-md rounded-xl p-6 shadow-xl animate-slideUp">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Save Weekly Plan
            </h3>
            <div className="mb-4">
              <label htmlFor="planName" className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                Plan Name
              </label>
              <input
                id="planName"
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 transition focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePlan(planName)
                  } else if (e.key === 'Escape') {
                    setShowSaveDialog(false)
                    setPlanName('')
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSavePlan(planName)}
                className="flex-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition-all duration-200 hover:brightness-110 active:scale-95"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setPlanName('')
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
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
                    <td key={mealType} className="p-3 w-1/3 min-w-[140px]">
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
