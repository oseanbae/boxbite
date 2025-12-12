export default function SearchBar({ value, onChange, onSubmit, isLoading = false }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim() && onSubmit) {
      onSubmit(value.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="glass flex items-center gap-3 rounded-xl p-4">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search recipes by name..."
          className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-fuchsia-400 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </div>
    </form>
  )
}

