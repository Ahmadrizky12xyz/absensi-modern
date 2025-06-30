// API endpoint untuk manajemen pengguna
// File: /api/users.js

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock database - dalam implementasi nyata, gunakan database cloud
let users = [
  {
    id: '1',
    nama: 'Administrator',
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    nomor_id: 'ADM001',
    role: 'admin',
    createdAt: '2025-06-01T09:00:00.000Z',
    updatedAt: '2025-06-01T09:00:00.000Z'
  },
  {
    id: '2',
    nama: 'Budi Santoso',
    username: 'user',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    nomor_id: 'EMP001',
    role: 'user',
    createdAt: '2025-06-01T09:00:00.000Z',
    updatedAt: '2025-06-01T09:00:00.000Z'
  },
  {
    id: '3',
    nama: 'Siti Rahayu',
    username: 'siti.r',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    nomor_id: 'EMP002',
    role: 'user',
    createdAt: '2025-06-01T09:00:00.000Z',
    updatedAt: '2025-06-01T09:00:00.000Z'
  },
  {
    id: '4',
    nama: 'Ahmad Wijaya',
    username: 'ahmad.w',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    nomor_id: 'EMP003',
    role: 'user',
    createdAt: '2025-06-01T09:00:00.000Z',
    updatedAt: '2025-06-01T09:00:00.000Z'
  }
]

// Middleware untuk verifikasi JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Middleware untuk verifikasi admin
function isAdmin(decoded) {
  return decoded && decoded.role === 'admin'
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Verify authentication
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token tidak ditemukan' 
    })
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token tidak valid' 
    })
  }

  // Check admin permission for most operations
  if (req.method !== 'GET' && !isAdmin(decoded)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak. Hanya admin yang dapat melakukan operasi ini.' 
    })
  }

  try {
    if (req.method === 'GET') {
      // Get all users (admin) or current user info (user)
      if (isAdmin(decoded)) {
        // Return all users for admin
        const safeUsers = users.map(user => ({
          id: user.id,
          nama: user.nama,
          username: user.username,
          nomor_id: user.nomor_id,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))

        return res.status(200).json({
          success: true,
          data: safeUsers
        })
      } else {
        // Return current user info for regular users
        const currentUser = users.find(u => u.id === decoded.userId)
        if (!currentUser) {
          return res.status(404).json({ 
            success: false, 
            message: 'Pengguna tidak ditemukan' 
          })
        }

        return res.status(200).json({
          success: true,
          data: {
            id: currentUser.id,
            nama: currentUser.nama,
            username: currentUser.username,
            nomor_id: currentUser.nomor_id,
            role: currentUser.role
          }
        })
      }

    } else if (req.method === 'POST') {
      // Create new user (admin only)
      const { nama, username, password, nomor_id, role } = req.body

      if (!nama || !username || !password || !nomor_id || !role) {
        return res.status(400).json({ 
          success: false, 
          message: 'Semua field harus diisi' 
        })
      }

      // Check if username or nomor_id already exists
      const existingUser = users.find(u => 
        u.username === username || u.nomor_id === nomor_id
      )
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username atau Nomor ID sudah digunakan' 
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
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      users.push(newUser)

      return res.status(201).json({
        success: true,
        message: 'Pengguna berhasil ditambahkan',
        data: {
          id: newUser.id,
          nama: newUser.nama,
          username: newUser.username,
          nomor_id: newUser.nomor_id,
          role: newUser.role
        }
      })

    } else if (req.method === 'PUT') {
      // Update user (admin only)
      const { id } = req.query
      const { nama, username, nomor_id, role, password } = req.body

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID pengguna harus disertakan' 
        })
      }

      const userIndex = users.findIndex(u => u.id === id)
      if (userIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'Pengguna tidak ditemukan' 
        })
      }

      // Check if username or nomor_id already exists (excluding current user)
      const existingUser = users.find(u => 
        u.id !== id && (u.username === username || u.nomor_id === nomor_id)
      )
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username atau Nomor ID sudah digunakan oleh pengguna lain' 
        })
      }

      // Update user data
      if (nama) users[userIndex].nama = nama
      if (username) users[userIndex].username = username
      if (nomor_id) users[userIndex].nomor_id = nomor_id
      if (role) users[userIndex].role = role
      if (password) {
        users[userIndex].password = await bcrypt.hash(password, 10)
      }
      users[userIndex].updatedAt = new Date().toISOString()

      return res.status(200).json({
        success: true,
        message: 'Pengguna berhasil diperbarui',
        data: {
          id: users[userIndex].id,
          nama: users[userIndex].nama,
          username: users[userIndex].username,
          nomor_id: users[userIndex].nomor_id,
          role: users[userIndex].role
        }
      })

    } else if (req.method === 'DELETE') {
      // Delete user (admin only)
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID pengguna harus disertakan' 
        })
      }

      const userIndex = users.findIndex(u => u.id === id)
      if (userIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'Pengguna tidak ditemukan' 
        })
      }

      // Prevent deleting the current admin
      if (users[userIndex].id === decoded.userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tidak dapat menghapus akun sendiri' 
        })
      }

      users.splice(userIndex, 1)

      return res.status(200).json({
        success: true,
        message: 'Pengguna berhasil dihapus'
      })

    } else {
      return res.status(405).json({ 
        success: false, 
        message: 'Method tidak diizinkan' 
      })
    }

  } catch (error) {
    console.error('Users error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}

