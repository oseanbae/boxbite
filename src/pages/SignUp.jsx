import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PageFadeIn from '../components/PageFadeIn'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signup(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to sign up with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageFadeIn>
      <section className="pt-10">
        <div className="mx-auto max-w-md">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
              Sign Up
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Create your account
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Join BoxBite to sync your favorites and weekly plans across all your devices.
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 transition focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 transition focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Creating account...' : 'Create Account'}
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
              Sign up with Google
            </button>

            <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-fuchsia-600 hover:underline dark:text-fuchsia-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </PageFadeIn>
  )
}

