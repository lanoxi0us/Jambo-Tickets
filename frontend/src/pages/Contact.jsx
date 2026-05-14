import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const INFO = [
  { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>, label: 'Address', value: 'Nairobi, Kenya' },
  { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>, label: 'Phone', value: '+254 110 999 653' },
  { icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>, label: 'Email', value: 'infojambotickets@gmail.com' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await api.post('/contact', form)
      setSent(true)
      toast.success('Message sent! We will get back to you shortly.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Contact Us — Jambo Tickets</title></Helmet>

      {/* Header */}
      <div className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-extrabold text-white mb-3">Contact Us</motion.h1>
          <p className="text-gray-400 max-w-lg mx-auto">Have a question or need help? Our team is ready to assist you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy">Get in Touch</h2>
            <p className="text-text-secondary text-sm leading-relaxed">We respond to all inquiries within 1–2 business days. For urgent matters, please call us directly.</p>
            {INFO.map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center text-crimson flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-navy">{value}</p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-text-secondary mb-2 font-medium uppercase tracking-wide">Business Hours</p>
              <p className="text-sm text-text-secondary">Monday – Friday: 8:00 AM – 6:00 PM EAT</p>
              <p className="text-sm text-text-secondary">Saturday: 9:00 AM – 2:00 PM EAT</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Message Sent</h3>
                <p className="text-text-secondary mb-6">Thank you for reaching out. We will get back to you within 1–2 business days.</p>
                <button onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }) }} className="btn-secondary text-sm">Send Another Message</button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
                <h2 className="text-xl font-bold text-navy mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label">Full Name</label>
                      <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Jane Kamau" />
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="jane@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <input name="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={6} className="input-field resize-none" placeholder="Tell us more about your inquiry..." />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
                    {loading ? <><LoadingSpinner size="sm" color="white" /> Sending...</> : 'Send Message'}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
