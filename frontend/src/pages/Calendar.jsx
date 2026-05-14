import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatTime } from '../utils/formatters'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const CATEGORY_DOT = {
  Music: 'bg-purple-400',
  Corporate: 'bg-blue-400',
  Sports: 'bg-green-400',
  Entertainment: 'bg-orange-400',
  'Film & Theatre': 'bg-pink-400',
}

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => api.get('/calendar', { params: { month, year } }).then(r => r.data.data.events),
    keepPreviousData: true,
  })

  const eventDates = data ? Object.keys(data) : []

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const dateKey = (d) => `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  const selectedEvents = selectedDate ? (data?.[dateKey(selectedDate)] || []) : []

  return (
    <>
      <Helmet><title>Event Calendar — Jambo Tickets</title></Helmet>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <h1 className="section-heading mb-1">Event Calendar</h1>
          <p className="text-text-secondary text-sm">Browse upcoming events by date</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2 card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
              </button>
              <h2 className="font-bold text-navy text-lg">{MONTH_NAMES[month-1]} {year}</h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-text-secondary py-1">{d}</div>
              ))}
            </div>

            {/* Cells */}
            {isLoading ? (
              <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />
                  const key = dateKey(day)
                  const hasEvents = eventDates.includes(key)
                  const isToday = day === today.getDate() && month === today.getMonth()+1 && year === today.getFullYear()
                  const isSelected = selectedDate === day
                  const dayEvents = data?.[key] || []

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 text-sm font-medium transition-all duration-150
                        ${isSelected ? 'bg-navy text-white' : isToday ? 'bg-crimson/10 text-crimson' : 'hover:bg-gray-100 text-text-primary'}
                      `}
                    >
                      <span>{day}</span>
                      {hasEvents && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayEvents.slice(0,3).map((ev, idx) => (
                            <span key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : CATEGORY_DOT[ev.category] || 'bg-gray-400'}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-4">
              {Object.entries(CATEGORY_DOT).map(([cat, dot]) => (
                <div key={cat} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Selected day events */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {selectedDate ? (
                <motion.div key={selectedDate} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
                  <h3 className="font-bold text-navy mb-3">
                    {MONTH_NAMES[month-1]} {selectedDate}, {year}
                  </h3>
                  {selectedEvents.length === 0 ? (
                    <div className="card p-6 text-center">
                      <p className="text-text-secondary text-sm">No events on this day.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedEvents.map(ev => (
                        <Link key={ev.id} to={`/events/${ev.slug}`} className="card block p-4 hover:shadow-card-hover transition-all duration-150 group">
                          {ev.coverImage && (
                            <img src={ev.coverImage} alt={ev.title} className="w-full h-28 object-cover rounded-lg mb-3" />
                          )}
                          <span className={`badge text-xs mb-2 ${CATEGORY_DOT[ev.category] ? '' : 'bg-gray-100 text-gray-600'}`} style={{background: 'transparent'}}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${CATEGORY_DOT[ev.category] || 'bg-gray-400'}`} />
                            {ev.category}
                          </span>
                          <h4 className="font-bold text-navy text-sm group-hover:text-crimson transition-colors line-clamp-2">{ev.title}</h4>
                          <p className="text-text-secondary text-xs mt-1">{formatTime(ev.eventDate)} · {ev.venue}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <div className="card p-8 text-center">
                    <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    <p className="text-text-secondary text-sm">Select a date to view events</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}
