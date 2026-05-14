import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useMpesaPolling } from '../hooks/useMpesaPolling'
import { formatCurrency, formatDateLong, formatTime } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    buyerName: user?.fullName || '',
    buyerEmail: user?.email || '',
    buyerPhone: user?.phone || '',
    mpesaPhone: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [paymentState, setPaymentState] = useState(null) // null | 'waiting' | 'failed'
  const [checkoutRequestId, setCheckoutRequestId] = useState(null)

  const event = state?.event
  const items = state?.items || []
  const selections = state?.selections || {}

  // Compute line items for display
  const lineItems = event?.ticketTiers
    ?.filter(tier => (selections[tier.id] || 0) > 0)
    .map(tier => ({ tier, qty: selections[tier.id], subtotal: tier.price * selections[tier.id] })) || []

  const total = lineItems.reduce((s, li) => s + li.subtotal, 0)

  const { status: pollStatus } = useMpesaPolling(checkoutRequestId, {
    enabled: paymentState === 'waiting',
    onSuccess: (bookingRef) => {
      navigate(`/booking-confirmation/${bookingRef}`)
    },
    onFailure: (msg) => {
      setPaymentState('failed')
      toast.error(msg || 'Payment failed. Please try again.')
      setCheckoutRequestId(null)
    },
  })

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-text-secondary mb-4">No event selected. Please select tickets first.</p>
        <Link to="/events" className="btn-primary">Browse Events</Link>
      </div>
    </div>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.buyerName || !form.buyerEmail || !form.buyerPhone || !form.mpesaPhone) {
      toast.error('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/bookings/initiate', {
        eventId: event.id,
        items,
        ...form,
      })
      setCheckoutRequestId(res.data.data.checkoutRequestId)
      setPaymentState('waiting')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setPaymentState(null)
    setCheckoutRequestId(null)
  }

  return (
    <>
      <Helmet><title>Checkout — Jambo Tickets</title></Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-navy">Checkout</h1>
          <p className="text-text-secondary text-sm mt-1">Complete your ticket purchase securely via M-Pesa</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — Buyer Form */}
          <div className="flex-1 space-y-5">
            {paymentState === 'waiting' ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="card p-10 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-crimson/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-crimson border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3M6.75 6.75h.75" /></svg>
                    </div>
                  </div>
                </div>
                <h2 className="font-bold text-navy text-xl mb-2">Waiting for M-Pesa Confirmation</h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-2">
                  An M-Pesa payment prompt has been sent to <strong>{form.mpesaPhone}</strong>.
                </p>
                <p className="text-text-secondary text-sm mb-6">
                  Please enter your M-Pesa PIN on your phone to complete the payment of <strong className="text-navy">{formatCurrency(total)}</strong>.
                </p>
                <div className="inline-flex items-center gap-2 text-xs text-text-secondary bg-gray-50 px-4 py-2 rounded-full">
                  <LoadingSpinner size="sm" />
                  Waiting for payment confirmation...
                </div>
                <p className="text-xs text-text-secondary mt-6">
                  This page will automatically update once payment is confirmed.
                </p>
              </motion.div>
            ) : paymentState === 'failed' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <h2 className="font-bold text-navy text-xl mb-2">Payment Not Completed</h2>
                <p className="text-text-secondary text-sm mb-6">The payment was cancelled or timed out. Please try again.</p>
                <button onClick={handleRetry} className="btn-primary">Try Again</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-7 space-y-5">
                <h2 className="font-bold text-navy text-lg">Your Information</h2>
                <div>
                  <label className="label">Full Name</label>
                  <input value={form.buyerName} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))}
                    className="input-field" placeholder="John Kamau" required />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" value={form.buyerEmail} onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))}
                    className="input-field" placeholder="john@email.com" required />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input value={form.buyerPhone} onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
                    className="input-field" placeholder="+254712345678" required />
                </div>
                <hr className="border-border" />
                <div>
                  <label className="label">M-Pesa Phone Number</label>
                  <p className="text-xs text-text-secondary mb-2">Enter the phone number that will receive the M-Pesa payment prompt</p>
                  <input value={form.mpesaPhone} onChange={e => setForm(f => ({ ...f, mpesaPhone: e.target.value }))}
                    className="input-field" placeholder="+254712345678" required />
                </div>

                <div className="bg-amber/10 border border-amber/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      You will receive an M-Pesa prompt on your phone. Enter your PIN to confirm the payment of <strong>{formatCurrency(total)}</strong>.
                    </p>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full btn-primary text-base py-3.5">
                  {loading ? <><LoadingSpinner size="sm" color="white" /> Processing...</> : `Pay ${formatCurrency(total)} via M-Pesa`}
                </button>
              </form>
            )}
          </div>

          {/* Right — Order Summary */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-20">
              <h2 className="font-bold text-navy text-base mb-4">Order Summary</h2>
              <div className="flex items-start gap-3 mb-5 pb-5 border-b border-border">
                {event.coverImage && (
                  <img src={event.coverImage} alt={event.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-navy text-sm leading-tight">{event.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{formatDateLong(event.eventDate)}</p>
                  <p className="text-xs text-text-secondary">{event.venue}</p>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {lineItems.map(({ tier, qty, subtotal }) => (
                  <div key={tier.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-navy">{tier.name}</p>
                      <p className="text-xs text-text-secondary">{qty} x {formatCurrency(tier.price)}</p>
                    </div>
                    <span className="font-semibold text-sm text-navy">{formatCurrency(subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="font-bold text-navy">Total</span>
                <span className="font-extrabold text-navy text-lg">{formatCurrency(total)}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
                <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                Secured by M-Pesa
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
