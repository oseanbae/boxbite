import { useState } from 'react'

export default function IngredientInput({ onAdd, ingredients = [] }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed && !ingredients.includes(trimmed.toLowerCase())) {
      onAdd(trimmed.toLowerCase())
      setInput('')
    }
  }

  const handleRemove = (ingredient) => {
    const updated = ingredients.filter((ing) => ing !== ingredient)
    onAdd(updated)
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="glass flex items-center gap-3 rounded-xl p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add an ingredient..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-fuchsia-400 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </form>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient) => (
            <span
              key={ingredient}
              className="group inline-flex items-center gap-2 rounded-full bg-fuchsia-500/15 px-4 py-2 text-sm font-medium text-fuchsia-700 transition hover:bg-fuchsia-500/25 dark:text-fuchsia-200"
            >
              {ingredient}
              <button
                onClick={() => handleRemove(ingredient)}
                className="ml-1 rounded-full p-0.5 transition hover:bg-fuchsia-500/30"
                aria-label={`Remove ${ingredient}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {ingredients.length > 0 && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onAdd([])}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  )
}

