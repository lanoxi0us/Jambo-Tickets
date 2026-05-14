import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import QRModal from '../components/QRModal'
import { formatDate, formatTime, formatCurrency } from '../utils/formatters'

const STATUS_STYLE = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
  USED: 'bg-blue-100 text-blue-700',
}

export default function MyTickets() {
  const [qrRef, setQrRef] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my').then(r => r.data.data.bookings),
  })

  const handleDownload = (ref) => {
    window.open(`${import.meta.env.VITE_API_URL || ''}/api/bookings/download/${ref}`, '_blank')
  }

  return (
    <>
      <Helmet><title>My Tickets — Jambo Tickets</title></Helmet>
      {qrRef && <QRModal bookingRef={qrRef} onClose={() => setQrRef(null)} />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-extrabold text-navy mb-7">My Tickets</h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : !data?.length ? (
          <div className="card p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>
            <p className="font-semibold text-navy mb-2">No tickets yet</p>
            <p className="text-text-secondary text-sm mb-5">Your purchased tickets will appear here.</p>
            <a href="/events" className="btn-primary">Browse Events</a>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((booking, i) => (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  {booking.event?.coverImage && (
                    <img src={booking.event.coverImage} alt={booking.event.title}
                      className="w-full sm:w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-navy text-base leading-tight">{booking.event?.title}</h3>
                      <span className={`badge text-xs flex-shrink-0 ${STATUS_STYLE[booking.status] || 'bg-gray-100'}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mb-1">
                      {formatDate(booking.event?.eventDate)} at {formatTime(booking.event?.eventDate)} &bull; {booking.event?.venue}
                    </p>
                    <p className="text-xs text-text-secondary mb-3 font-mono">Ref: {booking.bookingRef}</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.bookingItems?.map(item => (
                        <span key={item.id} className="badge bg-gray-100 text-gray-600 text-xs">
                          {item.ticketTier?.name} x{item.quantity}
                        </span>
                      ))}
                      <span className="badge bg-navy/5 text-navy text-xs font-semibold">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                  </div>
                  {booking.status === 'CONFIRMED' && (
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <button onClick={() => setQrRef(booking.bookingRef)}
                        className="flex-1 sm:flex-none btn-secondary text-xs py-2 px-3">
                        View QR
                      </button>
                      <button onClick={() => handleDownload(booking.bookingRef)}
                        className="flex-1 sm:flex-none btn-primary text-xs py-2 px-3">
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
