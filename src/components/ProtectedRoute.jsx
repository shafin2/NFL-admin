import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './ui/LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  try {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Authenticating..." />
        </div>
      )
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    return children
  } catch (error) {
    console.error('ProtectedRoute error:', error)
    return <Navigate to="/login" replace />
  }
}

export default ProtectedRoute 