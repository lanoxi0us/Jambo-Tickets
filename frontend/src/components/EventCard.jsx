import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDate, formatTime, formatCurrency } from '../utils/formatters'

const CATEGORY_COLORS = {
  Music: 'bg-purple-100 text-purple-700',
  Corporate: 'bg-blue-100 text-blue-700',
  Sports: 'bg-green-100 text-green-700',
  Entertainment: 'bg-orange-100 text-orange-700',
  'Film & Theatre': 'bg-pink-100 text-pink-700',
}

export default function EventCard({ event, index = 0 }) {
  const minPrice = event.ticketTiers?.length
    ? Math.min(...event.ticketTiers.map(t => t.price))
    : null

  const maxPrice = event.ticketTiers?.length
    ? Math.max(...event.ticketTiers.map(t => t.price))
    : null

  const isSoldOut = event.ticketTiers?.every(t => t.soldQuantity >= t.totalQuantity)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/events/${event.slug}`} className="card group block hover:shadow-card-hover transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          {event.coverImage ? (
            <img
              src={event.coverImage.startsWith('/') ? event.coverImage : event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy to-navy-dark flex items-center justify-center">
              <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
            </div>
          )}
          {event.featured && (
            <span className="absolute top-3 left-3 bg-amber text-white text-xs font-bold px-2.5 py-1 rounded-full">Featured</span>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-navy font-bold px-4 py-1.5 rounded-full text-sm">Sold Out</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className={`badge text-xs ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-600'}`}>
              {event.category}
            </span>
          </div>
          <h3 className="font-bold text-navy text-base leading-tight mb-2 group-hover:text-crimson transition-colors line-clamp-2">
            {event.title}
          </h3>
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-text-secondary text-xs">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              <span>{formatDate(event.eventDate)} at {formatTime(event.eventDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary text-xs">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              <span className="truncate">{event.venue}, {event.city}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              {minPrice !== null ? (
                <span className="font-bold text-navy text-sm">
                  {minPrice === 0 ? 'Free' : `From ${formatCurrency(minPrice)}`}
                  {maxPrice !== minPrice && ` — ${formatCurrency(maxPrice)}`}
                </span>
              ) : (
                <span className="text-text-secondary text-sm">Free</span>
              )}
            </div>
            <span className="text-crimson text-xs font-semibold group-hover:underline">
              {isSoldOut ? 'View Details' : 'Buy Tickets'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
