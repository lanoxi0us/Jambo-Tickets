import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../utils/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'

function StatCard({ label, value, icon, color = 'crimson' }) {
  const colors = { crimson: 'bg-crimson/10 text-crimson', navy: 'bg-navy/10 text-navy', amber: 'bg-amber/10 text-amber', success: 'bg-success/10 text-success' }
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-secondary text-sm font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>{icon}</div>
      </div>
      <p className="text-2xl font-extrabold text-navy">{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/users/admin/dashboard').then(r => r.data.data),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>

  const d = data || {}

  return (
    <>
      <Helmet><title>Admin Dashboard — Jambo Tickets</title></Helmet>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Platform overview and analytics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard label="Total Events" value={d.totalEvents || 0} color="navy"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" /></svg>}
          />
          <StatCard label="Total Revenue" value={formatCurrency(d.totalRevenue || 0)} color="success"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" /></svg>}
          />
          <StatCard label="Total Users" value={d.totalUsers || 0} color="amber"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
          />
          <StatCard label="Confirmed Bookings" value={d.totalBookings || 0} color="crimson"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-bold text-navy mb-5">Revenue (Last 6 Months)</h2>
            {d.revenueChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={d.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#E94560" strokeWidth={2.5} dot={{ fill: '#E94560', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-text-secondary text-sm">No revenue data yet</div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-navy mb-5">Events by Category</h2>
            {d.eventsByCategory?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={d.eventsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip />
                  <Bar dataKey="_count" name="Events" fill="#1A1A2E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-text-secondary text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="card p-6">
          <h2 className="font-bold text-navy mb-5">Recent Confirmed Bookings</h2>
          {d.recentBookings?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-semibold text-text-secondary text-xs uppercase tracking-wide">Buyer</th>
                    <th className="text-left py-3 px-2 font-semibold text-text-secondary text-xs uppercase tracking-wide">Event</th>
                    <th className="text-left py-3 px-2 font-semibold text-text-secondary text-xs uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {d.recentBookings.map(b => (
                    <tr key={b.id}>
                      <td className="py-3 px-2"><p className="font-medium text-navy">{b.buyerName}</p><p className="text-xs text-text-secondary">{b.buyerEmail}</p></td>
                      <td className="py-3 px-2 text-text-secondary">{b.event?.title}</td>
                      <td className="py-3 px-2 font-semibold text-navy">{formatCurrency(b.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary text-sm">No confirmed bookings yet.</p>
          )}
        </div>
      </div>
    </>
  )
}
