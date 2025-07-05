import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Newspaper, 
  Tv, 
  Users,
  TrendingUp,
  Activity,
  PlayCircle,
  Star,
  Clock,
  Settings
} from 'lucide-react'
import { apiService } from '../services/apiService'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Simple Chart Component
const PieChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    )
  }

  let accumulatedPercentage = 0
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    const startAngle = accumulatedPercentage * 3.6 // Convert to degrees
    const segmentData = {
      ...item,
      percentage,
      startAngle,
      color: `hsl(${(index * 137) % 360}, 70%, 50%)`
    }
    accumulatedPercentage += percentage
    
    return segmentData
  })

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <div className="flex items-center justify-between">
        <div className="w-32 h-32 relative">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            {segments.map((segment, index) => {
              const circumference = 2 * Math.PI * 40
              const strokeDasharray = (segment.percentage / 100) * circumference
              const strokeDashoffset = circumference - (segment.startAngle / 360) * circumference
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="8"
                  strokeDasharray={`${strokeDasharray} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{total}</span>
          </div>
        </div>
        <div className="flex-1 ml-6 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-600 flex-1">{segment.label}</span>
              <span className="text-sm font-medium text-gray-900">{segment.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDashboardData()
      if (response.success) {
        setDashboardData(response.data)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 text-red-700 hover:text-red-900 font-medium"
        >
          Try again
        </button>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Matches',
      value: dashboardData?.matches?.total || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      subStats: [
        { label: 'Live', value: dashboardData?.matches?.live || 0 },
        { label: 'Upcoming', value: dashboardData?.matches?.upcoming || 0 },
        { label: 'Replays', value: dashboardData?.matches?.replay || 0 }
      ]
    },
    {
      name: 'News Articles',
      value: dashboardData?.news?.total || 0,
      icon: Newspaper,
      color: 'bg-green-500',
      subStats: [
        { label: 'Featured', value: dashboardData?.news?.featured || 0 }
      ]
    },
    {
      name: 'Channels',
      value: dashboardData?.channels?.total || 0,
      icon: Tv,
      color: 'bg-purple-500',
      subStats: [
        { label: 'Active', value: dashboardData?.channels?.active || 0 }
      ]
    },
    {
      name: 'System Status',
      value: 'Online',
      icon: Activity,
      color: 'bg-primary-600',
      subStats: []
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-teal-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to NFL Admin Panel</h1>
        <p className="text-primary-100">
          Manage your NFL app content, matches, news, and settings from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {stat.subStats.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    {stat.subStats.map((subStat) => (
                      <div key={subStat.label} className="text-center">
                        <p className="text-xs text-gray-500">{subStat.label}</p>
                        <p className="text-sm font-semibold text-gray-900">{subStat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <a 
              href="/matches" 
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Matches</p>
                <p className="text-sm text-gray-500">Add, edit, or update match schedules</p>
              </div>
            </a>
            
            <a 
              href="/news" 
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="bg-green-100 p-2 rounded-lg">
                <Newspaper className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage News</p>
                <p className="text-sm text-gray-500">Create and publish news articles</p>
              </div>
            </a>
            
            <a 
              href="/settings" 
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="bg-purple-100 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">App Settings</p>
                <p className="text-sm text-gray-500">Configure app preferences</p>
              </div>
            </a>

            <a 
              href="/cron-jobs" 
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="bg-primary-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Cron Jobs</p>
                <p className="text-sm text-gray-500">Monitor background tasks</p>
              </div>
            </a>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Connected
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Data Sync</span>
                <span className="text-sm text-gray-900">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Healthy
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button 
                  onClick={fetchDashboardData}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matches by Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <PieChart
            title="Matches by Status"
            data={[
              { label: 'Live', value: dashboardData?.matches?.live || 0 },
              { label: 'Upcoming', value: dashboardData?.matches?.upcoming || 0 },
              { label: 'Completed', value: dashboardData?.matches?.completed || 0 },
              { label: 'Replay', value: dashboardData?.matches?.replay || 0 }
            ]}
          />
        </div>

        {/* Content Overview Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <PieChart
            title="Content Distribution"
            data={[
              { label: 'Total Matches', value: dashboardData?.matches?.total || 0 },
              { label: 'News Articles', value: dashboardData?.news?.total || 0 },
              { label: 'Channels', value: dashboardData?.channels?.total || 0 }
            ]}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dashboardData?.recentActivity?.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Activity className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500 mt-1">
                  Activity will appear here as you manage content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 