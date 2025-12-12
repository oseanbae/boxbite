export function SkeletonCard() {
  return (
    <div className="glass card-hover flex flex-col overflow-hidden rounded-xl p-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-800 animate-pulse" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-800 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-slate-800 animate-pulse" />
      </div>
    </div>
  )
}

export default function RecipeCard({ recipe, onSelect, actionSlot }) {
  return (
    <article
      className="glass card-hover flex cursor-pointer flex-col overflow-hidden rounded-xl p-3"
      onClick={onSelect}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
            {recipe.category} • {recipe.area || 'Global'}
          </p>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-white">
            {recipe.name}
          </h3>
        </div>
        {recipe.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-medium text-fuchsia-200"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {actionSlot ? <div className="mt-auto">{actionSlot}</div> : null}
      </div>
    </article>
  )
}

