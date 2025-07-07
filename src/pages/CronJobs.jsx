import { useState, useEffect } from 'react'
import { 
  Clock, 
  Play, 
  RefreshCw, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  Database,
  Eye,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { apiService } from '../services/apiService'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Table from '../components/ui/Table'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

const CronJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    job_name: '',
    status: '',
    triggered_by: ''
  })
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchJobs()
  }, [filters])

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobHistory(filters);
  
      if (response.success) {
        const jobs = response.data?.jobs || [];

        const processedJobs = jobs.map(job => ({
          _id: job._id,
          job_name: job.job_name || job.jobName || 'unknown_job',
          job_type: job.job_type || job.jobType || 'unknown',
          status: job.status || 'unknown',
          triggered_by: job.triggered_by || job.triggeredBy || 'unknown',
          started_at: job.started_at || job.startedAt || null,
          completed_at: job.completed_at || job.completedAt || null,
          duration_ms: job.duration_ms || job.durationMs || null,
          result: job.result || null
        }));
        console.log(processedJobs)
        setJobs(processedJobs);
        setTotalPages(response.data?.pagination?.total_pages || 1);
      } else {
        toast.error(response.message || 'Failed to load job history');
      }
    } catch (error) {
      toast.error('Failed to load job history');
    } finally {
      setLoading(false);
    }
  };
  

  const handleTriggerJob = async (jobName) => {
    try {
      setTriggering(jobName)
      
      console.log(`🔄 Triggering job: ${jobName}`)
      
      const payload = {
        job_name: jobName,
        ...(jobName === 'nfl_schedule_fetch' && { season: '2024' })
      }
      
      const response = await apiService.triggerJob(payload)
      
      console.log('✅ Job trigger response:', response)
      
      if (response.success) {
        setMessage({
          type: 'success',
          text: `Job ${jobName} triggered successfully! Check the job history for details.`
        })
        
        setTimeout(() => {
          fetchJobs()
        }, 2000)
      } else {
        throw new Error(response.message || 'Unknown error occurred')
      }
      
    } catch (error) {
      console.error('❌ Error triggering job:', error)
      
      let errorMessage = 'Failed to trigger job'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      if (error.response?.data?.details) {
        errorMessage += ` - ${error.response.data.details.error}`
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      })
      
      if (errorMessage.includes('Configuration error') || errorMessage.includes('not configured')) {
        setMessage({
          type: 'error',
          text: `${errorMessage} Please check your .env file and ensure all required API keys are set.`
        })
      }
      
    } finally {
      setTriggering(null)
    }
  }

  const viewJobDetails = async (jobId) => {
    try {
      const response = await apiService.getJobDetails(jobId)
      if (response.success) {
        setSelectedJob(response.data)
        setShowJobModal(true)
      } else {
        toast.error('Failed to load job details')
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
      toast.error('Failed to load job details')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      job_name: '',
      status: '',
      triggered_by: ''
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '—'
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.warn('Date formatting error:', error)
      return '—'
    }
  }

  const formatDuration = (ms) => {
    if (!ms || isNaN(ms) || ms <= 0) return '—'
    try {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
      }
      return `${seconds}s`
    } catch (error) {
      console.warn('Duration formatting error:', error)
      return '—'
    }
  }

  const getStatusIcon = (status) => {
    if (!status) return <Clock className="w-4 h-4 text-gray-400" />
    
    switch (status.toLowerCase()) {
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    if (!status) {
      return `${baseClasses} bg-gray-100 text-gray-800`
    }
    
    switch (status.toLowerCase()) {
      case 'running':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'cancelled':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getJobTypeIcon = (jobName) => {
    if (!jobName) return <Database className="w-5 h-5 text-gray-500" />
    
    switch (jobName.toLowerCase()) {
      case 'nfl_news_fetch':
        return <Calendar className="w-5 h-5 text-blue-600" />
      case 'nfl_schedule_fetch':
        return <Activity className="w-5 h-5 text-green-600" />
      case 'manual_test':
        return <Database className="w-5 h-5 text-purple-600" />
      default:
        return <Database className="w-5 h-5 text-gray-500" />
    }
  }

  const getJobDisplayName = (jobName) => {
    if (!jobName || jobName === 'unknown_job') return 'Unknown Job'
    
    switch (jobName.toLowerCase()) {
      case 'nfl_news_fetch':
        return 'NFL News Fetcher'
      case 'nfl_schedule_fetch':
        return 'NFL Schedule Fetcher'
      case 'manual_test':
        return 'System Test'
      default:
        return jobName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getJobTypeDisplay = (jobType) => {
    if (!jobType || jobType === 'unknown') return 'Unknown Type'
    
    switch (jobType.toLowerCase()) {
      case 'scheduled':
        return 'Scheduled'
      case 'manual':
        return 'Manual'
      default:
        return jobType.charAt(0).toUpperCase() + jobType.slice(1)
    }
  }

  const getTriggerDisplay = (triggeredBy) => {
    if (!triggeredBy || triggeredBy === 'unknown') return 'Unknown'
    
    switch (triggeredBy.toLowerCase()) {
      case 'cron':
        return 'Scheduled'
      case 'admin_manual':
        return 'Manual (Admin)'
      case 'api_manual':
        return 'Manual (API)'
      default:
        return triggeredBy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const jobColumns = [
    {
      key: 'job_name',
      label: 'Job',
      render: (job) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {getJobTypeIcon(job?.job_name)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{getJobDisplayName(job)}</div>
            <div className="text-sm text-gray-500">{getJobTypeDisplay(job)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (job) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(job?.status)}
          <span className={getStatusBadge(job)}>
            {job}
          </span>
        </div>
      )
    },
    {
      key: 'started_at',
      label: 'Started',
      render: (job) => (
        <div className="text-sm text-gray-900">
          {formatDate(job)}
        </div>
      )
    },
    {
      key: 'completed_at',
      label: 'Completed',
      render: (job) => (
        <div className="text-sm text-gray-900">
          {formatDate(job)}
        </div>
      )
    },
    {
      key: 'duration_ms',
      label: 'Duration',
      render: (job) => (
        <div className="text-sm text-gray-900">
          {formatDuration(job)}
        </div>
      )
    },
    {
      key: 'result',
      label: 'Result',
      render: (job) => (
        <div className="text-sm">
          {job ? (
            <div>
              <div className="font-medium text-gray-900">
                {job.processed || 0} processed
              </div>
              <div className="text-gray-500">
                {job.upserted || 0} upserted, {job.errors || 0} errors
              </div>
            </div>
          ) : (
            <div className="text-gray-400">—</div>
          )}
        </div>
      )
    },
    {
      key: 'triggered_by',
      label: 'Trigger',
      render: (job) => (
        <span className="text-sm font-medium text-gray-700">
          {getTriggerDisplay(job)}
        </span>
      )
    },
    {
      key: '_id',
      label: 'Actions',
      render: (job) => (
        <Button
          onClick={() => viewJobDetails(job?._id)}
          variant="outline"
          size="sm"
          disabled={!job}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ]

  const jobNameOptions = [
    { value: '', label: 'All Jobs' },
    { value: 'nfl_news_fetch', label: 'NFL News Fetcher' },
    { value: 'nfl_schedule_fetch', label: 'NFL Schedule Fetcher' },
    { value: 'manual_test', label: 'System Test' }
  ]

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const triggerOptions = [
    { value: '', label: 'All Triggers' },
    { value: 'cron', label: 'Scheduled' },
    { value: 'admin_manual', label: 'Manual' },
    { value: 'api_manual', label: 'Manual (API)' }
  ]

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading job history..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cron Job Monitor</h1>
        <p className="text-gray-600">Detailed job history and management</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto p-1 hover:bg-gray-200 rounded"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Trigger Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Trigger Jobs</h2>
          <div className="flex gap-2">
            <Button onClick={fetchJobs} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">NFL News Fetcher</h3>
                <p className="text-sm text-gray-600">Fetch latest NFL news from API</p>
              </div>
            </div>
            <Button
              onClick={() => handleTriggerJob('nfl_news_fetch')}
              loading={triggering === 'nfl_news_fetch'}
              disabled={triggering !== null}
              size="sm"
            >
              <Play className="w-4 h-4" />
              Trigger
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">NFL Schedule Fetcher</h3>
                <p className="text-sm text-gray-600">Fetch NFL schedule from API</p>
              </div>
            </div>
            <Button
              onClick={() => handleTriggerJob('nfl_schedule_fetch')}
              loading={triggering === 'nfl_schedule_fetch'}
              disabled={triggering !== null}
              size="sm"
            >
              <Play className="w-4 h-4" />
              Trigger
            </Button>
          </div>
        </div>
      </div>

      {/* Job History Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Job History</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <Select
                    value={filters.job_name}
                    onChange={(e) => handleFilterChange('job_name', e.target.value)}
                    options={jobNameOptions}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    options={statusOptions}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                  <Select
                    value={filters.triggered_by}
                    onChange={(e) => handleFilterChange('triggered_by', e.target.value)}
                    options={triggerOptions}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end gap-2">
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" text="Loading jobs..." />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No job history available</p>
              <p className="text-sm text-gray-400">Jobs will appear here once executed</p>
            </div>
          ) : (
            <>
              <Table
                columns={jobColumns}
                data={jobs}
                onRowClick={(job) => job?._id && viewJobDetails(job._id)}
                rowClassName="hover:bg-gray-50 cursor-pointer"
              />
              
              <div className="mt-6">
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={(page) => setFilters({ ...filters, page })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <Modal
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          title={`Job Details - ${getJobDisplayName(selectedJob.job_name)}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusIcon(selectedJob.status)}
                  <span className={getStatusBadge(selectedJob.status)}>
                    {selectedJob.status ? selectedJob.status.toUpperCase() : 'UNKNOWN'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <p className="mt-1 text-sm text-gray-900">{formatDuration(selectedJob.duration_ms)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Started At</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedJob.started_at)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Completed At</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedJob.completed_at)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Triggered By</label>
                <p className="mt-1 text-sm text-gray-900">
                  {getTriggerDisplay(selectedJob.triggered_by)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Type</label>
                <p className="mt-1 text-sm text-gray-900">{getJobTypeDisplay(selectedJob.job_type)}</p>
              </div>
            </div>

            {/* Results */}
            {selectedJob.result && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Execution Results</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{selectedJob.result.processed || 0}</div>
                      <div className="text-xs text-gray-600">Processed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{selectedJob.result.upserted || 0}</div>
                      <div className="text-xs text-gray-600">Upserted</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{selectedJob.result.skipped || 0}</div>
                      <div className="text-xs text-gray-600">Skipped</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{selectedJob.result.errors || 0}</div>
                      <div className="text-xs text-gray-600">Errors</div>
                    </div>
                  </div>
                  {selectedJob.result.message && (
                    <div className="mt-3 text-sm text-gray-700">
                      <strong>Message:</strong> {selectedJob.result.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* API Calls */}
            {selectedJob.api_calls && selectedJob.api_calls.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">API Calls ({selectedJob.api_calls.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedJob.api_calls.map((call, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {call.service === 'rapidapi_nfl_news' ? 'NFL News API' : 
                             call.service === 'sportsblaze_schedule' ? 'Schedule API' : 
                             call.service || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-600 truncate">{call.endpoint || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            call.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {call.status_code || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600">{call.response_time_ms || 0}ms</div>
                        </div>
                      </div>
                      {!call.success && call.error_message && (
                        <div className="mt-2 text-xs text-red-600">{call.error_message}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logs */}
            {selectedJob.logs && selectedJob.logs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Execution Logs ({selectedJob.logs.length})</h3>
                <div className="bg-gray-900 p-4 rounded-lg max-h-64 overflow-y-auto">
                  {selectedJob.logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-gray-300 mb-1">
                      <span className="text-gray-500">{formatDate(log.timestamp)}</span>
                      {' '}
                      <span className={`${
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warn' ? 'text-yellow-400' :
                        log.level === 'info' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        [{(log.level || 'unknown').toUpperCase()}]
                      </span>
                      {' '}
                      {log.message || 'No message'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CronJobs 