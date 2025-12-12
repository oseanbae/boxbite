import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Persistent page state hook - saves state to localStorage and restores on mount
 * Similar pattern to Planner's persistence
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if no saved state
 * @param {Object} options - { debounceMs: 200, scrollKey: 'scroll' }
 * @returns {[state, setState, restoreScroll]}
 */
export default function usePersistentPageState(key, initialValue, options = {}) {
  const { debounceMs = 200, scrollKey = `${key}_scroll` } = options
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })
  const debounceTimerRef = useRef(null)
  const isRestoringRef = useRef(false)

  // Save state to localStorage (debounced)
  const saveState = useCallback((newState) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(newState))
      } catch (error) {
        console.error(`Error saving state for ${key}:`, error)
      }
    }, debounceMs)
  }, [key, debounceMs])

  // Update state and persist
  const updateState = useCallback((newState) => {
    setState((prev) => {
      const updated = typeof newState === 'function' ? newState(prev) : newState
      if (!isRestoringRef.current) {
        saveState(updated)
      }
      return updated
    })
  }, [saveState])

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    try {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      localStorage.setItem(scrollKey, scrollY.toString())
    } catch (error) {
      console.error(`Error saving scroll position for ${scrollKey}:`, error)
    }
  }, [scrollKey])

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    try {
      const savedScroll = localStorage.getItem(scrollKey)
      if (savedScroll) {
        const scrollY = parseInt(savedScroll, 10)
        // Restore after a short delay to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' })
        }, 100)
      }
    } catch (error) {
      console.error(`Error restoring scroll position for ${scrollKey}:`, error)
    }
  }, [scrollKey])

  // Save scroll on scroll event (debounced)
  useEffect(() => {
    let scrollTimer = null
    const handleScroll = () => {
      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }
      scrollTimer = setTimeout(() => {
        saveScrollPosition()
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }
    }
  }, [saveScrollPosition])

  // Restore scroll on mount
  useEffect(() => {
    restoreScrollPosition()
  }, [restoreScrollPosition])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return [state, updateState, restoreScrollPosition]
}

