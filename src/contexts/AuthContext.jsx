import { createContext, useContext, useEffect, useState } from 'react'
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

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

