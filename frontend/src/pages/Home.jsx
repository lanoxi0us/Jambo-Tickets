import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = ['All', 'Music', 'Corporate', 'Entertainment', 'Sports', 'Film & Theatre']
const SORTS = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'This Weekend', value: 'this-weekend' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' },
]

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 25)
    return () => clearInterval(timer)
  }, [inView, target])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('upcoming')
  const carouselRef = useRef(null)

  const { data: featuredData } = useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => api.get('/events?featured=true&limit=8').then(r => r.data.data.events),
  })

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', 'grid', category, sort],
    queryFn: () => api.get(`/events?${category !== 'All' ? `category=${category}&` : ''}sort=${sort}&limit=12`).then(r => r.data.data),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/events?search=${encodeURIComponent(search)}`)
  }

  const scrollCarousel = (dir) => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <>
      <Helmet>
        <title>Jambo Tickets — Kenya's Premier Event Ticketing Platform</title>
        <meta name="description" content="Buy tickets for the best events in Kenya. Concerts, sports, conferences, festivals and more." />
      </Helmet>

      {/* Hero */}
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-crimson rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-block bg-crimson/20 text-crimson border border-crimson/30 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide uppercase">
                Kenya's Premier Ticketing Platform
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight"
            >
              Discover &amp; Book{' '}
              <span className="text-crimson">Unforgettable</span> Experiences
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-300 text-lg mb-9 leading-relaxed"
            >
              From Nairobi jazz nights to Mombasa beach festivals — your next great event is one click away.
            </motion.p>
            <motion.form
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSearch}
              className="flex gap-2 max-w-xl mx-auto"
            >
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search events, venues or cities..."
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
              <button type="submit" className="bg-crimson hover:bg-crimson-hover text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm whitespace-nowrap">
                Search
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      {featuredData?.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-7">
              <h2 className="section-heading">Featured Events</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => scrollCarousel(-1)} className="w-9 h-9 rounded-full border border-border hover:border-navy hover:bg-navy hover:text-white transition-all flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => scrollCarousel(1)} className="w-9 h-9 rounded-full border border-border hover:border-navy hover:bg-navy hover:text-white transition-all flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                <Link to="/events" className="text-crimson text-sm font-semibold hover:underline ml-2">View All</Link>
              </div>
            </div>
            <div ref={carouselRef} className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {featuredData.map((event, i) => (
                <div key={event.id} className="flex-shrink-0 w-72" style={{ scrollSnapAlign: 'start' }}>
                  <EventCard event={event} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Grid with Filters */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
            <h2 className="section-heading">Browse Events</h2>
            <div className="flex flex-wrap items-center gap-2">
              {SORTS.map(s => (
                <button key={s.value} onClick={() => setSort(s.value)}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all ${sort === s.value ? 'bg-navy text-white border-navy' : 'bg-white text-text-secondary border-border hover:border-navy'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap mb-8">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`text-sm font-medium px-4 py-2 rounded-full border transition-all ${category === cat ? 'bg-crimson text-white border-crimson' : 'bg-white text-text-secondary border-border hover:border-crimson hover:text-crimson'}`}>
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : eventsData?.events?.length ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {eventsData.events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
              </div>
              <div className="text-center mt-10">
                <Link to="/events" className="btn-navy inline-flex">
                  Browse All Events
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-text-secondary">No events found for the selected filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-heading mb-3">
              How It Works
            </motion.h2>
            <p className="text-text-secondary">Get your tickets in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Browse Events', desc: 'Explore hundreds of events across Kenya — concerts, sports, conferences, and festivals.', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> },
              { step: '02', title: 'Buy Your Ticket', desc: 'Select your tickets and pay securely via M-Pesa. Instant confirmation with unique QR code.', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
              { step: '03', title: 'Attend the Event', desc: 'Show your QR code at the gate. No printout needed — your phone is your ticket.', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg> },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-7 rounded-2xl bg-background border border-border hover:border-crimson/30 hover:shadow-card transition-all duration-200">
                <div className="w-14 h-14 bg-crimson/10 text-crimson rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-crimson tracking-widest">{item.step}</span>
                <h3 className="font-bold text-navy text-lg mt-1 mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Events Hosted', value: 1240, suffix: '+' },
              { label: 'Tickets Sold', value: 85000, suffix: '+' },
              { label: 'Happy Customers', value: 42000, suffix: '+' },
              { label: 'Cities Covered', value: 18, suffix: '' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-heading mb-4">Are You an Event Organiser?</h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              List your event on Jambo Tickets and reach thousands of ticket buyers across Kenya. Easy setup, M-Pesa payouts, real-time analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="btn-primary">Create Organiser Account</Link>
              <Link to="/about" className="btn-secondary">Learn More</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
