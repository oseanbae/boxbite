import { useAuth } from '../contexts/AuthContext'
import AuthGateModal from './AuthGateModal'

/**
 * Wrapper component that renders the AuthGateModal based on AuthContext state
 * This should be placed inside AuthProvider in App.jsx
 */
export default function AuthGate() {
  const { authModalOpen, handleAuthModalClose, handleAuthSuccess } = useAuth()

  return (
    <AuthGateModal
      isOpen={authModalOpen}
      onClose={handleAuthModalClose}
      onSuccess={handleAuthSuccess}
    />
  )
}

