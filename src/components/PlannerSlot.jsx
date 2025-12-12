import { useState } from 'react'

/**
 * PlannerSlot - Represents a single meal slot (breakfast/lunch/dinner)
 */
export default function PlannerSlot({
  mealType,
  recipe,
  onView,
  onRemove,
  onAdd,
  onSurprise,
  isLoading = false,
}) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  if (recipe) {
    return (
      <div className="glass rounded-lg border border-slate-200 dark:border-white/10 p-3">
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {mealType}
          </p>
        </div>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-2">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
          {recipe.name}
        </h4>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-2 py-1.5 text-xs font-semibold text-slate-900 shadow shadow-fuchsia-900/40 transition hover:brightness-110"
          >
            View
          </button>
          <button
            onClick={onRemove}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-lg border border-dashed border-slate-300 dark:border-white/20 p-3">
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {mealType}
        </p>
      </div>
      <div className="relative">
        {showAddMenu ? (
          <div className="space-y-2">
            <button
              onClick={() => {
                setShowAddMenu(false)
                if (onSurprise) onSurprise()
              }}
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-3 py-2 text-xs font-semibold text-slate-900 shadow shadow-fuchsia-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? '...' : '🎲 Surprise'}
            </button>
            <button
              onClick={() => {
                setShowAddMenu(false)
                if (onAdd) onAdd()
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Choose...
            </button>
            <button
              onClick={() => setShowAddMenu(false)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMenu(true)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            + Add {mealType}
          </button>
        )}
      </div>
    </div>
  )
}

