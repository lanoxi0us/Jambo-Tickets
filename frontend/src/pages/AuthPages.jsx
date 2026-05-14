import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`)
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'ORGANISER') navigate('/organiser')
      else navigate('/my-tickets')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Log In — Jambo Tickets</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 justify-center mb-8">
            <img src="/src/assets/logo.png" alt="Jambo Tickets" className="h-9 w-9 rounded-xl object-contain" />
            <span className="font-extrabold text-navy text-xl">Jambo Tickets</span>
          </Link>
          <div className="card p-8">
            <h1 className="text-2xl font-extrabold text-navy text-center mb-1">Welcome back</h1>
            <p className="text-text-secondary text-sm text-center mb-7">Sign in to your account</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field" placeholder="you@email.com" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs text-crimson hover:underline">Forgot password?</Link>
                </div>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field" placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 mt-2">
                {loading ? <><LoadingSpinner size="sm" color="white" /> Signing in...</> : 'Sign In'}
              </button>
            </form>
            <p className="text-center text-sm text-text-secondary mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-crimson font-semibold hover:underline">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password })
      toast.success('Account created! Welcome to Jambo Tickets.')
      navigate('/my-tickets')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Create Account — Jambo Tickets</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center">
              <span className="text-crimson font-extrabold text-xl leading-none">J</span>
            </div>
            <span className="font-extrabold text-navy text-xl">Jambo Tickets</span>
          </Link>
          <div className="card p-8">
            <h1 className="text-2xl font-extrabold text-navy text-center mb-1">Create your account</h1>
            <p className="text-text-secondary text-sm text-center mb-7">Join thousands of event-goers in Kenya</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'John Kamau' },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@email.com' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+254712345678' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: '••••••••' },
              ].map(field => (
                <div key={field.key}>
                  <label className="label">{field.label}</label>
                  <input type={field.type} value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="input-field" placeholder={field.placeholder} required />
                </div>
              ))}
              <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 mt-2">
                {loading ? <><LoadingSpinner size="sm" color="white" /> Creating account...</> : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm text-text-secondary mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-crimson font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const api = (await import('../utils/api')).default
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setSent(true) // Always show success to prevent email enumeration
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Forgot Password — Jambo Tickets</title></Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center">
              <span className="text-crimson font-extrabold text-xl leading-none">J</span>
            </div>
            <span className="font-extrabold text-navy text-xl">Jambo Tickets</span>
          </Link>
          <div className="card p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                </div>
                <h2 className="font-bold text-navy text-xl mb-2">Check your email</h2>
                <p className="text-text-secondary text-sm mb-5">If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.</p>
                <Link to="/login" className="btn-primary w-full">Back to Login</Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-navy text-center mb-1">Reset your password</h1>
                <p className="text-text-secondary text-sm text-center mb-7">Enter your email and we'll send a reset link</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="input-field" placeholder="you@email.com" required />
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-primary py-3.5">
                    {loading ? <><LoadingSpinner size="sm" color="white" /> Sending...</> : 'Send Reset Link'}
                  </button>
                </form>
                <p className="text-center text-sm text-text-secondary mt-5">
                  <Link to="/login" className="text-crimson hover:underline">Back to login</Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

export function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()
  const { token } = require('react-router-dom').useParams?.() || {}
  
  // Use inline import to avoid circular issues
  const getToken = () => window.location.pathname.split('/').pop()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return }
    setLoading(true)
    try {
      const api = (await import('../utils/api')).default
      await api.post(`/auth/reset-password/${getToken()}`, { password: form.password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Reset Password — Jambo Tickets</title></Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center">
              <span className="text-crimson font-extrabold text-xl leading-none">J</span>
            </div>
            <span className="font-extrabold text-navy text-xl">Jambo Tickets</span>
          </Link>
          <div className="card p-8">
            {done ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="font-bold text-navy text-xl mb-2">Password Reset!</h2>
                <p className="text-text-secondary text-sm">Redirecting you to login...</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-navy text-center mb-1">Set new password</h1>
                <p className="text-text-secondary text-sm text-center mb-7">Choose a strong password for your account</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">New Password</label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="input-field" placeholder="••••••••" required minLength={6} />
                  </div>
                  <div>
                    <label className="label">Confirm New Password</label>
                    <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      className="input-field" placeholder="••••••••" required />
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-primary py-3.5">
                    {loading ? <><LoadingSpinner size="sm" color="white" /> Resetting...</> : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
