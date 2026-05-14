import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Events', to: '/events' },
  { label: 'Calendar', to: '/calendar' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const activeClass = 'text-crimson font-semibold'
  const inactiveClass = 'text-text-secondary hover:text-navy transition-colors duration-150 font-medium'

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${scrolled ? 'bg-white shadow-card border-b border-border' : 'bg-white border-b border-border'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
             <span
  className="font-extrabold tracking-tight"
  style={{ color: '#0D1B3E', fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)', marginLeft: '2rem' }}
>
  Jambo Tickets
</span> 
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-7 mx-auto">
              {navLinks.map(l => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {(user.role === 'ORGANISER' || user.role === 'ADMIN') && (
                    <Link to={user.role === 'ADMIN' ? '/admin' : '/organiser'} className="text-sm font-medium text-text-secondary hover:text-navy transition-colors">
                      {user.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                  )}
                  <Link to="/my-tickets" className="text-sm font-medium text-text-secondary hover:text-navy transition-colors">
                    My Tickets
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-navy transition-colors">Log In</Link>
                  <Link to="/register" className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Open menu">
              <svg className="w-6 h-6 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <span className="font-extrabold text-lg tracking-tight" style={{ color: '#0F172A' }}>Jambo Tickets</span>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 p-5 space-y-1">
                {navLinks.map(l => (
                  <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 rounded-lg font-medium text-sm ${isActive ? 'bg-crimson/10 text-crimson' : 'text-text-primary hover:bg-gray-50'}`
                    }>
                    {l.label}
                  </NavLink>
                ))}
                {user && (
                  <NavLink to="/my-tickets" onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-lg font-medium text-sm text-text-primary hover:bg-gray-50">
                    My Tickets
                  </NavLink>
                )}
                {user && (user.role === 'ORGANISER' || user.role === 'ADMIN') && (
                  <NavLink to={user.role === 'ADMIN' ? '/admin' : '/organiser'} onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-lg font-medium text-sm text-text-primary hover:bg-gray-50">
                    {user.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                  </NavLink>
                )}
              </nav>
              <div className="p-5 border-t border-border space-y-3">
                {user ? (
                  <button onClick={handleLogout} className="w-full btn-secondary text-sm">Sign Out</button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="w-full btn-secondary text-sm">Log In</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="w-full btn-primary text-sm">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
