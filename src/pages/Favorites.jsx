import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import { useAuth } from '../contexts/AuthContext'
import {
  getFavoritesFromFirestore,
  removeFavoriteFromFirestore,
  saveFavoriteToFirestore,
} from '../firebase/firestoreHelpers'

// LocalStorage fallback functions
const storageKey = 'boxbite_favorites'

const localFavorites = {
  get: () => {
    const data = localStorage.getItem(storageKey)
    return data ? JSON.parse(data) : []
  },
  add: (recipe) => {
    const existing = localFavorites.get()
    if (existing.some((item) => item.id === recipe.id)) return
    const updated = [...existing, recipe]
    localStorage.setItem(storageKey, JSON.stringify(updated))
  },
  remove: (id) => {
    const filtered = localFavorites.get().filter((item) => item.id !== id)
    localStorage.setItem(storageKey, JSON.stringify(filtered))
  },
}

export default function Favorites() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const load = async () => {
      if (user?.uid) {
        // Load from Firestore
        const data = await getFavoritesFromFirestore(user.uid)
        setFavorites(data)
      } else {
        // Load from localStorage
        const data = localFavorites.get()
        setFavorites(data)
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleRemove = async (id) => {
    if (user?.uid) {
      await removeFavoriteFromFirestore(user.uid, id)
    } else {
      localFavorites.remove(id)
    }
    setFavorites((prev) => prev.filter((item) => item.id !== id))
    setFeedback('Removed from favorites')
    setTimeout(() => setFeedback(''), 2000)
  }

  const handleSave = async (recipe) => {
    if (user?.uid) {
      await saveFavoriteToFirestore(user.uid, recipe)
    } else {
      localFavorites.add(recipe)
    }
    setFeedback('Saved to favorites')
    setTimeout(() => setFeedback(''), 2000)
  }

  return (
    <section className="pt-10">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-600 dark:text-fuchsia-300">
          Favorites
        </p>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Your saved dishes
        </h2>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Saved recipes live in Firestore when authenticated. Otherwise they sit
          safely in your browser using localStorage.
        </p>
      </div>

      {feedback ? (
        <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-100">
          {feedback}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="glass h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-900/80"
            />
          ))}
        </div>
      ) : favorites.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={() => navigate(`/recipe/${recipe.id}`)}
              actionSlot={
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(recipe.id)
                    }}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Remove
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSave(recipe)
                    }}
                    className="flex-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-3 py-2 text-xs font-semibold text-slate-900 shadow shadow-fuchsia-900/40"
                  >
                    Keep
                  </button>
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-slate-700 dark:border-white/5 dark:bg-slate-900/70 dark:text-slate-200">
          <p>No favorites yet. Save a recipe to get started.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-sm font-semibold text-fuchsia-600 underline dark:text-fuchsia-300"
          >
            Browse recipes
          </button>
        </div>
      )}
    </section>
  )
}


