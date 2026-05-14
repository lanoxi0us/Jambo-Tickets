import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'

export default function OrganiserDashboard() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['organiser-dashboard'],
    queryFn: () => api.get('/users/organiser/dashboard').then(r => r.data.data),
  })

  const stats = [
    { label: 'Total Events', value: data?.totalEvents ?? 0, color: 'bg-navy/10 text-navy' },
    { label: 'Tickets Sold', value: data?.totalTickets ?? 0, color: 'bg-crimson/10 text-crimson' },
    { label: 'Total Revenue', value: formatCurrency(data?.totalRevenue ?? 0), color: 'bg-success/10 text-success' },
  ]

  return (
    <>
      <Helmet><title>Organiser Dashboard — Jambo Tickets</title></Helmet>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          <p className="text-text-secondary text-sm mt-1">Here's your event performance overview</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {stats.map(s => (
                <div key={s.label} className="card p-6">
                  <p className="text-text-secondary text-sm mb-2">{s.label}</p>
                  <p className={`text-2xl font-extrabold ${s.color.split(' ')[1]}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Link to="/organiser/create-event" className="card p-6 hover:shadow-card-hover transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-crimson/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-navy group-hover:text-crimson transition-colors">Create New Event</p>
                    <p className="text-text-secondary text-sm">Set up a new event with ticket tiers</p>
                  </div>
                </div>
              </Link>
              <Link to="/organiser/events" className="card p-6 hover:shadow-card-hover transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-navy group-hover:text-crimson transition-colors">Manage Events</p>
                    <p className="text-text-secondary text-sm">View, edit and track your events</p>
                  </div>
                </div>
              </Link>
              <Link to="/organiser/payouts" className="card p-6 hover:shadow-card-hover transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-navy group-hover:text-crimson transition-colors">Request Payout</p>
                    <p className="text-text-secondary text-sm">Withdraw your earnings</p>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
