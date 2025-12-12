import { initializeApp } from 'firebase/app'
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAmm1_A2DINnVzyt0Nymyuf-Y7ex9sQyhE",
  authDomain: "boxbite.firebaseapp.com",
  projectId: "boxbite",
  storageBucket: "boxbite.firebasestorage.app",
  messagingSenderId: "449767181500",
  appId: "1:449767181500:web:e030ad738a045d4bc2d4b9"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

const storageKey = 'boxbite_favorites'

export const localFavorites = {
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

export const saveFavorite = async (uid, recipe) => {
  if (!uid) {
    localFavorites.add(recipe)
    return
  }

  const ref = doc(collection(db, 'users', uid, 'favorites'), recipe.id)
  await setDoc(ref, recipe, { merge: true })
}

export const getFavorites = async (uid) => {
  if (!uid) {
    return localFavorites.get()
  }

  const snapshot = await getDocs(collection(db, 'users', uid, 'favorites'))
  return snapshot.docs.map((docSnap) => docSnap.data())
}

export const removeFavorite = async (uid, id) => {
  if (!uid) {
    localFavorites.remove(id)
    return
  }

  const ref = doc(collection(db, 'users', uid, 'favorites'), id)
  await deleteDoc(ref)
}


