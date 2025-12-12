import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth'
import app from './config'

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
}

/**
 * Sign up with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signUpWithEmail = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password)
}

/**
 * Sign in with Google
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider)
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  return firebaseSignOut(auth)
}

/**
 * Set up auth state change listener
 * @param {function} callback - Called with user object (or null when signed out)
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback)
}

