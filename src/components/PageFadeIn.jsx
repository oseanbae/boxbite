import { useEffect, useState } from 'react'

/**
 * PageFadeIn - Wrapper component for page fade-in and slide-up animation
 */
export default function PageFadeIn({ children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  )
}

