import axios from 'axios'

const BASE_URL = 'http://localhost:3000'

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response.data
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear auth data and redirect to login
          localStorage.removeItem('nfl_admin_token')
          localStorage.removeItem('nfl_admin_user')
          this.authToken = null
          window.location.href = '/login'
        }
        return Promise.reject(error.response?.data || error.message)
      }
    )
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

  // Cron Jobs
  async getCronJobsStatus() {
    return await this.api.get('/admin/cron/status')
  }

  async triggerCronJob(jobName) {
    return await this.api.post(`/admin/cron/trigger/${jobName}`)
  }
}

export const apiService = new ApiService() 