import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from './config'

/**
 * Save a favorite recipe to Firestore
 * Returns resolved promise if uid is falsy (no-op)
 * @param {string|null} uid - User ID
 * @param {Object} recipe - Recipe object
 * @returns {Promise<void>}
 */
export const saveFavoriteToFirestore = async (uid, recipe) => {
  if (!uid) {
    return Promise.resolve()
  }

  try {
    const ref = doc(collection(db, 'users', uid, 'favorites'), recipe.id)
    await setDoc(ref, recipe, { merge: true })
  } catch (error) {
    console.error('Error saving favorite to Firestore:', error)
    throw error
  }
}

/**
 * Get all favorites from Firestore
 * Returns empty array if uid is falsy
 * @param {string|null} uid - User ID
 * @returns {Promise<Array>}
 */
export const getFavoritesFromFirestore = async (uid) => {
  if (!uid) {
    return Promise.resolve([])
  }

  try {
    const snapshot = await getDocs(collection(db, 'users', uid, 'favorites'))
    return snapshot.docs.map((docSnap) => docSnap.data())
  } catch (error) {
    console.error('Error getting favorites from Firestore:', error)
    return []
  }
}

/**
 * Remove a favorite from Firestore
 * Returns resolved promise if uid is falsy (no-op)
 * @param {string|null} uid - User ID
 * @param {string} recipeId - Recipe ID
 * @returns {Promise<void>}
 */
export const removeFavoriteFromFirestore = async (uid, recipeId) => {
  if (!uid) {
    return Promise.resolve()
  }

  try {
    const ref = doc(collection(db, 'users', uid, 'favorites'), recipeId)
    await deleteDoc(ref)
  } catch (error) {
    console.error('Error removing favorite from Firestore:', error)
    throw error
  }
}

/**
 * Save a weekly plan to Firestore
 * Returns resolved promise if uid is falsy (no-op)
 * @param {string|null} uid - User ID
 * @param {Object} plan - Plan object with id, createdAt, weekStart, name, categories, slots
 * @returns {Promise<void>}
 */
export const savePlanToFirestore = async (uid, plan) => {
  if (!uid || !plan || !plan.id) {
    return Promise.resolve()
  }

  try {
    const ref = doc(collection(db, 'users', uid, 'weekly_plans'), plan.id)
    await setDoc(ref, {
      id: plan.id,
      createdAt: plan.createdAt || new Date().toISOString(),
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
 * Get all weekly plans from Firestore
 * Returns empty array if uid is falsy
 * @param {string|null} uid - User ID
 * @returns {Promise<Array>}
 */
export const getPlansFromFirestore = async (uid) => {
  if (!uid) {
    return Promise.resolve([])
  }

  try {
    const snapshot = await getDocs(collection(db, 'users', uid, 'weekly_plans'))
    return snapshot.docs.map((docSnap) => docSnap.data())
  } catch (error) {
    console.error('Error getting plans from Firestore:', error)
    return []
  }
}

/**
 * Delete a weekly plan from Firestore
 * Returns resolved promise if uid is falsy (no-op)
 * @param {string|null} uid - User ID
 * @param {string} planId - Plan ID
 * @returns {Promise<void>}
 */
export const deletePlanFromFirestore = async (uid, planId) => {
  if (!uid || !planId) {
    return Promise.resolve()
  }

  try {
    const ref = doc(collection(db, 'users', uid, 'weekly_plans'), planId)
    await deleteDoc(ref)
  } catch (error) {
    console.error('Error deleting plan from Firestore:', error)
    throw error
  }
}

