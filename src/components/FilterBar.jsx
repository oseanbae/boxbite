export default function FilterBar({
  categories,
  selectedCategories = [],
  onCategoryToggle,
  onSurprise,
  isLoading,
}) {
  return (
    <div className="glass mb-6 flex flex-col gap-4 rounded-xl p-4 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
          Filters
        </p>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Find your next dish
        </h2>
      </div>

      {/* Category tiles */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => onCategoryToggle(cat)}
              disabled={isLoading}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.97] ${
                isSelected
                  ? 'bg-gradient-to-r from-fuchsia-500 to-amber-400 text-slate-900 shadow-lg shadow-fuchsia-900/40'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Surprise Me button */}
      <div className="flex justify-end">
        <button
          onClick={onSurprise}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-6 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition-all duration-200 ease-out hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              Loading...
            </>
          ) : (
            '🎲 Surprise Me'
          )}
        </button>
      </div>
    </div>
  )
}
