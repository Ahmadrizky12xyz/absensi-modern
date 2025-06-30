// API endpoint untuk manajemen QR codes
// File: /api/qrcodes.js

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock database - dalam implementasi nyata, gunakan database cloud
let qrCodes = [
  {
    id: 'qr1',
    code: 'PTINDOTEKHNOPLUS_KANTOR_PUSAT',
    location: 'Kantor Pusat',
    isActive: true,
    createdAt: '2025-06-01T09:00:00.000Z',
    updatedAt: '2025-06-01T09:00:00.000Z'
  },
  {
    id: 'qr2',
    code: 'PTINDOTEKHNOPLUS_CABANG_BEKASI',
    location: 'Cabang Bekasi',
    isActive: false,
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

  try {
    if (req.method === 'GET') {
      // Get all QR codes
      const { active } = req.query
      
      let filteredQRCodes = [...qrCodes]
      
      // Filter by active status if specified
      if (active !== undefined) {
        const isActiveFilter = active === 'true'
        filteredQRCodes = filteredQRCodes.filter(qr => qr.isActive === isActiveFilter)
      }

      return res.status(200).json({
        success: true,
        data: filteredQRCodes
      })

    } else if (req.method === 'POST') {
      // Create new QR code (admin only)
      if (!isAdmin(decoded)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Akses ditolak. Hanya admin yang dapat melakukan operasi ini.' 
        })
      }

      const { code, location, isActive = true } = req.body

      if (!code || !location) {
        return res.status(400).json({ 
          success: false, 
          message: 'Code dan location harus diisi' 
        })
      }

      // Check if code already exists
      const existingQR = qrCodes.find(qr => qr.code === code)
      if (existingQR) {
        return res.status(400).json({ 
          success: false, 
          message: 'QR Code sudah ada' 
        })
      }

      // Create new QR code
      const newQRCode = {
        id: `qr${qrCodes.length + 1}`,
        code,
        location,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      qrCodes.push(newQRCode)

      return res.status(201).json({
        success: true,
        message: 'QR Code berhasil ditambahkan',
        data: newQRCode
      })

    } else if (req.method === 'PUT') {
      // Update QR code (admin only)
      if (!isAdmin(decoded)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Akses ditolak. Hanya admin yang dapat melakukan operasi ini.' 
        })
      }

      const { id } = req.query
      const { code, location, isActive } = req.body

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID QR Code harus disertakan' 
        })
      }

      const qrIndex = qrCodes.findIndex(qr => qr.id === id)
      if (qrIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'QR Code tidak ditemukan' 
        })
      }

      // Check if code already exists (excluding current QR code)
      if (code) {
        const existingQR = qrCodes.find(qr => qr.id !== id && qr.code === code)
        if (existingQR) {
          return res.status(400).json({ 
            success: false, 
            message: 'QR Code sudah digunakan' 
          })
        }
      }

      // Update QR code data
      if (code) qrCodes[qrIndex].code = code
      if (location) qrCodes[qrIndex].location = location
      if (isActive !== undefined) qrCodes[qrIndex].isActive = isActive
      qrCodes[qrIndex].updatedAt = new Date().toISOString()

      return res.status(200).json({
        success: true,
        message: 'QR Code berhasil diperbarui',
        data: qrCodes[qrIndex]
      })

    } else if (req.method === 'DELETE') {
      // Delete QR code (admin only)
      if (!isAdmin(decoded)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Akses ditolak. Hanya admin yang dapat melakukan operasi ini.' 
        })
      }

      const { id } = req.query

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID QR Code harus disertakan' 
        })
      }

      const qrIndex = qrCodes.findIndex(qr => qr.id === id)
      if (qrIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'QR Code tidak ditemukan' 
        })
      }

      qrCodes.splice(qrIndex, 1)

      return res.status(200).json({
        success: true,
        message: 'QR Code berhasil dihapus'
      })

    } else {
      return res.status(405).json({ 
        success: false, 
        message: 'Method tidak diizinkan' 
      })
    }

  } catch (error) {
    console.error('QR Codes error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}

