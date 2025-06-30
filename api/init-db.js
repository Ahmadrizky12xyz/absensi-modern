// API endpoint untuk inisialisasi database
// File: /api/init-db.js

import Database from '../lib/database.js'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'POST') {
    try {
      // Initialize database tables
      await Database.initTables()
      
      // Seed initial data
      await Database.seedData()

      return res.status(200).json({
        success: true,
        message: 'Database berhasil diinisialisasi dan data awal telah ditambahkan'
      })

    } catch (error) {
      console.error('Database initialization error:', error)
      return res.status(500).json({
        success: false,
        message: 'Gagal menginisialisasi database',
        error: error.message
      })
    }
  }

  if (req.method === 'GET') {
    // Check database status
    try {
      const result = await Database.query('SELECT NOW() as current_time')
      
      return res.status(200).json({
        success: true,
        message: 'Database terhubung',
        timestamp: result.rows[0].current_time
      })

    } catch (error) {
      console.error('Database connection error:', error)
      return res.status(500).json({
        success: false,
        message: 'Gagal terhubung ke database',
        error: error.message
      })
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method tidak diizinkan'
  })
}

