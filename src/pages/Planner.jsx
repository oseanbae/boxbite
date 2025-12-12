import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlannerCard from '../components/PlannerCard'
import useMealDB from '../hooks/useMealDB'
import { weeklyPlan } from '../utils/weeklyPlan'
import { getFavorites, saveFavorite, removeFavorite } from '../firebase/config'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Planner() {
  const navigate = useNavigate()
  const { getMultipleRandom, getCategories, getFilteredRecipes } = useMealDB()
  const [weeklyRecipes, setWeeklyRecipes] = useState(Array(7).fill(null))
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [savedPlans, setSavedPlans] = useState([])
  const [showSaved, setShowSaved] = useState(false)
  const [feedback, setFeedback] = useState('')
  const uid = null

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategories()
      setCategories(cats)
    }
    loadCategories()

    const loadSaved = async () => {
      const plans = weeklyPlan.get()
      setSavedPlans(plans)
    }
    loadSaved()
  }, [getCategories])

  const generatePlan = async () => {
    setLoading(true)
    setFeedback('')
    try {
      let recipes
      if (selectedCategory === 'all') {
        recipes = await getMultipleRandom(7)
      } else {
        const filtered = await getFilteredRecipes(selectedCategory)
        const shuffled = [...filtered].sort(() => Math.random() - 0.5)
        recipes = shuffled.slice(0, 7)
      }

      if (recipes.length < 7) {
        const randomFill = await getMultipleRandom(7 - recipes.length)
        recipes = [...recipes, ...randomFill].slice(0, 7)
      }

      setWeeklyRecipes([...recipes, ...Array(7).fill(null)].slice(0, 7))
      setFeedback('Weekly plan generated!')
      setTimeout(() => setFeedback(''), 3000)
    } catch (error) {
      console.error('Error generating plan:', error)
      setFeedback('Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlan = async () => {
    if (weeklyRecipes.every((r) => !r)) {
      setFeedback('No recipes to save. Generate a plan first.')
      return
    }
    const planId = weeklyPlan.save({ recipes: weeklyRecipes, category: selectedCategory })
    setSavedPlans(weeklyPlan.get())
    setFeedback('Plan saved!')
    setTimeout(() => setFeedback(''), 3000)
  }

  const handleLoadPlan = (plan) => {
    setWeeklyRecipes(plan.recipes)
    if (plan.category) setSelectedCategory(plan.category)
    setShowSaved(false)
    setFeedback('Plan loaded!')
    setTimeout(() => setFeedback(''), 2000)
  }

  const handleDeletePlan = (planId) => {
    weeklyPlan.delete(planId)
    setSavedPlans(weeklyPlan.get())
    setFeedback('Plan deleted!')
    setTimeout(() => setFeedback(''), 2000)
  }

  const handleRemoveRecipe = (index) => {
    const updated = [...weeklyRecipes]
    updated[index] = null
    setWeeklyRecipes(updated)
  }

  return (
    <section className="pt-10">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300">
          Weekly Planner
        </p>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Plan your week, cook with ease
        </h2>
        <p className="max-w-2xl text-slate-300">
          Generate a week&apos;s worth of recipes or build your own custom plan. Save
          your plans for later and never wonder what to cook again.
        </p>
      </div>

      <div className="glass mb-6 flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none sm:w-48"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-6 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                Generating...
              </>
            ) : (
              '🎲 Generate Weekly Plan'
            )}
          </button>
          {weeklyRecipes.some((r) => r) && (
            <button
              onClick={handleSavePlan}
              className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
            >
              💾 Save Plan
            </button>
          )}
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            📋 {showSaved ? 'Hide' : 'View'} Saved Plans
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {feedback}
        </div>
      )}

      {showSaved && savedPlans.length > 0 && (
        <div className="glass mb-6 rounded-xl p-4">
          <h3 className="mb-4 text-lg font-semibold text-white">Saved Plans</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {plan.recipes.filter(Boolean).length} recipes
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
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {DAYS.map((day, index) => (
          <PlannerCard
            key={day}
            day={day}
            recipe={weeklyRecipes[index]}
            onViewDetails={() => {
              if (weeklyRecipes[index]) {
                navigate(`/recipe/${weeklyRecipes[index].id}`)
              }
            }}
            onRemove={
              weeklyRecipes[index]
                ? () => handleRemoveRecipe(index)
                : undefined
            }
          />
        ))}
      </div>
    </section>
  )
}

