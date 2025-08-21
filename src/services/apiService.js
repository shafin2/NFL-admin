import axios from 'axios'

// const BASE_URL = 'https://nfl-backend.vercel.app/api'
const BASE_URL = 'http://4.240.89.48'

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    })

    // Create a separate instance for long-running operations like jobs
    this.longRunningApi = axios.create({
      baseURL: BASE_URL,
      timeout: 120000, // 2 minutes for job operations
    })

    // Request interceptor to add auth token
    const requestInterceptor = (config) => {
      const token = this.getAuthToken()
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      return config
    }

    // Response interceptor for error handling
    const responseInterceptor = (response) => {
      return response.data
    }

    const errorInterceptor = (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid, clear auth data and redirect to login
        localStorage.removeItem('nfl_admin_token')
        localStorage.removeItem('nfl_admin_user')
        this.authToken = null
        window.location.href = '/login'
      }
      return Promise.reject(error.response?.data || error.message)
    }

    // Apply interceptors to both instances
    this.api.interceptors.request.use(requestInterceptor)
    this.api.interceptors.response.use(responseInterceptor, errorInterceptor)
    
    this.longRunningApi.interceptors.request.use(requestInterceptor)
    this.longRunningApi.interceptors.response.use(responseInterceptor, errorInterceptor)
  }

  setAuthToken(token) {
    this.authToken = token
  }

  getAuthToken() {
    return this.authToken || localStorage.getItem('nfl_admin_token')
  }

  // Authentication
  async adminLogin(username, password) {
    try {
      const response = await axios.post(`${BASE_URL}/admin/login`, {
        username,
        password
      }, {
        timeout: 5000
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Dashboard
  async getDashboardData() {
    return await this.api.get('/admin/dashboard')
  }

  // Matches
  async getMatches(params = {}) {
    return await this.api.get('/admin/matches', { params })
  }

  async getMatch(id) {
    return await this.api.get(`/admin/matches/${id}`)
  }

  async createMatch(data) {
    return await this.api.post('/admin/matches', data)
  }

  async updateMatch(id, data) {
    return await this.api.put(`/admin/matches/${id}`, data)
  }

  async deleteMatch(id) {
    return await this.api.delete(`/admin/matches/${id}`)
  }

  async getChannelsForDropdown() {
    return await this.api.get('/admin/matches/channels/dropdown')
  }

  // News
  async getNews(params = {}) {
    return await this.api.get('/admin/news', { params })
  }

  async getNewsItem(id) {
    return await this.api.get(`/admin/news/${id}`)
  }

  async createNews(data) {
    return await this.api.post('/admin/news', data)
  }

  async updateNews(id, data) {
    return await this.api.put(`/admin/news/${id}`, data)
  }

  async deleteNews(id) {
    return await this.api.delete(`/admin/news/${id}`)
  }

  // Channels
  async getChannels(params = {}) {
    return await this.api.get('/admin/channels', { params })
  }

  async getChannel(id) {
    return await this.api.get(`/admin/channels/${id}`)
  }

  async createChannel(data) {
    return await this.api.post('/admin/channels', data)
  }

  async updateChannel(id, data) {
    return await this.api.put(`/admin/channels/${id}`, data)
  }

  async deleteChannel(id) {
    return await this.api.delete(`/admin/channels/${id}`)
  }

  // App Settings
  async getAppSettings() {
    return await this.api.get('/admin/app-settings')
  }

  async updateAppSettings(data) {
    return await this.api.put('/admin/app-settings', data)
  }

  // Job History - Using longer timeout for job operations
  async getJobHistory(params = {}) {
    return await this.api.get('/admin/jobs', { params })
  }

  async getJobDetails(id) {
    return await this.api.get(`/admin/jobs/${id}`)
  }

  async getJobStats() {
    return await this.api.get('/admin/jobs/stats')
  }

  async getApiStats() {
    return await this.api.get('/admin/jobs/api-stats')
  }

  async resetApiStats() {
    return await this.longRunningApi.post('/admin/jobs/api-stats/reset')
  }

  // Use long-running API for job triggers (can take 1-2 minutes)
  async triggerJob(data) {
    return await this.longRunningApi.post('/admin/jobs/trigger', data)
  }

  async cancelJob(id) {
    return await this.longRunningApi.put(`/admin/jobs/${id}/cancel`)
  }

  async cleanupJobHistory(data) {
    return await this.longRunningApi.delete('/admin/jobs/cleanup', { data })
  }

  async getCronJobsStatus() {
    return await this.api.get('/admin/cron/status')
  }

  async triggerCronJob(jobName) {
    return await this.longRunningApi.post(`/admin/cron/trigger/${jobName}`)
  }

  // Notifications
  async sendNotification(data) {
    // data: { title, body, link }
    return await this.api.post('/admin/notifications/send', data)
  }
}

export const apiService = new ApiService() 