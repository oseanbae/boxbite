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

/**
 * Save a weekly plan to Firestore
 * Collection: users/{uid}/weekly_plans/{planId}
 * @param {string|null} uid - User ID, if null does nothing (returns gracefully)
 * @param {Object} plan - Plan object with id, createdAt, weekStart, name, categories, slots
 * @returns {Promise<void>}
 */
export const savePlanToFirestore = async (uid, plan) => {
  if (!uid) {
    // Gracefully return if no uid - localStorage fallback is used
    return
  }

  if (!plan || !plan.id) {
    throw new Error('Plan must have an id')
  }

  try {
    const ref = doc(collection(db, 'users', uid, 'weekly_plans'), plan.id)
    await setDoc(ref, {
      id: plan.id,
      createdAt: plan.createdAt,
      weekStart: plan.weekStart,
      name: plan.name || null,
      categories: plan.categories || [],
      slots: plan.slots || [],
    }, { merge: true })
  } catch (error) {
    console.error('Error saving plan to Firestore:', error)
    throw error
  }
}

/**
 * Load a weekly plan from Firestore
 * @param {string|null} uid - User ID, if null returns null
 * @param {string} planId - Plan ID
 * @returns {Promise<Object|null>}
 */
export const loadPlanFromFirestore = async (uid, planId) => {
  if (!uid || !planId) {
    return null
  }

  try {
    const ref = doc(collection(db, 'users', uid, 'weekly_plans'), planId)
    const docSnap = await getDocs(collection(db, 'users', uid, 'weekly_plans'))
    const plan = docSnap.docs.find((d) => d.id === planId)
    return plan ? plan.data() : null
  } catch (error) {
    console.error('Error loading plan from Firestore:', error)
    return null
  }
}

/**
 * Load all weekly plans from Firestore for a user
 * @param {string|null} uid - User ID, if null returns []
 * @returns {Promise<Array>}
 */
export const getAllPlansFromFirestore = async (uid) => {
  if (!uid) {
    return []
  }

  try {
    const snapshot = await getDocs(collection(db, 'users', uid, 'weekly_plans'))
    return snapshot.docs.map((docSnap) => docSnap.data())
  } catch (error) {
    console.error('Error loading plans from Firestore:', error)
    return []
  }
}

/**
 * Delete a weekly plan from Firestore
 * @param {string|null} uid - User ID, if null does nothing
 * @param {string} planId - Plan ID
 * @returns {Promise<void>}
 */
export const deletePlanFromFirestore = async (uid, planId) => {
  if (!uid || !planId) {
    return
  }

  try {
    const ref = doc(collection(db, 'users', uid, 'weekly_plans'), planId)
    await deleteDoc(ref)
  } catch (error) {
    console.error('Error deleting plan from Firestore:', error)
    throw error
  }
}
