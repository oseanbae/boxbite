import { Link, NavLink } from 'react-router-dom'

const navLinkClass =
  'px-4 py-2 text-sm font-semibold text-slate-200 transition hover:text-fuchsia-300'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-400 shadow-lg shadow-fuchsia-900/50" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Recipe roulette
            </p>
            <h1 className="text-lg font-bold text-white">
              Ano
              <span className="bg-gradient-to-r from-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
                Ulam?
              </span>
            </h1>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navLinkClass} ${isActive ? 'text-fuchsia-300' : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `${navLinkClass} ${isActive ? 'text-fuchsia-300' : ''}`
            }
          >
            Favorites
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

