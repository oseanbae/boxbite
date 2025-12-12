import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const navLinkClass =
  'px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-fuchsia-300 dark:text-slate-200'

export default function Header() {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('boxbite_dark_mode')
    return saved ? JSON.parse(saved) : true
  })

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('boxbite_dark_mode', JSON.stringify(darkMode))
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Get user initials for display
  const getUserInitials = () => {
    if (!user?.email) return '?'
    const parts = user.email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/5 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-400 shadow-lg shadow-fuchsia-900/50" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Recipe discovery
            </p>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Box
              <span className="bg-gradient-to-r from-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
                Bite
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
            to="/search"
            className={({ isActive }) =>
              `${navLinkClass} ${isActive ? 'text-fuchsia-300' : ''}`
            }
          >
            Search
          </NavLink>
          <NavLink
            to="/pantry"
            className={({ isActive }) =>
              `${navLinkClass} ${isActive ? 'text-fuchsia-300' : ''}`
            }
          >
            Pantry
          </NavLink>
          <NavLink
            to="/planner"
            className={({ isActive }) =>
              `${navLinkClass} ${isActive ? 'text-fuchsia-300' : ''}`
            }
          >
            Planner
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `${navLinkClass} ${isActive ? 'text-fuchsia-300' : ''}`
            }
          >
            Favorites
          </NavLink>
          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {user.email}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 text-xs font-semibold text-slate-900">
                {getUserInitials()}
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-fuchsia-300 dark:text-slate-200 dark:hover:bg-white/5"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-fuchsia-300 dark:text-slate-200 dark:hover:bg-white/5"
            >
              Sign In
            </Link>
          )}
          <button
            onClick={toggleDarkMode}
            className="ml-2 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-fuchsia-300 dark:text-slate-200 dark:hover:bg-white/5"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  )
}


