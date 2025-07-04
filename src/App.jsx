import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import News from './pages/News'
import Channels from './pages/Channels'
import Settings from './pages/Settings'
import CronJobs from './pages/CronJobs'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import MatchDetail from './pages/MatchDetail'
import NewsDetail from './pages/NewsDetail'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/matches" element={
              <ProtectedRoute>
                <Layout>
                  <Matches />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/news" element={
              <ProtectedRoute>
                <Layout>
                  <News />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/channels" element={
              <ProtectedRoute>
                <Layout>
                  <Channels />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cron-jobs" element={
              <ProtectedRoute>
                <Layout>
                  <CronJobs />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/matches/:id" element={
              <ProtectedRoute>
                <Layout>
                  <MatchDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/news/:id" element={
              <ProtectedRoute>
                <Layout>
                  <NewsDetail />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 