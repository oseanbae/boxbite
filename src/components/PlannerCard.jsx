export default function PlannerCard({ day, recipe, onViewDetails, onRemove }) {
  if (!recipe) {
    return (
      <div className="glass flex flex-col rounded-xl p-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          {day}
        </p>
        <div className="mt-4 text-slate-500">No recipe</div>
      </div>
    )
  }

  return (
    <div className="glass card-hover flex flex-col overflow-hidden rounded-xl">
      <div className="p-3 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {day}
        </p>
      </div>
      <div className="relative h-48 w-full overflow-hidden rounded-lg">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{recipe.name}</h3>
        {recipe.category && (
          <p className="text-xs text-slate-400">{recipe.category}</p>
        )}
        <div className="mt-auto flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-3 py-2 text-xs font-semibold text-slate-900 shadow shadow-fuchsia-900/40 transition hover:brightness-110"
          >
            View
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

