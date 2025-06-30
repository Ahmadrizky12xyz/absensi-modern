// API endpoint untuk absensi
// File: /api/absensi.js

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock database - dalam implementasi nyata, gunakan database cloud
let absences = [
  {
    id: '1',
    userId: '2',
    qrCodeId: 'qr1',
    checkInTime: '2025-06-30T01:15:00.000Z',
    checkOutTime: '2025-06-30T10:30:00.000Z',
    latitudeMasuk: -6.208763,
    longitudeMasuk: 106.845599,
    latitudeKeluar: -6.208763,
    longitudeKeluar: 106.845599,
    createdAt: '2025-06-30T01:15:00.000Z',
    updatedAt: '2025-06-30T10:30:00.000Z'
  }
]

const users = [
  {
    id: '1',
    nama: 'Administrator',
    username: 'admin',
    nomor_id: 'ADM001',
    role: 'admin'
  },
  {
    id: '2',
    nama: 'Budi Santoso',
    username: 'user',
    nomor_id: 'EMP001',
    role: 'user'
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
    if (req.method === 'POST') {
      const { action, userId, qrCodeId, latitude, longitude } = req.body

      if (action === 'check-in') {
        // Check-in logic
        if (!userId || !latitude || !longitude) {
          return res.status(400).json({ 
            success: false, 
            message: 'Data tidak lengkap' 
          })
        }

        // Check if user already checked in today
        const today = new Date().toISOString().split('T')[0]
        const existingCheckIn = absences.find(a => 
          a.userId === userId && 
          a.checkInTime && 
          a.checkInTime.startsWith(today)
        )

        if (existingCheckIn) {
          return res.status(400).json({ 
            success: false, 
            message: 'Anda sudah melakukan absensi masuk hari ini' 
          })
        }

        // Create new attendance record
        const newAttendance = {
          id: (absences.length + 1).toString(),
          userId,
          qrCodeId: qrCodeId || null,
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
          latitudeMasuk: latitude,
          longitudeMasuk: longitude,
          latitudeKeluar: null,
          longitudeKeluar: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        absences.push(newAttendance)

        return res.status(200).json({
          success: true,
          message: 'Absensi masuk berhasil dicatat',
          data: newAttendance
        })

      } else if (action === 'check-out') {
        // Check-out logic
        if (!userId || !latitude || !longitude) {
          return res.status(400).json({ 
            success: false, 
            message: 'Data tidak lengkap' 
          })
        }

        // Find today's check-in record
        const today = new Date().toISOString().split('T')[0]
        const attendanceIndex = absences.findIndex(a => 
          a.userId === userId && 
          a.checkInTime && 
          a.checkInTime.startsWith(today) &&
          !a.checkOutTime
        )

        if (attendanceIndex === -1) {
          return res.status(400).json({ 
            success: false, 
            message: 'Tidak ditemukan data absensi masuk hari ini' 
          })
        }

        // Update with check-out data
        absences[attendanceIndex].checkOutTime = new Date().toISOString()
        absences[attendanceIndex].latitudeKeluar = latitude
        absences[attendanceIndex].longitudeKeluar = longitude
        absences[attendanceIndex].updatedAt = new Date().toISOString()

        return res.status(200).json({
          success: true,
          message: 'Absensi keluar berhasil dicatat',
          data: absences[attendanceIndex]
        })

      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Action tidak valid' 
        })
      }

    } else if (req.method === 'GET') {
      const { userId, startDate, endDate, limit = 10, offset = 0 } = req.query

      let filteredAbsences = [...absences]

      // Filter by user if specified
      if (userId) {
        filteredAbsences = filteredAbsences.filter(a => a.userId === userId)
      }

      // Filter by date range if specified
      if (startDate) {
        filteredAbsences = filteredAbsences.filter(a => 
          a.checkInTime >= startDate
        )
      }
      if (endDate) {
        filteredAbsences = filteredAbsences.filter(a => 
          a.checkInTime <= endDate
        )
      }

      // Add user information
      const attendanceWithUsers = filteredAbsences.map(attendance => {
        const user = users.find(u => u.id === attendance.userId)
        return {
          ...attendance,
          nama: user?.nama || 'Unknown',
          nomorId: user?.nomor_id || 'Unknown'
        }
      })

      // Apply pagination
      const paginatedData = attendanceWithUsers
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))

      return res.status(200).json({
        success: true,
        data: paginatedData,
        total: filteredAbsences.length
      })

    } else {
      return res.status(405).json({ 
        success: false, 
        message: 'Method tidak diizinkan' 
      })
    }

  } catch (error) {
    console.error('Absensi error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}

