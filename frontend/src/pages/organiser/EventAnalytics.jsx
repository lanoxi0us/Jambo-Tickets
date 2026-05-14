import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import api from '../../utils/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'

function StatPill({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-text-secondary text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-navy">{value}</p>
    </div>
  )
}

export default function EventAnalytics() {
  const { id } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event-analytics', id],
    queryFn: () => api.get(`/events/${id}/analytics`).then(r => r.data.data),
  })

  const exportCSV = () => {
    if (!data?.attendees?.length) return
    const headers = ['Name', 'Email', 'Phone', 'Booking Ref', 'Tickets', 'Date']
    const rows = data.attendees.map(a => [
      a.name,
      a.email,
      a.phone,
      a.ref,
      a.tickets.map(t => `${t.tier}×${t.qty}`).join(' | '),
      new Date(a.date).toLocaleDateString('en-KE'),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendees-${id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  )

  if (isError) return (
    <div className="card p-10 text-center">
      <p className="text-text-secondary mb-4">Failed to load analytics.</p>
      <Link to="/organiser/events" className="btn-secondary text-sm">Back to Events</Link>
    </div>
  )

  const d = data

  return (
    <>
      <Helmet><title>Event Analytics — Organiser</title></Helmet>
      <div className="space-y-7">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link to="/organiser/events" className="text-sm text-text-secondary hover:text-navy flex items-center gap-1 mb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              My Events
            </Link>
            <h1 className="text-2xl font-extrabold text-navy">Event Analytics</h1>
          </div>
          <button
            onClick={exportCSV}
            disabled={!d.attendees?.length}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export Attendees CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatPill label="Total Revenue" value={formatCurrency(d.totalRevenue)} />
          <StatPill label="Tickets Sold" value={d.totalTickets} />
          <StatPill label="Confirmed Bookings" value={d.totalBookings} />
        </div>

        {/* Sales over time */}
        <div className="card p-6">
          <h2 className="font-bold text-navy mb-5">Ticket Sales Over Time</h2>
          {d.salesChart?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={d.salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v, name) => name === 'revenue' ? formatCurrency(v) : v} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="tickets" name="Tickets Sold"
                  stroke="#1A1A2E" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (KES)"
                  stroke="#E94560" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-text-secondary text-sm">
              No sales data yet
            </div>
          )}
        </div>

        {/* Tier breakdown */}
        <div className="card p-6">
          <h2 className="font-bold text-navy mb-5">Ticket Tier Breakdown</h2>
          {d.tierBreakdown?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={d.tierBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip />
                  <Bar dataKey="sold" name="Sold" fill="#E94560" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" name="Total Capacity" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-semibold text-text-secondary text-xs uppercase tracking-wide">Tier</th>
                      <th className="text-right py-2 font-semibold text-text-secondary text-xs uppercase tracking-wide">Sold</th>
                      <th className="text-right py-2 font-semibold text-text-secondary text-xs uppercase tracking-wide">Remaining</th>
                      <th className="text-right py-2 font-semibold text-text-secondary text-xs uppercase tracking-wide">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {d.tierBreakdown.map(t => (
                      <tr key={t.name}>
                        <td className="py-2.5 font-medium text-navy">{t.name}</td>
                        <td className="py-2.5 text-right text-text-secondary">{t.sold} / {t.total}</td>
                        <td className="py-2.5 text-right text-text-secondary">{t.total - t.sold}</td>
                        <td className="py-2.5 text-right font-semibold text-navy">{formatCurrency(t.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-text-secondary text-sm">No tier data yet.</p>
          )}
        </div>

        {/* Attendees list */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-navy">Attendees ({d.attendees?.length || 0})</h2>
          </div>
          {d.attendees?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-gray-50">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Ref', 'Tickets'].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 font-semibold text-text-secondary text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {d.attendees.map(a => (
                    <tr key={a.ref} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-medium text-navy">{a.name}</td>
                      <td className="py-2.5 px-3 text-text-secondary text-xs">{a.email}</td>
                      <td className="py-2.5 px-3 text-text-secondary text-xs">{a.phone}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-crimson">{a.ref}</td>
                      <td className="py-2.5 px-3 text-text-secondary text-xs">
                        {a.tickets.map(t => `${t.tier} ×${t.qty}`).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary text-sm">No confirmed attendees yet.</p>
          )}
        </div>
      </div>
    </>
  )
}
