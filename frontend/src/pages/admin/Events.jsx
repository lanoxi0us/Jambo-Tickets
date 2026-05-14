import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/formatters'

const STATUS_BADGE = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

export default function AdminEvents() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', page, search, status],
    queryFn: () => api.get('/events/admin/all', { params: { page, limit: 15, search, status } }).then(r => r.data.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/events/${id}/approve`),
    onSuccess: () => { qc.invalidateQueries(['admin-events']); toast.success('Event published.') },
    onError: () => toast.error('Failed to update event.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin-events']); toast.success('Event deleted.') },
    onError: () => toast.error('Failed to delete event.'),
  })

  return (
    <>
      <Helmet><title>Events — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Events</h1>
            <p className="text-text-secondary text-sm mt-0.5">Manage all platform events</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap gap-3">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search events..." className="input-field max-w-xs" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-field w-40">
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">Event</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">Organiser</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.events?.map(event => (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-navy line-clamp-1">{event.title}</p>
                          <p className="text-xs text-text-secondary">{event.venue}, {event.city}</p>
                        </td>
                        <td className="py-3 px-4 text-text-secondary text-xs">{event.organiser?.fullName}</td>
                        <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(event.eventDate)}</td>
                        <td className="py-3 px-4">
                          <span className={`badge text-xs ${STATUS_BADGE[event.status]}`}>{event.status}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {event.status === 'DRAFT' && (
                              <button onClick={() => approveMutation.mutate(event.id)} className="text-xs font-medium text-success hover:underline">Publish</button>
                            )}
                            <a href={`/events/${event.slug}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-navy hover:underline">View</a>
                            <button onClick={() => { if (confirm('Delete this event?')) deleteMutation.mutate(event.id) }} className="text-xs font-medium text-crimson hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data?.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Previous</button>
                  <span className="text-sm text-text-secondary">Page {page} of {data.totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
