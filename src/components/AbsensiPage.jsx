import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Camera, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

const AbsensiPage = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [absensiType, setAbsensiType] = useState('masuk') // 'masuk' or 'keluar'
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          setLocationError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.')
        }
      )
    } else {
      setLocationError('Browser tidak mendukung geolocation.')
    }
  }, [])

  const startCamera = async () => {
    try {
      setScanning(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      setMessage('Gagal mengakses kamera. Pastikan izin kamera diberikan.')
      setMessageType('error')
      setScanning(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
    setScanning(false)
  }

  const handleAbsensi = async (qrData = null) => {
    if (!location) {
      setMessage('Lokasi belum tersedia. Pastikan GPS aktif.')
      setMessageType('error')
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful attendance
      setMessage(`Absensi ${absensiType} berhasil dicatat pada ${currentTime.toLocaleTimeString('id-ID')}`)
      setMessageType('success')
      
      // Stop camera after successful scan
      stopCamera()
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
      
    } catch (error) {
      setMessage('Gagal mencatat absensi. Silakan coba lagi.')
      setMessageType('error')
    }
  }

  const handleManualAbsensi = () => {
    handleAbsensi()
  }

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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Absensi</h1>
            <p className="text-gray-600">Scan QR Code atau absensi manual</p>
          </div>
        </div>

        {/* Current Time */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {formatTime(currentTime)}
              </div>
              <div className="text-blue-100">
                {formatDate(currentTime)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Absensi Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Jenis Absensi</CardTitle>
            <CardDescription>Pilih jenis absensi yang akan dilakukan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={absensiType === 'masuk' ? 'default' : 'outline'}
                onClick={() => setAbsensiType('masuk')}
                className="flex-1"
              >
                Absensi Masuk
              </Button>
              <Button
                variant={absensiType === 'keluar' ? 'default' : 'outline'}
                onClick={() => setAbsensiType('keluar')}
                className="flex-1"
              >
                Absensi Keluar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location Status */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                {location ? (
                  <div>
                    <div className="font-medium text-green-600">Lokasi Terdeteksi</div>
                    <div className="text-sm text-gray-600">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </div>
                  </div>
                ) : locationError ? (
                  <div>
                    <div className="font-medium text-red-600">Lokasi Tidak Tersedia</div>
                    <div className="text-sm text-gray-600">{locationError}</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendapatkan lokasi...</span>
                  </div>
                )}
              </div>
              {location && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Siap
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {message && (
          <Alert className={`mb-6 ${messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* QR Scanner */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </CardTitle>
            <CardDescription>
              Arahkan kamera ke QR Code yang tersedia di lokasi kerja
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!scanning ? (
              <div className="text-center py-8">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <Button 
                  onClick={startCamera}
                  disabled={!location}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Mulai Scan QR Code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-2 border-white/50 m-8 rounded-lg"></div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={stopCamera}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={() => handleAbsensi('mock-qr-data')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Simulasi Scan Berhasil
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Absensi Manual
            </CardTitle>
            <CardDescription>
              Jika QR Code tidak tersedia, gunakan absensi manual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleManualAbsensi}
              disabled={!location}
              variant="outline"
              className="w-full"
            >
              {absensiType === 'masuk' ? 'Absensi Masuk Manual' : 'Absensi Keluar Manual'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AbsensiPage

