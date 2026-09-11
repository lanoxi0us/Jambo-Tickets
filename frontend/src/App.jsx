import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Checkout from './pages/Checkout'
import BookingConfirmation from './pages/BookingConfirmation'
import CalendarPage from './pages/Calendar'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import About from './pages/About'
import Contact from './pages/Contact'
import BecomeOrganiser from './pages/BecomeOrganiser'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import MyTickets from './pages/MyTickets'
import ScanTicket from './pages/ScanTicket'

// Organiser
import OrganiserLayout from './components/OrganiserLayout'
import OrganiserDashboard from './pages/organiser/Dashboard'
import CreateEvent from './pages/organiser/CreateEvent'
import MyEvents from './pages/organiser/MyEvents'
import EventAnalytics from './pages/organiser/EventAnalytics'
import Payouts from './pages/organiser/Payouts'

// Admin
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminEvents from './pages/admin/Events'
import AdminUsers from './pages/admin/Users'
import AdminOrganiserApplications from './pages/admin/OrganiserApplications'
import AdminBookings from './pages/admin/Bookings'
import AdminBlog from './pages/admin/Blog'
import AdminPayouts from './pages/admin/Payouts'
import AdminSettings from './pages/admin/Settings'

import LoadingSpinner from './components/LoadingSpinner'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/booking-confirmation/:ref" element={<BookingConfirmation />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/become-organiser" element={<BecomeOrganiser />} />
        <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
      </Route>

      {/* Auth routes (no main layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

{/* Gate scanner */}
<Route path="/scan" element={<RoleRoute roles={['ADMIN','ORGANISER']}><ScanTicket /></RoleRoute>} />

      {/* Organiser portal */}
      <Route path="/organiser" element={<RoleRoute roles={['ORGANISER','ADMIN']}><OrganiserLayout /></RoleRoute>}>
        <Route index element={<OrganiserDashboard />} />
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="events" element={<MyEvents />} />
        <Route path="events/:id/analytics" element={<EventAnalytics />} />
        <Route path="payouts" element={<Payouts />} />
      </Route>

      {/* Admin panel */}
      <Route path="/admin" element={<RoleRoute roles={['ADMIN']}><AdminLayout /></RoleRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="organiser-applications" element={<AdminOrganiserApplications />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="payouts" element={<AdminPayouts />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
