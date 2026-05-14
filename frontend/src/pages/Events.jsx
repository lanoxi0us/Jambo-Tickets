import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = ['Music', 'Corporate', 'Entertainment', 'Sports', 'Film & Theatre']
const CITIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Lamu']
const SORTS = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'This Weekend', value: 'this-weekend' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' },
]

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [sort, setSort] = useState('upcoming')
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['events', search, category, city, sort, page],
    queryFn: () => {
      const params = new URLSearchParams({ sort, page, limit: 12 })
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (city) params.set('city', city)
      return api.get(`/events?${params}`).then(r => r.data.data)
    },
    keepPreviousData: true,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchParams(search ? { search } : {})
  }

  const clearFilters = () => { setCategory(''); setCity(''); setSort('upcoming'); setSearch(''); setPage(1) }

  const FilterPanel = () => (
    <div className="space-y-7">
      <div>
        <h3 className="font-bold text-navy text-sm mb-3 uppercase tracking-wide">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="category" checked={category === cat} onChange={() => { setCategory(cat); setPage(1) }}
                className="w-4 h-4 accent-crimson" />
              <span className={`text-sm transition-colors ${category === cat ? 'text-crimson font-semibold' : 'text-text-secondary group-hover:text-navy'}`}>{cat}</span>
            </label>
          ))}
          {category && (
            <button onClick={() => setCategory('')} className="text-xs text-crimson hover:underline mt-1">Clear</button>
          )}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-navy text-sm mb-3 uppercase tracking-wide">City</h3>
        <div className="space-y-2">
          {CITIES.map(c => (
            <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="city" checked={city === c} onChange={() => { setCity(c); setPage(1) }}
                className="w-4 h-4 accent-crimson" />
              <span className={`text-sm transition-colors ${city === c ? 'text-crimson font-semibold' : 'text-text-secondary group-hover:text-navy'}`}>{c}</span>
            </label>
          ))}
          {city && <button onClick={() => setCity('')} className="text-xs text-crimson hover:underline mt-1">Clear</button>}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-navy text-sm mb-3 uppercase tracking-wide">When</h3>
        <div className="space-y-2">
          {SORTS.map(s => (
            <label key={s.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="sort" checked={sort === s.value} onChange={() => { setSort(s.value); setPage(1) }}
                className="w-4 h-4 accent-crimson" />
              <span className={`text-sm transition-colors ${sort === s.value ? 'text-crimson font-semibold' : 'text-text-secondary group-hover:text-navy'}`}>{s.label}</span>
            </label>
          ))}
        </div>
      </div>
      {(category || city || sort !== 'upcoming') && (
        <button onClick={clearFilters} className="w-full btn-secondary text-sm py-2">Clear All Filters</button>
      )}
    </div>
  )

  return (
    <>
      <Helmet>
        <title>Events in Kenya — Jambo Tickets</title>
        <meta name="description" content="Browse all events in Kenya. Find concerts, sports, conferences and more." />
      </Helmet>

      <div className="bg-navy py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-white mb-4">All Events</h1>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events or venues..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-white/50" />
            </div>
            <button type="submit" className="bg-crimson hover:bg-crimson-hover text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <p className="text-text-secondary text-sm">{data?.total || 0} events found</p>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-2 btn-secondary text-sm py-2 px-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6 12h9.75M6 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 6H18M10.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
            Filters
          </button>
        </div>

        {sidebarOpen && (
          <div className="mb-6 p-5 bg-white rounded-xl border border-border md:hidden">
            <FilterPanel />
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-xl border border-border p-5">
              <FilterPanel />
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-text-secondary text-sm">{data?.total || 0} events found</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
            ) : data?.events?.length ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {data.events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                      className="w-9 h-9 rounded-lg border border-border hover:border-navy disabled:opacity-40 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-navy text-white' : 'border border-border hover:border-navy'}`}>
                        {p}
                      </button>
                    ))}
                    <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}
                      className="w-9 h-9 rounded-lg border border-border hover:border-navy disabled:opacity-40 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" /></svg>
                <p className="text-text-secondary font-medium">No events found.</p>
                <button onClick={clearFilters} className="text-crimson text-sm mt-2 hover:underline">Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
