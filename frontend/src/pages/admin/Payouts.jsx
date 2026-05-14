import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate, formatCurrency } from '../../utils/formatters'

const STATUS_BADGE = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
}

export default function AdminPayouts() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => api.get('/payouts').then(r => r.data.data.payouts),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }) => api.patch(`/payouts/${id}/status`, { status, notes }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['admin-payouts'])
      toast.success(`Payout ${vars.status.toLowerCase()}.`)
    },
    onError: () => toast.error('Failed to update payout.'),
  })

  return (
    <>
      <Helmet><title>Payouts — Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Payout Requests</h1>
          <p className="text-text-secondary text-sm mt-0.5">Approve or reject organiser payout requests</p>
        </div>

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : !data?.length ? (
            <div className="py-16 text-center text-text-secondary">No payout requests yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-gray-50">
                  <tr>
                    {['Organiser', 'Amount', 'Bank', 'Account', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-navy">{p.organiser?.fullName}</p>
                        <p className="text-xs text-text-secondary">{p.organiser?.email}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-navy">{formatCurrency(p.amount)}</td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{p.bankName || '—'}</td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{p.accountNo || '—'}</td>
                      <td className="py-3 px-4"><span className={`badge text-xs ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(p.createdAt)}</td>
                      <td className="py-3 px-4">
                        {p.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateMutation.mutate({ id: p.id, status: 'APPROVED' })} className="text-xs font-medium text-success hover:underline">Approve</button>
                            <button onClick={() => updateMutation.mutate({ id: p.id, status: 'REJECTED' })} className="text-xs font-medium text-crimson hover:underline">Reject</button>
                          </div>
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
    </>
  )
}
