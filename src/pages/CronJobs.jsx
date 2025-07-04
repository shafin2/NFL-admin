import { useState, useEffect } from 'react'
import { Clock, Play, RefreshCw, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { apiService } from '../services/apiService'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const CronJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(null)

  useEffect(() => {
    fetchJobsStatus()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchJobsStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchJobsStatus = async () => {
    try {
      const response = await apiService.getCronJobsStatus()
      if (response.success) {
        // The backend returns { total, running, jobs: [] }
        setJobs(response.data?.jobs || [])
      } else {
        toast.error('Failed to load cron jobs status')
      }
    } catch (error) {
      console.error('Error fetching cron jobs:', error)
      toast.error('Failed to load cron jobs status')
    } finally {
      setLoading(false)
    }
  }

  const triggerJob = async (jobName) => {
    try {
      setTriggering(jobName)
      const response = await apiService.triggerCronJob(jobName)
      if (response.success) {
        toast.success(`${jobName} job triggered successfully`)
        // Refresh status after triggering
        setTimeout(fetchJobsStatus, 2000)
      } else {
        toast.error(response.message || `Failed to trigger ${jobName} job`)
      }
    } catch (error) {
      console.error('Error triggering job:', error)
      toast.error(`Failed to trigger ${jobName} job`)
    } finally {
      setTriggering(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getJobStatus = (job) => {
    if (!job) return 'unknown'
    if (job.running) return 'running'
    if (job.lastRun && !job.lastError) return 'success'
    if (job.lastError) return 'error'
    return 'idle'
  }

  const findJobByName = (name) => {
    if (!Array.isArray(jobs)) return null
    return jobs.find(j => j.name && j.name.toLowerCase().includes(name.toLowerCase()))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'idle':
        return <Clock className="w-5 h-5 text-gray-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (status) {
      case 'running':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'idle':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading cron jobs..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cron Job Monitor</h1>
        <p className="text-gray-600">Monitor and manage automated background jobs</p>
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={fetchJobsStatus} variant="outline">
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NFL News Job */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">NFL News Fetcher</h3>
                  <p className="text-sm text-gray-600">Fetches latest NFL news articles</p>
                </div>
              </div>
              {getStatusIcon(getJobStatus(findJobByName('news')))}
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className={getStatusBadge(getJobStatus(findJobByName('news')))}>
                {getJobStatus(findJobByName('news')).toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Run</span>
                <span className="font-medium">
                  {formatDate(findJobByName('news')?.lastRun)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Run</span>
                <span className="font-medium">
                  {formatDate(findJobByName('news')?.nextRun)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Schedule</span>
                <span className="font-medium font-mono text-xs">
                  {findJobByName('news')?.schedule || 'Every 30 minutes'}
                </span>
              </div>
            </div>

            {findJobByName('news')?.lastError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">
                  <strong>Last Error:</strong> {findJobByName('news').lastError}
                </p>
              </div>
            )}

            <Button
              onClick={() => triggerJob('news')}
              loading={triggering === 'news'}
              disabled={triggering !== null}
              variant="outline"
              className="w-full"
            >
              <Play className="w-4 h-4" />
              Trigger Manually
            </Button>
          </div>
        </div>

        {/* NFL Schedule Job */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Match Schedule Updater</h3>
                  <p className="text-sm text-gray-600">Updates NFL match schedules and scores</p>
                </div>
              </div>
              {getStatusIcon(getJobStatus(findJobByName('schedule')))}
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className={getStatusBadge(getJobStatus(findJobByName('schedule')))}>
                {getJobStatus(findJobByName('schedule')).toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Run</span>
                <span className="font-medium">
                  {formatDate(findJobByName('schedule')?.lastRun)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Run</span>
                <span className="font-medium">
                  {formatDate(findJobByName('schedule')?.nextRun)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Schedule</span>
                <span className="font-medium font-mono text-xs">
                  {findJobByName('schedule')?.schedule || 'Every hour'}
                </span>
              </div>
            </div>

            {findJobByName('schedule')?.lastError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">
                  <strong>Last Error:</strong> {findJobByName('schedule').lastError}
                </p>
              </div>
            )}

            <Button
              onClick={() => triggerJob('schedule')}
              loading={triggering === 'schedule'}
              disabled={triggering !== null}
              variant="outline"
              className="w-full"
            >
              <Play className="w-4 h-4" />
              Trigger Manually
            </Button>
          </div>
        </div>
      </div>

      {/* Job History/Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {!Array.isArray(jobs) || jobs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No cron job data available</p>
              <p className="text-sm text-gray-500 mt-1">
                Jobs will appear here once they start running
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(getJobStatus(job))}
                    <div>
                      <p className="font-medium text-gray-900">{job.name || `Job ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">
                        {job.lastRun ? `Last run: ${formatDate(job.lastRun)}` : 'Never run'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={getStatusBadge(getJobStatus(job))}>
                      {getJobStatus(job).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CronJobs 