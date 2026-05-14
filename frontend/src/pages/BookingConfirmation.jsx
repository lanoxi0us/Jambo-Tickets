import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDateLong, formatTime, formatCurrency } from '../utils/formatters'

export default function BookingConfirmation() {
  const { ref } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['booking', ref],
    queryFn: () => api.get(`/bookings/confirm/${ref}`).then(r => r.data.data.booking),
    refetchInterval: (data) => (data?.status === 'CONFIRMED' ? false : 4000),
  })

  const handleDownload = () => {
    window.open(`${import.meta.env.VITE_API_URL || ''}/api/bookings/download/${ref}`, '_blank')
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  )

  const booking = data
  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-text-secondary">Booking not found.</p>
    </div>
  )

  const isPending = booking.status === 'PENDING'
  const isConfirmed = booking.status === 'CONFIRMED'

  return (
    <>
      <Helmet><title>Booking Confirmation — Jambo Tickets</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {isPending ? (
          <div className="card p-10 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 font-semibold text-navy">Waiting for payment confirmation...</p>
            <p className="text-text-secondary text-sm mt-2">This page refreshes automatically.</p>
          </div>
        ) : isConfirmed ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Success header */}
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h1 className="text-2xl font-extrabold text-navy mb-2">Booking Confirmed!</h1>
              <p className="text-text-secondary mb-3">Your tickets have been sent to <strong>{booking.buyerEmail}</strong></p>
              <div className="inline-block bg-navy/5 border border-border px-5 py-2 rounded-lg">
                <span className="text-xs text-text-secondary">Booking Reference</span>
                <p className="font-bold text-navy text-lg font-mono">{booking.bookingRef}</p>
              </div>
            </div>

            {/* Event details */}
            <div className="card p-6">
              <h2 className="font-bold text-navy text-base mb-4">Event Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-secondary">Event</span><span className="font-semibold text-navy">{booking.event?.title}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Date</span><span className="font-medium">{formatDateLong(booking.event?.eventDate)}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Time</span><span className="font-medium">{formatTime(booking.event?.eventDate)}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Venue</span><span className="font-medium">{booking.event?.venue}</span></div>
              </div>
            </div>

            {/* Ticket breakdown */}
            <div className="card p-6">
              <h2 className="font-bold text-navy text-base mb-4">Ticket Breakdown</h2>
              <div className="space-y-2">
                {booking.bookingItems?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{item.ticketTier?.name} x{item.quantity}</span>
                    <span className="font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-navy pt-2 border-t border-border">
                  <span>Total Paid</span>
                  <span>{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="card p-6 text-center">
              <h2 className="font-bold text-navy text-base mb-2">Your Entry QR Code</h2>
              <p className="text-text-secondary text-sm mb-4">Present this at the gate. Check your email for the full ticket PDF.</p>
              <div className="inline-block p-4 border-2 border-border rounded-xl bg-white">
                <img
                  src={`${import.meta.env.VITE_API_URL || ''}/api/bookings/qr/${booking.bookingRef}`}
                  alt="QR Code"
                  className="w-40 h-40"
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>
              <p className="font-mono text-xs text-text-secondary mt-3">{booking.bookingRef}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleDownload} className="flex-1 btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Download PDF Ticket
              </button>
              <Link to="/my-tickets" className="flex-1 btn-secondary text-center">View My Tickets</Link>
              <Link to="/events" className="flex-1 btn-secondary text-center">Browse More Events</Link>
            </div>
          </motion.div>
        ) : (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h1 className="text-xl font-bold text-navy mb-2">Payment Not Completed</h1>
            <p className="text-text-secondary text-sm mb-6">Your booking is in status: {booking.status}.</p>
            <Link to="/events" className="btn-primary">Browse Events</Link>
          </div>
        )}
      </div>
    </>
  )
}
