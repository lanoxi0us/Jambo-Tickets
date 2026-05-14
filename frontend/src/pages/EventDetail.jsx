import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/api'
import TicketTierSelector from '../components/TicketTierSelector'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDateLong, formatTime, formatCurrency } from '../utils/formatters'

export default function EventDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [selections, setSelections] = useState({})

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.get(`/events/${slug}`).then(r => r.data.data),
  })

  const event = data?.event
  const related = data?.related || []

  const totalTickets = Object.values(selections).reduce((a, b) => a + b, 0)
  const totalPrice = event?.ticketTiers
    ? event.ticketTiers.reduce((sum, tier) => sum + (selections[tier.id] || 0) * tier.price, 0)
    : 0

  const handleBuyTickets = () => {
    if (totalTickets === 0) { toast.error('Please select at least one ticket.'); return }
    const items = Object.entries(selections)
      .filter(([, qty]) => qty > 0)
      .map(([tierId, quantity]) => ({ tierId, quantity }))
    navigate('/checkout', { state: { event, items, selections } })
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  )
  if (error || !event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-text-secondary mb-4">Event not found.</p>
        <Link to="/events" className="btn-primary">Browse Events</Link>
      </div>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>{event.title} — Jambo Tickets</title>
        <meta name="description" content={`${event.title} at ${event.venue}. ${formatDateLong(event.eventDate)}.`} />
      </Helmet>

      {/* Hero Banner */}
      <div className="relative bg-navy overflow-hidden" style={{ minHeight: 320 }}>
        {event.coverImage && (
          <img src={event.coverImage} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <span className="inline-block bg-crimson text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">{event.category}</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 max-w-3xl leading-tight">{event.title}</h1>
          <div className="flex flex-wrap gap-5 text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5" /></svg>
              {formatDateLong(event.eventDate)}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(event.eventDate)}{event.endDate && ` — ${formatTime(event.endDate)}`}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              {event.venue}, {event.city}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              Organised by {event.organiser?.fullName}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Description */}
            <div className="card p-7 mb-6">
              <h2 className="font-bold text-navy text-xl mb-4">About This Event</h2>
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>

            {/* Ticket Tiers */}
            <div className="card p-7 mb-6">
              <h2 className="font-bold text-navy text-xl mb-5">Select Tickets</h2>
              <TicketTierSelector
                tiers={event.ticketTiers}
                selections={selections}
                onChange={(tierId, qty) => setSelections(prev => ({ ...prev, [tierId]: qty }))}
              />
              {totalTickets > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-5 pt-5 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-text-secondary text-sm">{totalTickets} ticket{totalTickets > 1 ? 's' : ''} selected</span>
                    <div className="font-bold text-navy text-lg">{formatCurrency(totalPrice)}</div>
                  </div>
                  <button onClick={handleBuyTickets} className="btn-primary">
                    Continue to Checkout
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Share */}
            <div className="card p-6">
              <h3 className="font-bold text-navy text-base mb-4">Share This Event</h3>
              <div className="flex items-center gap-3">
                <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-navy text-sm font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" /></svg>
                  Copy Link
                </button>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-black hover:text-white hover:border-black text-sm font-medium transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Share on X
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${event.title} — ${window.location.href}`)}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-green-500 hover:text-white hover:border-green-500 text-sm font-medium transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20 card p-6">
              <h3 className="font-bold text-navy text-lg mb-4">Event Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" /></svg>
                  <div>
                    <p className="text-xs text-text-secondary">Date</p>
                    <p className="text-sm font-semibold text-navy">{formatDateLong(event.eventDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="text-xs text-text-secondary">Time</p>
                    <p className="text-sm font-semibold text-navy">{formatTime(event.eventDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  <div>
                    <p className="text-xs text-text-secondary">Venue</p>
                    <p className="text-sm font-semibold text-navy">{event.venue}</p>
                    <p className="text-xs text-text-secondary">{event.city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-crimson mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>
                  <div>
                    <p className="text-xs text-text-secondary">Tickets from</p>
                    <p className="text-sm font-bold text-crimson">
                      {event.ticketTiers?.length
                        ? formatCurrency(Math.min(...event.ticketTiers.map(t => t.price)))
                        : 'Free'}
                    </p>
                  </div>
                </div>
              </div>
              {totalTickets > 0 ? (
                <div className="mb-4 p-3 bg-crimson/5 rounded-lg border border-crimson/20">
                  <p className="text-sm font-semibold text-navy">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</p>
                  <p className="text-crimson font-bold text-lg">{formatCurrency(totalPrice)}</p>
                </div>
              ) : null}
              <button onClick={handleBuyTickets} className="w-full btn-primary">
                {totalTickets > 0 ? 'Continue to Checkout' : 'Get Tickets'}
              </button>
            </div>
          </aside>
        </div>

        {/* Related Events */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="section-heading mb-7">More Events You May Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
