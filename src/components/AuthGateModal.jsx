import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthGateModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      setEmail('')
      setPassword('')
      onClose()
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      await loginWithGoogle()
      onClose()
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="glass w-full max-w-md rounded-xl p-6 shadow-xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
            Sign In Required
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Sign in to save
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Sign in to save favorites and weekly plans across devices.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-email" className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
              Email
            </label>
            <input
              id="modal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 transition focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="modal-password" className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
              Password
            </label>
            <input
              id="modal-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 transition focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-4">
          <div className="flex-1 border-t border-slate-300 dark:border-white/10" />
          <span className="text-xs text-slate-500 dark:text-slate-400">OR</span>
          <div className="flex-1 border-t border-slate-300 dark:border-white/10" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Sign in with Google
        </button>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-fuchsia-600 hover:underline dark:text-fuchsia-300" onClick={onClose}>
            Sign up
          </Link>
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

