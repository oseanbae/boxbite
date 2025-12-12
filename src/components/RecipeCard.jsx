export function SkeletonCard({ size = 'normal' }) {
  const isCompact = size === 'compact'
  return (
    <div className={`glass card-hover flex flex-col overflow-hidden rounded-xl ${isCompact ? 'p-2' : 'p-3'}`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-300 animate-pulse dark:bg-slate-800" />
      <div className={`${isCompact ? 'mt-2' : 'mt-4'} space-y-2`}>
        <div className={`w-3/4 rounded bg-slate-300 animate-pulse dark:bg-slate-800 ${isCompact ? 'h-3' : 'h-4'}`} />
        <div className={`w-1/2 rounded bg-slate-300 animate-pulse dark:bg-slate-800 ${isCompact ? 'h-2' : 'h-3'}`} />
      </div>
    </div>
  )
}

export default function RecipeCard({ recipe, onSelect, actionSlot, size = 'normal' }) {
  const isCompact = size === 'compact'

  return (
    <article
      className={`glass card-hover flex cursor-pointer flex-col overflow-hidden rounded-xl ${isCompact ? 'p-2' : 'p-3'}`}
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
      <div className={`${isCompact ? 'mt-2' : 'mt-3'} flex flex-1 flex-col gap-2`}>
        <div>
          <p className={`text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 ${isCompact ? 'hidden' : ''}`}>
            {recipe.category} • {recipe.area || 'Global'}
          </p>
          <h3 className={`mt-1 line-clamp-2 font-semibold text-slate-900 dark:text-white ${isCompact ? 'text-sm' : 'text-lg'}`}>
            {recipe.name}
          </h3>
        </div>
        {!isCompact && recipe.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-medium text-fuchsia-700 dark:text-fuchsia-200"
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


