import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate, formatCurrency } from '../../utils/formatters'

const STATUS_BADGE = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

export default function MyEvents() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['organiser-events'],
    queryFn: () => api.get('/events/organiser/mine').then(r => r.data.data.events),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => { qc.invalidateQueries(['organiser-events']); toast.success('Event deleted.') },
    onError: () => toast.error('Failed to delete.'),
  })

  return (
    <>
      <Helmet><title>My Events — Organiser</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">My Events</h1>
            <p className="text-text-secondary text-sm mt-0.5">{data?.length || 0} events</p>
          </div>
          <Link to="/organiser/create-event" className="btn-primary text-sm">Create Event</Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : !data?.length ? (
          <div className="card p-16 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" /></svg>
            <p className="text-text-secondary mb-4">You have not created any events yet.</p>
            <Link to="/organiser/create-event" className="btn-primary text-sm">Create Your First Event</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map(event => {
              const totalSold = event.ticketTiers.reduce((s, t) => s + t.soldQuantity, 0)
              const totalQty = event.ticketTiers.reduce((s, t) => s + t.totalQuantity, 0)
              return (
                <div key={event.id} className="card p-5">
                  <div className="flex items-start gap-4 flex-wrap">
                    {event.coverImage && (
                      <img src={event.coverImage} alt={event.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-navy">{event.title}</h3>
                        <span className={`badge text-xs ${STATUS_BADGE[event.status]}`}>{event.status}</span>
                      </div>
                      <p className="text-text-secondary text-sm">{event.venue} — {formatDate(event.eventDate)}</p>
                      <p className="text-xs text-text-secondary mt-1">{totalSold} / {totalQty} tickets sold</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/events/${event.slug}`} target="_blank" className="btn-secondary text-xs py-1.5 px-3">View</Link>
                      <Link to={`/organiser/events/${event.id}/analytics`} className="btn-secondary text-xs py-1.5 px-3">Analytics</Link>
                      <button onClick={() => { if (confirm('Delete this event permanently?')) deleteMutation.mutate(event.id) }}
                        className="text-xs font-medium text-crimson hover:underline px-1">Delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
