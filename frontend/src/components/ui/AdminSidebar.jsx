import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/admin', end: true, icon: 'bi-speedometer2', label: 'لوحة التحكم' },
  { to: '/admin/courts', icon: 'bi-grid-3x3-gap', label: 'إدارة الملاعب' },
  { to: '/admin/bookings', icon: 'bi-calendar-check', label: 'إدارة الحجوزات' },
  { to: '/admin/working-hours', icon: 'bi-clock-history', label: 'ساعات العمل' },
  { to: '/admin/closed-dates', icon: 'bi-calendar-x', label: 'أيام الإغلاق' },
  { to: '/admin/offers', icon: 'bi-tags', label: 'إدارة العروض' },
]

export default function AdminSidebar({ onNavigate }) {
  return (
    <div className="sidebar d-flex flex-column p-3">
      <div className="mb-4 px-2">
        <div className="text-white fw-bold fs-5">
          <i className="bi bi-app-indicator text-padel-green me-2"></i>
          بادل برو
        </div>
        <small className="text-white-50 text-uppercase">Padel Pro Admin</small>
      </div>

      <nav className="d-flex flex-column gap-1 flex-grow-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-top border-secondary pt-3">
        <div className="d-flex align-items-center gap-2 px-2 text-white">
          <div className="rounded-circle bg-padel-green text-white d-flex align-items-center justify-content-center"
            style={{ width: 38, height: 38, fontSize: '0.9rem', fontWeight: 700 }}>
            م
          </div>
          <div>
            <div className="small fw-bold">مدير النظام</div>
            <div className="text-white-50" style={{ fontSize: '0.7rem' }}>admin@padelpro.om</div>
          </div>
        </div>
        <NavLink to="/admin/login" className="sidebar-link mt-2">
          <i className="bi bi-box-arrow-right"></i>
          <span>تسجيل الخروج</span>
        </NavLink>
      </div>
    </div>
  )
}
