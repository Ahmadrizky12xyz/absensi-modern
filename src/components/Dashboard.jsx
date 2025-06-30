import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  QrCode, 
  MapPin, 
  Calendar, 
  LogOut, 
  User,
  CheckCircle,
  XCircle
} from 'lucide-react'

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [recentAttendance, setRecentAttendance] = useState([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Mock recent attendance data
    setRecentAttendance([
      {
        id: 1,
        date: '2025-06-27',
        checkIn: '08:15:00',
        checkOut: '17:30:00',
        status: 'complete'
      },
      {
        id: 2,
        date: '2025-06-26',
        checkIn: '08:10:00',
        checkOut: '17:25:00',
        status: 'complete'
      },
      {
        id: 3,
        date: '2025-06-25',
        checkIn: '08:20:00',
        checkOut: null,
        status: 'incomplete'
      }
    ])

    return () => clearInterval(timer)
  }, [])

  const formatTime = (time) => {
    return time.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleAbsensi = () => {
    navigate('/absensi')
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Selamat Datang, {user.nama}!
            </h1>
            <p className="text-gray-600 mt-1">
              Sistem Absensi PT Indotekhnoplus
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>

        {/* Current Time Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-2">
                  {formatTime(currentTime)}
                </div>
                <div className="text-blue-100">
                  {formatDate(currentTime)}
                </div>
              </div>
              <Clock className="w-16 h-16 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleAbsensi}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Absensi</CardTitle>
              <CardDescription>
                Lakukan absensi masuk/keluar dengan scan QR Code
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Riwayat Absensi</CardTitle>
              <CardDescription>
                Lihat riwayat absensi Anda
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Profil</CardTitle>
              <CardDescription>
                Kelola informasi profil Anda
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Absensi Terbaru
            </CardTitle>
            <CardDescription>
              Riwayat absensi 5 hari terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAttendance.map((attendance) => (
                <div 
                  key={attendance.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {new Date(attendance.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Masuk: {attendance.checkIn}
                        </span>
                        {attendance.checkOut && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Keluar: {attendance.checkOut}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {attendance.status === 'complete' ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Lengkap
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Belum Keluar
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

