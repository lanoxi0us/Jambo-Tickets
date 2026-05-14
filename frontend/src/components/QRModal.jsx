import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import LoadingSpinner from './LoadingSpinner'

export default function QRModal({ bookingRef, onClose }) {
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/bookings/qr/${bookingRef}`)
      .then(res => setQr(res.data.data.qrCode))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [bookingRef])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="font-bold text-navy text-lg mb-1">Your QR Code</h3>
          <p className="text-text-secondary text-sm mb-5">Present at the gate for entry</p>
          {loading ? (
            <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>
          ) : qr ? (
            <img src={qr} alt="QR Code" className="w-48 h-48 mx-auto border-4 border-border rounded-xl" />
          ) : (
            <p className="text-text-secondary text-sm py-8">Could not load QR code.</p>
          )}
          <p className="text-xs text-text-secondary mt-4 font-mono">{bookingRef}</p>
          <button onClick={onClose} className="mt-5 w-full btn-secondary text-sm">Close</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
