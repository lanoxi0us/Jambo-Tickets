import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/formatters'

const STATUS_BADGE = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
}

function ReviewModal({ application, onClose, onApprove, onReject, isPending }) {
  const [notes, setNotes] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-navy text-lg mb-1">{application.businessName}</h3>
        <p className="text-text-secondary text-sm mb-4">{application.user?.fullName} &bull; {application.user?.email}</p>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-navy">{application.description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Phone</p>
            <p className="text-sm text-navy">{application.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Applied</p>
            <p className="text-sm text-navy">{formatDate(application.createdAt)}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="label">Notes (optional — included in rejection email)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="input-field resize-none text-sm"
            placeholder="e.g. Please provide more details about your event history..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onApprove(notes)}
            disabled={isPending}
            className="flex-1 bg-success text-white font-semibold py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(notes)}
            disabled={isPending}
            className="flex-1 bg-crimson text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-crimson-hover transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button onClick={onClose} className="btn-secondary text-sm py-2.5 px-4">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminOrganiserApplications() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [reviewing, setReviewing] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-organiser-applications', statusFilter],
    queryFn: () => api.get('/organiser-applications', { params: statusFilter ? { status: statusFilter } : {} }).then(r => r.data.data.applications),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }) => api.patch(`/organiser-applications/${id}/status`, { status, adminNotes }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['admin-organiser-applications'])
      toast.success(`Application ${vars.status.toLowerCase()}.`)
      setReviewing(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update application.'),
  })

  return (
    <>
      <Helmet><title>Organiser Applications — Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Organiser Applications</h1>
          <p className="text-text-secondary text-sm mt-0.5">Review applications from users wanting to become event organisers</p>
        </div>

        <div className="card p-4 flex flex-wrap gap-3">
          {['PENDING', 'APPROVED', 'REJECTED', ''].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-navy text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : !data?.length ? (
            <div className="py-16 text-center text-text-secondary">No applications found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-gray-50">
                  <tr>
                    {['Business', 'Applicant', 'Phone', 'Status', 'Applied', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-navy">{app.businessName}</p>
                        <p className="text-xs text-text-secondary line-clamp-1 max-w-xs">{app.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-navy">{app.user?.fullName}</p>
                        <p className="text-xs text-text-secondary">{app.user?.email}</p>
                      </td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{app.phone}</td>
                      <td className="py-3 px-4"><span className={`badge text-xs ${STATUS_BADGE[app.status]}`}>{app.status}</span></td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(app.createdAt)}</td>
                      <td className="py-3 px-4">
                        {app.status === 'PENDING' ? (
                          <button onClick={() => setReviewing(app)} className="text-xs font-medium text-navy hover:underline">Review</button>
                        ) : (
                          <span className="text-xs text-text-secondary">
                            {app.adminNotes ? `Note: ${app.adminNotes}` : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {reviewing && (
        <ReviewModal
          application={reviewing}
          onClose={() => setReviewing(null)}
          isPending={updateMutation.isPending}
          onApprove={(notes) => updateMutation.mutate({ id: reviewing.id, status: 'APPROVED', adminNotes: notes })}
          onReject={(notes) => updateMutation.mutate({ id: reviewing.id, status: 'REJECTED', adminNotes: notes })}
        />
      )}
    </>
  )
}
