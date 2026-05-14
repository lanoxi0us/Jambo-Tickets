import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const CATEGORIES = ['Music', 'Corporate', 'Sports', 'Entertainment', 'Film & Theatre']

function TierRow({ tier, index, onChange, onRemove }) {
  return (
    <div className="border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-navy text-sm">Tier {index + 1}</span>
        {index > 0 && (
          <button type="button" onClick={onRemove} className="text-crimson hover:underline text-xs">Remove</button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="label text-xs">Tier Name</label>
          <input value={tier.name} onChange={e => onChange('name', e.target.value)} className="input-field text-sm" placeholder="e.g. VIP" required />
        </div>
        <div>
          <label className="label text-xs">Price (KES)</label>
          <input type="number" min="0" value={tier.price} onChange={e => onChange('price', e.target.value)} className="input-field text-sm" placeholder="2500" required />
        </div>
        <div>
          <label className="label text-xs">Total Quantity</label>
          <input type="number" min="1" value={tier.totalQuantity} onChange={e => onChange('totalQuantity', e.target.value)} className="input-field text-sm" placeholder="100" required />
        </div>
      </div>
      <div>
        <label className="label text-xs">Description (optional)</label>
        <input value={tier.description} onChange={e => onChange('description', e.target.value)} className="input-field text-sm" placeholder="What's included in this tier" />
      </div>
    </div>
  )
}

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category: 'Music', venue: '', city: 'Nairobi',
    eventDate: '', endDate: '', status: 'DRAFT',
  })
  const [coverImage, setCoverImage] = useState(null)
  const [tiers, setTiers] = useState([{ name: '', price: '', totalQuantity: '', description: '' }])

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const updateTier = (i, field, val) => {
    setTiers(ts => ts.map((t, idx) => idx === i ? { ...t, [field]: val } : t))
  }

  const addTier = () => setTiers(ts => [...ts, { name: '', price: '', totalQuantity: '', description: '' }])
  const removeTier = (i) => setTiers(ts => ts.filter((_, idx) => idx !== i))

  const handleSubmit = async e => {
    e.preventDefault()
    if (tiers.some(t => !t.name || !t.price || !t.totalQuantity)) {
      toast.error('Please fill in all ticket tier fields.')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('ticketTiers', JSON.stringify(tiers))
      if (coverImage) fd.append('coverImage', coverImage)
      await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Event created successfully!')
      navigate('/organiser/events')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Create Event — Organiser</title></Helmet>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Create New Event</h1>
          <p className="text-text-secondary text-sm mt-1">Fill in the details below to list your event</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="card p-6 space-y-5">
            <h2 className="font-bold text-navy">Event Details</h2>
            <div>
              <label className="label">Event Title</label>
              <input value={form.title} onChange={e => setField('title', e.target.value)} className="input-field" required placeholder="e.g. Nairobi Jazz Festival 2025" />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={5} className="input-field resize-none" required placeholder="Describe your event in detail..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Venue Name</label>
                <input value={form.venue} onChange={e => setField('venue', e.target.value)} className="input-field" required placeholder="e.g. Uhuru Park" />
              </div>
              <div>
                <label className="label">City</label>
                <input value={form.city} onChange={e => setField('city', e.target.value)} className="input-field" required placeholder="Nairobi" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Start Date & Time</label>
                <input type="datetime-local" value={form.eventDate} onChange={e => setField('eventDate', e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="label">End Date & Time (optional)</label>
                <input type="datetime-local" value={form.endDate} onChange={e => setField('endDate', e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="label">Cover Image</label>
              <input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files[0])} className="block text-sm text-text-secondary" />
              <p className="text-xs text-text-secondary mt-1">Recommended: 1280x720px, max 5MB</p>
            </div>
          </div>

          {/* Ticket tiers */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-navy">Ticket Tiers</h2>
              <button type="button" onClick={addTier} className="btn-secondary text-sm py-2 px-4">Add Tier</button>
            </div>
            {tiers.map((tier, i) => (
              <TierRow key={i} tier={tier} index={i} onChange={(field, val) => updateTier(i, field, val)} onRemove={() => removeTier(i)} />
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><LoadingSpinner size="sm" color="white" /> Creating...</> : 'Create Event'}
            </button>
            <button type="button" onClick={() => navigate('/organiser/events')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </>
  )
}
