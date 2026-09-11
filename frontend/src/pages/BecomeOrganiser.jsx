import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatters'

const STATUS_BADGE = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
}

export default function BecomeOrganiser() {
  const { user, loading: authLoading } = useAuth()
  const qc = useQueryClient()
  const [form, setForm] = useState({ businessName: '', description: '', phone: '' })

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-organiser-applications'],
    queryFn: () => api.get('/organiser-applications/my').then(r => r.data.data.applications),
    enabled: !!user,
  })

  const mutation = useMutation({
    mutationFn: (data) => api.post('/organiser-applications', data),
    onSuccess: () => {
      qc.invalidateQueries(['my-organiser-applications'])
      toast.success('Application submitted! We will review it within 1-2 business days.')
      setForm({ businessName: '', description: '', phone: '' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit application.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.businessName || !form.description || !form.phone) {
      toast.error('Please fill in all fields.')
      return
    }
    mutation.mutate(form)
  }

  const pendingApplication = applications?.find(a => a.status === 'PENDING')
  const latestApplication = applications?.[0]

  return (
    <>
      <Helmet><title>Become an Organiser — Jambo Tickets</title></Helmet>

      <div className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Become an Event Organiser
          </motion.h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            List your events on Jambo Tickets and reach thousands of ticket buyers across Kenya. Tell us about yourself to get started.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">

        {/* Not logged in */}
        {!authLoading && !user && (
          <div className="card p-8 text-center">
            <h2 className="text-xl font-bold text-navy mb-2">You'll need an account first</h2>
            <p className="text-text-secondary mb-6">Create a free Jambo Tickets account, then come back to apply as an organiser.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="btn-primary">Create Account</Link>
              <Link to="/login" className="btn-secondary">Log In</Link>
            </div>
          </div>
        )}

        {/* Logged in as ORGANISER already */}
        {!authLoading && user && (user.role === 'ORGANISER' || user.role === 'ADMIN') && (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">You're already an organiser</h2>
            <p className="text-text-secondary mb-6">You have full access to the Organiser Dashboard.</p>
            <Link to="/organiser" className="btn-primary">Go to Dashboard</Link>
          </div>
        )}

        {/* Logged in as USER */}
        {!authLoading && user && user.role === 'USER' && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : pendingApplication ? (
              <div className="card p-8 text-center">
                <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-navy mb-2">Application Under Review</h2>
                <p className="text-text-secondary mb-1">Your application for <strong className="text-navy">{pendingApplication.businessName}</strong> is being reviewed.</p>
                <p className="text-text-secondary text-sm mb-6">Submitted {formatDate(pendingApplication.createdAt)} &bull; We'll email you once a decision is made.</p>
                <span className={`badge text-xs ${STATUS_BADGE.PENDING}`}>Pending Review</span>
              </div>
            ) : (
              <>
                {latestApplication?.status === 'REJECTED' && (
                  <div className="card p-5 mb-6 border-l-4 border-crimson">
                    <p className="font-semibold text-navy mb-1">Your previous application was not approved</p>
                    {latestApplication.adminNotes && (
                      <p className="text-text-secondary text-sm">{latestApplication.adminNotes}</p>
                    )}
                    <p className="text-text-secondary text-sm mt-1">You're welcome to apply again below.</p>
                  </div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
                  <h2 className="text-xl font-bold text-navy mb-6">Organiser Application</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="label">Business / Organisation Name</label>
                      <input
                        value={form.businessName}
                        onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                        className="input-field"
                        placeholder="e.g. Nairobi Live Events Ltd"
                      />
                    </div>
                    <div>
                      <label className="label">Tell us about the events you plan to host</label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={5}
                        className="input-field resize-none"
                        placeholder="e.g. We organise monthly music concerts and corporate networking events across Nairobi..."
                      />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="input-field"
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                    <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
                      {mutation.isPending ? <><LoadingSpinner size="sm" color="white" /> Submitting...</> : 'Submit Application'}
                    </button>
                  </form>
                  <p className="text-text-secondary text-xs mt-5 text-center">
                    Our team typically reviews applications within 1-2 business days. You'll receive an email once a decision is made.
                  </p>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
