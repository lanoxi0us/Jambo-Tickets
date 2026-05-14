import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ScanTicket() {
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const scannerRef = useRef(null)
  const scannerInstanceRef = useRef(null)

  const startScanner = async () => {
    setCameraError(null)
    setScanning(true)
    try {
      const html5QrCode = new Html5Qrcode('qr-reader')
      scannerInstanceRef.current = html5QrCode
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // QR code scanned successfully
          html5QrCode.stop().then(() => {
            setScanning(false)
            setQrCode(decodedText)
            handleVerify(decodedText)
          })
        },
        () => {} // ignore scan errors silently
      )
    } catch (err) {
      setScanning(false)
      setCameraError('Camera access denied or not available. Use the manual input below.')
    }
  }

  const stopScanner = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().catch(() => {})
      scannerInstanceRef.current = null
    }
    setScanning(false)
  }

  // Clean up camera when leaving the page
  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  const handleVerify = async (code) => {
    const codeToVerify = code || qrCode
    if (!codeToVerify.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post(`/bookings/scan/${codeToVerify.trim()}`)
      setResult({ success: true, message: res.data.message, booking: res.data.data.booking })
      toast.success('Ticket valid — entry granted!')
      setQrCode('')
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid ticket'
      setResult({ success: false, message })
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    handleVerify(qrCode)
  }

  const handleReset = () => {
    setResult(null)
    setQrCode('')
  }

  return (
    <>
      <Helmet><title>Gate Scanner — Jambo Tickets</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 justify-center mb-6">
              <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center">
                <span className="text-crimson font-extrabold text-xl leading-none">J</span>
              </div>
              <span className="font-extrabold text-navy text-xl">Jambo Tickets</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-navy">Gate Scanner</h1>
            <p className="text-text-secondary text-sm mt-1">Scan or enter the booking reference to verify entry</p>
          </div>

          <div className="card p-6 space-y-5">

            {/* Camera scanner */}
            <div>
              <div
                id="qr-reader"
                ref={scannerRef}
                className={`w-full rounded-xl overflow-hidden bg-gray-900 ${scanning ? 'block' : 'hidden'}`}
                style={{ minHeight: scanning ? '280px' : '0' }}
              />

              {!scanning ? (
                <button
                  onClick={startScanner}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 text-text-secondary hover:border-crimson hover:text-crimson transition-colors duration-200 cursor-pointer"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <span className="font-medium text-sm">Tap to open camera scanner</span>
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="w-full mt-3 btn-secondary text-sm py-2"
                >
                  Stop Camera
                </button>
              )}

              {cameraError && (
                <p className="text-xs text-crimson mt-2 text-center">{cameraError}</p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary font-medium">or enter manually</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Manual input */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="label">Booking Reference</label>
                <input
                  value={qrCode}
                  onChange={e => setQrCode(e.target.value.trim())}
                  className="input-field text-center font-mono text-base tracking-widest"
                  placeholder="Paste or type code here"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !qrCode.trim()}
                className="btn-primary w-full"
              >
                {loading
                  ? <><LoadingSpinner size="sm" color="white" /> Verifying...</>
                  : 'Verify Ticket'}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div className={`p-5 rounded-xl border-2 ${
                result.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {result.success ? (
                    <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-crimson flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className={`font-extrabold text-xl ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.success ? 'Entry Granted' : 'Entry Denied'}
                    </p>
                    <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.message}
                    </p>
                  </div>
                </div>

                {result.success && result.booking && (
                  <div className="mt-3 pt-3 border-t border-green-200 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wide w-16">Name</span>
                      <span className="text-sm font-semibold text-green-800">{result.booking.buyerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wide w-16">Event</span>
                      <span className="text-sm text-green-800">{result.booking.event?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wide w-16">Tickets</span>
                      <span className="text-sm text-green-800">
                        {result.booking.bookingItems?.map(i => `${i.ticketTier?.name} x${i.quantity}`).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wide w-16">Ref</span>
                      <span className="text-sm font-mono text-green-800">{result.booking.bookingRef}</span>
                    </div>
                  </div>
                )}

                <button onClick={handleReset} className="mt-4 w-full btn-secondary text-sm py-2">
                  Scan Next Ticket
                </button>
              </div>
            )}
          </div>

          <p className="text-center mt-6">
            <Link to="/" className="text-text-secondary text-sm hover:text-navy transition-colors">
              Back to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}