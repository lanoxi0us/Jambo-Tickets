import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate, formatCurrency } from '../../utils/formatters'

const STATUS_BADGE = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-gray-100 text-gray-600',
  USED: 'bg-blue-100 text-blue-700',
}

export default function AdminBookings() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page, search, statusFilter],
    queryFn: () => api.get('/bookings/admin/all', { params: { page, limit: 20, search, status: statusFilter } }).then(r => r.data.data),
  })

  return (
    <>
      <Helmet><title>Bookings — Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Bookings</h1>
          <p className="text-text-secondary text-sm mt-0.5">All ticket purchases across the platform</p>
        </div>

        <div className="card p-4 flex flex-wrap gap-3">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search ref, name, email..." className="input-field max-w-xs" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="input-field w-40">
            <option value="">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-gray-50">
                  <tr>
                    {['Booking Ref', 'Buyer', 'Event', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data?.bookings?.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-navy font-semibold">{b.bookingRef}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-navy">{b.buyerName}</p>
                        <p className="text-xs text-text-secondary">{b.buyerPhone}</p>
                      </td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{b.event?.title}</td>
                      <td className="py-3 px-4 font-semibold text-navy">{formatCurrency(b.totalAmount)}</td>
                      <td className="py-3 px-4"><span className={`badge text-xs ${STATUS_BADGE[b.status] || ''}`}>{b.status}</span></td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(b.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Previous</button>
                  <span className="text-sm text-text-secondary">Page {page} of {data.totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
