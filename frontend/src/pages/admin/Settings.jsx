import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminSettings() {
  const [form, setForm] = useState({
    platform_name: '',
    contact_email: '',
    mpesa_shortcode: '',
    platform_fee_percent: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: () => api.get('/settings').then(r => r.data.data.settings),
  })

  useEffect(() => {
    if (data) setForm(f => ({ ...f, ...data }))
  }, [data])

  const mutation = useMutation({
    mutationFn: (values) => api.put('/settings', values),
    onSuccess: () => toast.success('Settings saved.'),
    onError: () => toast.error('Failed to save settings.'),
  })

  const handleSubmit = e => {
    e.preventDefault()
    mutation.mutate(form)
  }

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  return (
    <>
      <Helmet><title>Settings — Admin</title></Helmet>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Platform Settings</h1>
          <p className="text-text-secondary text-sm mt-0.5">Configure global platform settings</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="label">Platform Name</label>
            <input value={form.platform_name} onChange={e => setForm(f => ({ ...f, platform_name: e.target.value }))} className="input-field" placeholder="Jambo Tickets" />
          </div>
          <div>
            <label className="label">Contact Email</label>
            <input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} className="input-field" placeholder="info@jambotikets.co.ke" />
          </div>
          <div>
            <label className="label">M-Pesa Shortcode</label>
            <input value={form.mpesa_shortcode} onChange={e => setForm(f => ({ ...f, mpesa_shortcode: e.target.value }))} className="input-field" placeholder="174379" />
          </div>
          <div>
            <label className="label">Platform Fee (%)</label>
            <input type="number" min="0" max="30" step="0.5" value={form.platform_fee_percent} onChange={e => setForm(f => ({ ...f, platform_fee_percent: e.target.value }))} className="input-field" placeholder="5" />
            <p className="text-xs text-text-secondary mt-1">Percentage deducted from organiser revenue per booking</p>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? <><LoadingSpinner size="sm" color="white" /> Saving...</> : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
