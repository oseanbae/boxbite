import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useMealDB from '../hooks/useMealDB'
import { parseIngredients } from '../utils/parseIngredients'
import {
  getFavorites,
  removeFavorite,
  saveFavorite,
} from '../firebase/config'
import { recent } from '../utils/recent'

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecipeById } = useMealDB()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [favorites, setFavorites] = useState([])
  const uid = null

  useEffect(() => {
    const load = async () => {
      const data = await getRecipeById(id)
      setRecipe(data)
      setLoading(false)
      if (data?.id) {
        recent.add(data.id)
      }
    }
    load()
  }, [id, getRecipeById])

  useEffect(() => {
    const loadFavorites = async () => {
      const favs = await getFavorites(uid)
      setFavorites(favs)
    }
    loadFavorites()
  }, [uid])

  const handleSave = async () => {
    if (!recipe) return
    await saveFavorite(uid, recipe)
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === recipe.id)
      if (exists) return prev
      return [...prev, recipe]
    })
    setToast('Recipe saved to favorites')
    setTimeout(() => setToast(''), 2400)
  }

  const handleRemove = async () => {
    if (!recipe) return
    await removeFavorite(uid, recipe.id)
    setFavorites((prev) => prev.filter((item) => item.id !== recipe.id))
    setToast('Removed from favorites')
    setTimeout(() => setToast(''), 2400)
  }

  if (loading) {
    return (
      <section className="pt-10">
        <div className="glass h-64 animate-pulse rounded-2xl" />
      </section>
    )
  }

  if (!recipe) {
    return (
      <section className="pt-10">
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-rose-100">
          Recipe not found.
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm font-semibold text-fuchsia-300 underline"
        >
          Go back
        </button>
      </section>
    )
  }

  const ingredients = parseIngredients(recipe.raw)
  const isFavorite = favorites.some((item) => item.id === recipe.id)

  return (
    <section className="pt-10">
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-4 p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {recipe.category} • {recipe.area || 'Global'}
                </p>
                <h2 className="text-3xl font-bold text-white">{recipe.name}</h2>
                {recipe.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-medium text-fuchsia-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={isFavorite ? handleRemove : handleSave}
                  className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-fuchsia-900/40 transition hover:brightness-110"
                >
                  {isFavorite ? 'Remove Favorite' : 'Save to Favorites'}
                </button>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">
                  Ingredients
                </h3>
                <ul className="space-y-2 text-sm text-slate-200">
                  {ingredients.map((item) => (
                    <li
                      key={`${item.ingredient}-${item.measure}`}
                      className="flex items-center gap-3 rounded-lg bg-slate-900/60 px-3 py-2"
                    >
                      <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                      <span className="flex-1">{item.ingredient}</span>
                      <span className="text-slate-400">{item.measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">
                  Instructions
                </h3>
                <div className="space-y-3 text-sm leading-relaxed text-slate-200">
                  {recipe.instructions
                    ?.split('\n')
                    .filter((line) => line.trim().length)
                    .map((line, idx) => (
                      <p key={idx} className="rounded-lg bg-slate-900/60 p-3">
                        {line}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-fuchsia-200 shadow-lg shadow-fuchsia-900/40">
          {toast}
        </div>
      ) : null}
    </section>
  )
}


