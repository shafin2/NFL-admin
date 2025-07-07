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
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  Database,
  RefreshCw,
  Zap,
  Server,
  Globe
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
    accumulatedPercentage += percentage
    
    return {
      ...item,
      percentage,
      startAngle,
      color: `hsl(${(index * 137) % 360}, 70%, 50%)`
    }
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
              const strokeDashoffset = circumference - (accumulatedPercentage / 100) * circumference
              
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
  const [data, setData] = useState(null)
  const [jobStats, setJobStats] = useState(null)
  const [apiStats, setApiStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, jobStatsResponse, apiStatsResponse] = await Promise.all([
        apiService.getDashboardData(),
        apiService.getJobStats(),
        apiService.getApiStats()
      ])

      if (dashboardResponse.success) {
        setData(dashboardResponse.data)
      }
      if (jobStatsResponse.success) {
        setJobStats(jobStatsResponse.data)
      }
      if (apiStatsResponse.success) {
        setApiStats(apiStatsResponse.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms) => {
    if (!ms || isNaN(ms)) return 'N/A'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-teal-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to NFL Admin Panel</h1>
        <p className="text-primary-100">
          Manage your NFL app content, matches, news, Jobs and settings from here.
        </p>
      </div>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Matches */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900">{data?.matches?.total || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-green-600">{data?.matches?.live || 0}</div>
              <div className="text-gray-500">Live</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">{data?.matches?.upcoming || 0}</div>
              <div className="text-gray-500">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">{data?.matches?.replay || 0}</div>
              <div className="text-gray-500">Replay</div>
            </div>
          </div>
        </div>

        {/* News */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total News</p>
              <p className="text-2xl font-bold text-gray-900">{data?.news?.total || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Latest articles from NFL sources
          </div>
        </div>

        {/* Channels */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Channels</p>
              <p className="text-2xl font-bold text-gray-900">{data?.channels?.total || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Streaming channels configured
          </div>
        </div>

        {/* Jobs Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jobs (24h)</p>
              <p className="text-2xl font-bold text-gray-900">{jobStats?.summary?.recent_jobs_24h || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-500">{jobStats?.summary?.success_rate_30d || 0}% Success</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-blue-500" />
              <span className="text-gray-500">{jobStats?.summary?.running_jobs || 0} Running</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Performance & API Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Job Performance</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Jobs Executed</span>
              <span className="text-lg font-bold text-gray-900">{jobStats?.summary?.total_jobs || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Average Duration</span>
              <span className="text-lg font-bold text-gray-900">{formatDuration(jobStats?.summary?.avg_duration_ms)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Success Rate (30d)</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">{jobStats?.summary?.success_rate_30d || 0}%</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>

            {/* Job Types */}
            {jobStats?.by_job_name && jobStats.by_job_name.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-gray-600">Recent Job Types</div>
                {jobStats.by_job_name.map((job, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {job.job_name === 'nfl_news_fetch' ? 'News Fetch' : 
                         job.job_name === 'nfl_schedule_fetch' ? 'Schedule Fetch' : 
                         job.job_name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {job.total_runs} runs • {job.success_rate}% success
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* API Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">API Statistics</h2>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total API Calls</span>
              <span className="text-lg font-bold text-gray-900">{apiStats?.totalCalls || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Success Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">
                  {apiStats?.totalCalls > 0 ? Math.round((apiStats.successfulCalls / apiStats.totalCalls) * 100) : 0}%
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Avg Response Time</span>
              <span className="text-lg font-bold text-gray-900">{apiStats?.averageResponseTime || 0}ms</span>
            </div>

            {/* API Service Breakdown */}
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium text-gray-600">API Service Breakdown</div>
              
              {/* News API */}
              {apiStats?.callsByService?.rapidapi_nfl_news && (
                <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">NFL News API</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {apiStats.callsByService.rapidapi_nfl_news.total} calls • {apiStats.callsByService.rapidapi_nfl_news.averageResponseTime || 0}ms avg
                  </div>
                </div>
              )}
              
              {/* Schedule API */}
              {apiStats?.callsByService?.sportsblaze_schedule && (
                <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Schedule API</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {apiStats.callsByService.sportsblaze_schedule.total} calls • {apiStats.callsByService.sportsblaze_schedule.averageResponseTime || 0}ms avg
                  </div>
                </div>
              )}
              
              {/* Show empty state if no API calls */}
              {(!apiStats?.callsByService?.rapidapi_nfl_news?.total && !apiStats?.callsByService?.sportsblaze_schedule?.total) && (
                <div className="text-center py-4 text-gray-500">
                  <Server className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No API calls made yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <Zap className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/matches"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Manage Matches</div>
              <div className="text-sm text-gray-500">Add or edit matches</div>
            </div>
          </a>
          
          <a
            href="/news"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">Manage News</div>
              <div className="text-sm text-gray-500">Add or edit news</div>
            </div>
          </a>
          
          <a
            href="/channels"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Manage Channels</div>
              <div className="text-sm text-gray-500">Configure channels</div>
            </div>
          </a>
          
          <a
            href="/cron-jobs"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Activity className="w-5 h-5 text-orange-600" />
            <div>
              <div className="font-medium text-gray-900">Cron Jobs</div>
              <div className="text-sm text-gray-500">View job details</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 