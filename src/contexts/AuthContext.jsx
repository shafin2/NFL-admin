import { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const storedToken = localStorage.getItem('nfl_admin_token')
      const storedUser = localStorage.getItem('nfl_admin_user')
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
        // Set the token in API service
        apiService.setAuthToken(storedToken)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      // Clear invalid data
      localStorage.removeItem('nfl_admin_token')
      localStorage.removeItem('nfl_admin_user')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      setIsLoading(true)
      
      // Login with username and password
      const response = await apiService.adminLogin(username, password)
      
      if (response.success) {
        const { token, user } = response.data
        
        localStorage.setItem('nfl_admin_token', token)
        localStorage.setItem('nfl_admin_user', JSON.stringify(user))
        setToken(token)
        setUser(user)
        setIsAuthenticated(true)
        apiService.setAuthToken(token)
        toast.success('Login successful!')
        return { success: true }
      } else {
        toast.error(response.message || 'Invalid credentials')
        return { success: false, error: response.message || 'Invalid credentials' }
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('nfl_admin_token')
    localStorage.removeItem('nfl_admin_user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    apiService.setAuthToken(null)
    toast.success('Logged out successfully')
  }

  const value = {
    isAuthenticated,
    isLoading,
    token,
    user,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 