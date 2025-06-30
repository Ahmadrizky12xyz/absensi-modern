// API endpoint untuk autentikasi
// File: /api/auth.js

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Mock database - dalam implementasi nyata, gunakan database cloud
const users = [
  {
    id: '1',
    nama: 'Administrator',
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    nomor_id: 'ADM001',
    role: 'admin'
  },
  {
    id: '2',
    nama: 'Budi Santoso',
    username: 'user',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: user123
    nomor_id: 'EMP001',
    role: 'user'
  }
]

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'POST') {
    const { action, username, password, nama, nomor_id, role } = req.body

    try {
      if (action === 'login') {
        // Login logic
        if (!username || !password) {
          return res.status(400).json({ 
            success: false, 
            message: 'Username dan password harus diisi' 
          })
        }

        const user = users.find(u => u.username === username)
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            message: 'Username tidak ditemukan' 
          })
        }

        // Untuk demo, kita gunakan password sederhana
        const isValidPassword = (username === 'admin' && password === 'admin123') ||
                               (username === 'user' && password === 'user123')

        if (!isValidPassword) {
          return res.status(401).json({ 
            success: false, 
            message: 'Password salah' 
          })
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            username: user.username, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        return res.status(200).json({
          success: true,
          message: 'Login berhasil',
          token,
          user: {
            id: user.id,
            nama: user.nama,
            username: user.username,
            role: user.role
          }
        })

      } else if (action === 'register') {
        // Register logic (admin only)
        if (!nama || !username || !password || !nomor_id || !role) {
          return res.status(400).json({ 
            success: false, 
            message: 'Semua field harus diisi' 
          })
        }

        // Check if username already exists
        const existingUser = users.find(u => u.username === username)
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'Username sudah digunakan' 
          })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const newUser = {
          id: (users.length + 1).toString(),
          nama,
          username,
          password: hashedPassword,
          nomor_id,
          role
        }

        users.push(newUser)

        return res.status(201).json({
          success: true,
          message: 'Pengguna berhasil didaftarkan',
          user: {
            id: newUser.id,
            nama: newUser.nama,
            username: newUser.username,
            nomor_id: newUser.nomor_id,
            role: newUser.role
          }
        })

      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Action tidak valid' 
        })
      }

    } catch (error) {
      console.error('Auth error:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan server' 
      })
    }
  }

  return res.status(405).json({ 
    success: false, 
    message: 'Method tidak diizinkan' 
  })
}

