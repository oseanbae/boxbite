/**
 * PagerDots - Dots indicator for slider pagination
 */
export default function PagerDots({ count, activeIndex, onDotClick }) {
  if (count <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`transition-all duration-200 ease-out rounded-full ${
            index === activeIndex
              ? 'w-8 h-2 bg-gradient-to-r from-fuchsia-500 to-amber-400'
              : 'w-2 h-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500'
          }`}
          aria-label={`Go to item ${index + 1}`}
        />
      ))}
    </div>
  )
}

