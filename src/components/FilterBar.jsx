export default function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  onSurprise,
  isLoading,
}) {
  return (
    <div className="glass mb-6 flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
          Filters
        </p>
        <h2 className="text-xl font-semibold text-white">Find your next dish</h2>
      </div>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-fuchsia-400 focus:outline-none sm:w-48"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={onSurprise}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          🎲 Surprise Me
        </button>
      </div>
    </div>
  )
}


