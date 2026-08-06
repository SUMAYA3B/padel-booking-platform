import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import LandingPage from './pages/public/LandingPage'
import BookingPage from './pages/public/BookingPage'
import BookingConfirmation from './pages/public/BookingConfirmation'
import PaymentSuccess from './pages/public/PaymentSuccess'
import PaymentCancel from './pages/public/PaymentCancel'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import CourtsManagement from './pages/admin/CourtsManagement'
import BookingsManagement from './pages/admin/BookingsManagement'
import WorkingHours from './pages/admin/WorkingHours'
import ClosedDates from './pages/admin/ClosedDates'
import OffersManagement from './pages/admin/OffersManagement'

export default function App() {
  return (
    <Routes>
      {/* Public layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/confirmation/:bookingNumber" element={<BookingConfirmation />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Route>

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="courts" element={<CourtsManagement />} />
        <Route path="bookings" element={<BookingsManagement />} />
        <Route path="working-hours" element={<WorkingHours />} />
        <Route path="closed-dates" element={<ClosedDates />} />
        <Route path="offers" element={<OffersManagement />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<LandingPage />} />
      </Route>
    </Routes>
  )
}
