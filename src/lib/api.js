// API utility functions for frontend
// File: /src/lib/api.js

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app/api' 
  : 'http://localhost:5173/api'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Get auth token from localStorage or cookies
  getAuthToken() {
    // In a real app, you might want to use httpOnly cookies for better security
    return localStorage.getItem('authToken')
  }

  // Set auth token
  setAuthToken(token) {
    localStorage.setItem('authToken', token)
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('authToken')
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getAuthToken()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Request failed')
      }

      return data
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  // Auth methods
  async login(username, password) {
    return this.request('/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        username,
        password,
      }),
    })
  }

  async register(userData) {
    return this.request('/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'register',
        ...userData,
      }),
    })
  }

  // Absensi methods
  async checkIn(userId, qrCodeId, latitude, longitude) {
    return this.request('/absensi', {
      method: 'POST',
      body: JSON.stringify({
        action: 'check-in',
        userId,
        qrCodeId,
        latitude,
        longitude,
      }),
    })
  }

  async checkOut(userId, qrCodeId, latitude, longitude) {
    return this.request('/absensi', {
      method: 'POST',
      body: JSON.stringify({
        action: 'check-out',
        userId,
        qrCodeId,
        latitude,
        longitude,
      }),
    })
  }

  async getAttendanceHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/absensi?${queryString}`)
  }

  // Users methods
  async getUsers() {
    return this.request('/users')
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id, userData) {
    return this.request(`/users?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id) {
    return this.request(`/users?id=${id}`, {
      method: 'DELETE',
    })
  }

  // QR Codes methods
  async getQRCodes(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/qrcodes?${queryString}`)
  }

  async createQRCode(qrData) {
    return this.request('/qrcodes', {
      method: 'POST',
      body: JSON.stringify(qrData),
    })
  }

  async updateQRCode(id, qrData) {
    return this.request(`/qrcodes?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(qrData),
    })
  }

  async deleteQRCode(id) {
    return this.request(`/qrcodes?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Database initialization (for development/setup)
  async initDatabase() {
    return this.request('/init-db', {
      method: 'POST',
    })
  }

  async checkDatabaseStatus() {
    return this.request('/init-db')
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient()
export default apiClient

// Export individual methods for convenience
export const {
  login,
  register,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getQRCodes,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  initDatabase,
  checkDatabaseStatus,
  setAuthToken,
  removeAuthToken,
} = apiClient

