import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Clock, 
  QrCode, 
  Settings, 
  LogOut, 
  Plus,
  Search,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react'

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState([])
  const [usersData, setUsersData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Mock data
    setAttendanceData([
      {
        id: 1,
        userId: '2',
        nama: 'Budi Santoso',
        nomorId: 'EMP001',
        date: '2025-06-27',
        checkIn: '08:15:00',
        checkOut: '17:30:00',
        latitudeMasuk: -6.208763,
        longitudeMasuk: 106.845599,
        latitudeKeluar: -6.208763,
        longitudeKeluar: 106.845599,
        status: 'complete'
      },
      {
        id: 2,
        userId: '3',
        nama: 'Siti Rahayu',
        nomorId: 'EMP002',
        date: '2025-06-27',
        checkIn: '08:10:00',
        checkOut: null,
        latitudeMasuk: -6.208763,
        longitudeMasuk: 106.845599,
        latitudeKeluar: null,
        longitudeKeluar: null,
        status: 'incomplete'
      },
      {
        id: 3,
        userId: '4',
        nama: 'Ahmad Wijaya',
        nomorId: 'EMP003',
        date: '2025-06-27',
        checkIn: '08:20:00',
        checkOut: '17:25:00',
        latitudeMasuk: -6.208763,
        longitudeMasuk: 106.845599,
        latitudeKeluar: -6.208763,
        longitudeKeluar: 106.845599,
        status: 'complete'
      }
    ])

    setUsersData([
      { id: '2', nama: 'Budi Santoso', username: 'budi.s', nomorId: 'EMP001', role: 'user' },
      { id: '3', nama: 'Siti Rahayu', username: 'siti.r', nomorId: 'EMP002', role: 'user' },
      { id: '4', nama: 'Ahmad Wijaya', username: 'ahmad.w', nomorId: 'EMP003', role: 'user' }
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

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  const filteredAttendance = attendanceData.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nomorId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = usersData.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nomorId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const todayAttendance = attendanceData.filter(item => item.date === '2025-06-27')
  const completedToday = todayAttendance.filter(item => item.status === 'complete').length
  const incompleteToday = todayAttendance.filter(item => item.status === 'incomplete').length

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Admin
            </h1>
            <p className="text-gray-600 mt-1">
              Selamat datang, {user.nama} - Sistem Absensi PT Indotekhnoplus
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
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-2">
                  {formatTime(currentTime)}
                </div>
                <div className="text-purple-100">
                  {formatDate(currentTime)}
                </div>
              </div>
              <Clock className="w-16 h-16 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Karyawan</p>
                  <p className="text-3xl font-bold text-gray-900">{usersData.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hadir Hari Ini</p>
                  <p className="text-3xl font-bold text-green-600">{todayAttendance.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absensi Lengkap</p>
                  <p className="text-3xl font-bold text-blue-600">{completedToday}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Belum Keluar</p>
                  <p className="text-3xl font-bold text-yellow-600">{incompleteToday}</p>
                </div>
                <XCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attendance">Data Absensi</TabsTrigger>
            <TabsTrigger value="users">Kelola Pengguna</TabsTrigger>
            <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Data Absensi</CardTitle>
                    <CardDescription>Daftar absensi karyawan hari ini</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari karyawan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAttendance.map((attendance) => (
                    <div 
                      key={attendance.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{attendance.nama}</div>
                          <div className="text-sm text-gray-600">ID: {attendance.nomorId}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-green-600">
                            <Clock className="w-3 h-3" />
                            Masuk: {attendance.checkIn}
                          </div>
                          {attendance.checkOut && (
                            <div className="flex items-center gap-1 text-red-600">
                              <Clock className="w-3 h-3" />
                              Keluar: {attendance.checkOut}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {attendance.latitudeMasuk?.toFixed(4)}, {attendance.longitudeMasuk?.toFixed(4)}
                          </span>
                        </div>
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
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Kelola Pengguna</CardTitle>
                    <CardDescription>Daftar semua pengguna sistem</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pengguna
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">{user.nama}</div>
                          <div className="text-sm text-gray-600">
                            @{user.username} • ID: {user.nomorId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {user.role === 'admin' ? 'Administrator' : 'Karyawan'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR Codes Tab */}
          <TabsContent value="qrcodes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Kelola QR Codes</CardTitle>
                    <CardDescription>Daftar QR Code untuk absensi</CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Buat QR Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                    <CardContent className="p-6 text-center">
                      <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Kantor Pusat</h3>
                      <p className="text-sm text-gray-600 mb-4">Lokasi: Jakarta Selatan</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Aktif
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                    <CardContent className="p-6 text-center">
                      <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Cabang Bekasi</h3>
                      <p className="text-sm text-gray-600 mb-4">Lokasi: Bekasi Timur</p>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Nonaktif
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Jam Kerja</CardTitle>
                  <CardDescription>Atur jam kerja standar perusahaan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time">Jam Masuk</Label>
                      <Input id="start-time" type="time" defaultValue="08:00" />
                    </div>
                    <div>
                      <Label htmlFor="end-time">Jam Pulang</Label>
                      <Input id="end-time" type="time" defaultValue="17:00" />
                    </div>
                  </div>
                  <Button className="w-full">Simpan Pengaturan</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Sistem</CardTitle>
                  <CardDescription>Konfigurasi umum sistem absensi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tolerance">Toleransi Keterlambatan (menit)</Label>
                    <Input id="tolerance" type="number" defaultValue="15" />
                  </div>
                  <div>
                    <Label htmlFor="radius">Radius Lokasi Absensi (meter)</Label>
                    <Input id="radius" type="number" defaultValue="100" />
                  </div>
                  <Button className="w-full">Simpan Pengaturan</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard

