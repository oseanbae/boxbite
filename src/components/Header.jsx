import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm transition-all duration-300 dark:border-white/5 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link 
          to="/" 
          className="group flex items-center gap-3 transition-transform duration-200 hover:scale-105"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-400 shadow-lg shadow-fuchsia-900/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-fuchsia-900/60 group-hover:scale-110" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 transition-colors duration-200 group-hover:text-fuchsia-600 dark:text-slate-400 dark:group-hover:text-fuchsia-300">
              Recipe discovery
            </p>
            <h1 className="text-lg font-bold text-slate-900 transition-colors duration-200 dark:text-white">
              Box
              <span className="bg-gradient-to-r from-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
                Bite
              </span>
            </h1>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                isActive
                  ? 'text-fuchsia-600 dark:text-fuchsia-300'
                  : 'text-slate-600 dark:text-slate-200'
              } hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/20 dark:hover:text-fuchsia-300`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">Home</span>
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-amber-400/10 animate-fadeIn" />
                )}
              </>
            )}
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                isActive
                  ? 'text-fuchsia-600 dark:text-fuchsia-300'
                  : 'text-slate-600 dark:text-slate-200'
              } hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/20 dark:hover:text-fuchsia-300`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">Search</span>
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-amber-400/10 animate-fadeIn" />
                )}
              </>
            )}
          </NavLink>
          <NavLink
            to="/pantry"
            className={({ isActive }) =>
              `relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                isActive
                  ? 'text-fuchsia-600 dark:text-fuchsia-300'
                  : 'text-slate-600 dark:text-slate-200'
              } hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/20 dark:hover:text-fuchsia-300`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">Pantry</span>
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-amber-400/10 animate-fadeIn" />
                )}
              </>
            )}
          </NavLink>
          <NavLink
            to="/planner"
            className={({ isActive }) =>
              `relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                isActive
                  ? 'text-fuchsia-600 dark:text-fuchsia-300'
                  : 'text-slate-600 dark:text-slate-200'
              } hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/20 dark:hover:text-fuchsia-300`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">Planner</span>
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-amber-400/10 animate-fadeIn" />
                )}
              </>
            )}
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                isActive
                  ? 'text-fuchsia-600 dark:text-fuchsia-300'
                  : 'text-slate-600 dark:text-slate-200'
              } hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/20 dark:hover:text-fuchsia-300`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">Favorites</span>
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-amber-400/10 animate-fadeIn" />
                )}
              </>
            )}
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                isActive
                  ? 'text-fuchsia-600 dark:text-fuchsia-300'
                  : 'text-slate-600 dark:text-slate-200'
              } hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/20 dark:hover:text-fuchsia-300`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">About</span>
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-amber-400/10 animate-fadeIn" />
                )}
              </>
            )}
          </NavLink>
          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden text-xs text-slate-600 transition-colors duration-200 dark:text-slate-400 sm:inline">
                {user.email}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 text-xs font-semibold text-slate-900 shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg">
                {getUserInitials()}
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-fuchsia-600 active:scale-95 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-fuchsia-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-fuchsia-600 active:scale-95 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-fuchsia-300"
            >
              Sign In
            </Link>
          )}
          <button
            onClick={toggleDarkMode}
            className="ml-2 rounded-lg p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-fuchsia-600 hover:rotate-12 active:scale-95 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-fuchsia-300"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  )
}


