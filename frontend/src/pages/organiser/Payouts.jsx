import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../../utils/formatters'

const STATUS_BADGE = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
}

export default function Payouts() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ amount: '', bankName: '', accountName: '', accountNo: '' })

  const { data: payouts, isLoading } = useQuery({
    queryKey: ['organiser-payouts'],
    queryFn: () => api.get('/payouts/my').then(r => r.data.data.payouts),
  })

  const mutation = useMutation({
    mutationFn: (data) => api.post('/payouts', data),
    onSuccess: () => {
      qc.invalidateQueries(['organiser-payouts'])
      toast.success('Payout request submitted. We will review within 2 business days.')
      setForm({ amount: '', bankName: '', accountName: '', accountNo: '' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit request.'),
  })

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter a valid amount.'); return }
    mutation.mutate(form)
  }

  return (
    <>
      <Helmet><title>Payouts — Organiser</title></Helmet>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Payouts</h1>
          <p className="text-text-secondary text-sm mt-1">Request a withdrawal of your event earnings</p>
        </div>

        {/* Request form */}
        <div className="card p-7">
          <h2 className="font-bold text-navy text-lg mb-5">New Payout Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Amount to Withdraw (KES)</label>
              <input
                type="number" min="100" step="1"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="input-field max-w-xs"
                placeholder="e.g. 25000"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Bank Name</label>
                <input
                  value={form.bankName}
                  onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Equity Bank"
                />
              </div>
              <div>
                <label className="label">Account Holder Name</label>
                <input
                  value={form.accountName}
                  onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
                  className="input-field"
                  placeholder="Name as on account"
                />
              </div>
            </div>
            <div>
              <label className="label">Account Number / MPESA</label>
              <input
                value={form.accountNo}
                onChange={e => setForm(f => ({ ...f, accountNo: e.target.value }))}
                className="input-field max-w-xs"
                placeholder="Account number or M-Pesa number"
              />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={mutation.isPending} className="btn-primary">
                {mutation.isPending
                  ? <><LoadingSpinner size="sm" color="white" /> Submitting...</>
                  : 'Submit Payout Request'}
              </button>
            </div>
          </form>
          <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
            Payout requests are reviewed within 1–2 business days. Funds are transferred via bank or M-Pesa after approval.
            A platform fee of 5% is deducted from your total revenue.
          </div>
        </div>

        {/* History */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-bold text-navy">Payout History</h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : !payouts?.length ? (
            <div className="py-12 text-center text-text-secondary text-sm">
              No payout requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-gray-50">
                  <tr>
                    {['Amount', 'Bank', 'Account', 'Status', 'Requested', 'Notes'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payouts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-navy">{formatCurrency(p.amount)}</td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{p.bankName || '—'}</td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{p.accountNo || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`badge text-xs ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(p.createdAt)}</td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{p.notes || '—'}</td>
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
