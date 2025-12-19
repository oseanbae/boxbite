import { useState } from 'react'

export function SkeletonCard({ size = 'normal', variant }) {
  const isCompact = size === 'compact'
  const isPlanner = variant === 'planner'
  
  // Fixed heights for consistency
  const imageHeight = isPlanner
    ? 'h-20' // Fixed height for planner
    : isCompact
    ? 'h-24'
    : 'h-48' // Fixed height for normal cards

  return (
    <div className={`glass card-hover flex flex-col overflow-hidden rounded-xl shadow-sm ${isCompact ? 'p-2' : 'p-3'}`}>
      <div className={`relative w-full overflow-hidden rounded-lg bg-slate-300 animate-pulse dark:bg-slate-800 ${imageHeight}`} />
      <div className={`${isCompact ? 'mt-2' : 'mt-4'} space-y-2`}>
        <div className={`w-3/4 rounded bg-slate-300 animate-pulse dark:bg-slate-800 ${isCompact ? 'h-3' : 'h-4'}`} />
        <div className={`w-1/2 rounded bg-slate-300 animate-pulse dark:bg-slate-800 ${isCompact ? 'h-2' : 'h-3'}`} />
      </div>
    </div>
  )
}

export default function RecipeCard({ recipe, onSelect, actionSlot, size = 'normal', variant }) {
  const isCompact = size === 'compact'
  const isPlanner = variant === 'planner'
  const [imageLoaded, setImageLoaded] = useState(false)

  // Fixed heights for consistency
  const imageHeight = isPlanner
    ? 'h-20' // Fixed height for planner (matches PlannerSlot)
    : isCompact
    ? 'h-24'
    : 'h-48' // Fixed height for normal cards

  return (
    <article
      className={`glass card-hover flex cursor-pointer flex-col overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ease-out hover:scale-[1.02] animate-fadeIn ${isCompact ? 'p-2' : 'p-3'}`}
      onClick={onSelect}
    >
      <div className={`relative w-full overflow-hidden rounded-lg ${imageHeight}`}>
        <img
          src={recipe.image}
          alt={recipe.name}
          className={`h-full w-full object-cover object-center transition-all duration-300 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } hover:scale-105`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-300 animate-pulse dark:bg-slate-800" />
        )}
      </div>
      <div className={`${isCompact ? 'mt-2' : 'mt-3'} flex flex-1 flex-col gap-2`}>
        <div>
          <p className={`text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 ${isCompact || isPlanner ? 'hidden' : ''}`}>
            {recipe.category} • {recipe.area || 'Global'}
          </p>
          <h3 className={`mt-1 line-clamp-2 font-semibold text-slate-900 dark:text-white transition-colors duration-200 ${isCompact || isPlanner ? 'text-sm' : 'text-lg'}`}>
            {recipe.name}
          </h3>
        </div>
        {!isCompact && !isPlanner && recipe.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-medium text-fuchsia-700 dark:text-fuchsia-200 transition-all duration-200"
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
