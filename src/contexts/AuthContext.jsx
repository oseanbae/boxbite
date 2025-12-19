import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { onAuthStateChangedListener, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } from '../firebase/auth'
import { performMigrationIfNeeded } from '../utils/migrateLocalData'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const pendingActionRef = useRef(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((authUser) => {
      setUser(authUser)
      setLoading(false)

      // Run migration when user becomes non-null (signs in)
      if (authUser) {
        performMigrationIfNeeded(authUser.uid).catch((error) => {
          console.error('Migration error:', error)
          // Don't block user experience if migration fails
        })

        // If there's a pending action and user just logged in, execute it
        if (pendingActionRef.current) {
          pendingActionRef.current()
          pendingActionRef.current = null
          setAuthModalOpen(false)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    const result = await signInWithEmail(email, password)
    return result
  }

  const signup = async (email, password) => {
    const result = await signUpWithEmail(email, password)
    return result
  }

  const loginWithGoogle = async () => {
    const result = await signInWithGoogle()
    return result
  }

  const logout = async () => {
    await signOutUser()
  }

  /**
   * Require authentication before executing an action
   * If user is authenticated, executes actionCallback immediately
   * If not authenticated, opens auth modal and executes callback after login
   * @param {Function} actionCallback - Function to execute after authentication
   */
  const requireAuth = (actionCallback) => {
    if (user) {
      // User is authenticated, execute immediately
      actionCallback()
    } else {
      // User is not authenticated, open modal and queue action
      pendingActionRef.current = actionCallback
      setAuthModalOpen(true)
    }
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    pendingActionRef.current = null
  }

  const handleAuthSuccess = () => {
    // Action will be executed via useEffect when user state updates
    // This is just for closing the modal
  }

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    requireAuth,
    authModalOpen,
    handleAuthModalClose,
    handleAuthSuccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

