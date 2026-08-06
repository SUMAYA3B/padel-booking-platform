import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import AdminSidebar from '../components/ui/AdminSidebar'
import AdminTopbar from '../components/ui/AdminTopbar'
import { getToken } from '../api/api'

export default function AdminLayout() {
  const [showSidebar, setShowSidebar] = useState(false)

  // حماية المسار: إذا لا يوجد توكن، اعرض صفحة الحجز
  if (!getToken()) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
      {/* Desktop sidebar */}
      <aside className="d-none d-lg-block" style={{ width: 260, flexShrink: 0 }}>
        <AdminSidebar />
      </aside>

      {/* Mobile sidebar */}
      {showSidebar && (
        <>
          <div className="position-fixed top-0 start-0 h-100 d-lg-none" style={{ zIndex: 1045, width: 260 }}>
            <AdminSidebar onNavigate={() => setShowSidebar(false)} />
          </div>
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-lg-none"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
            onClick={() => setShowSidebar(false)}
          ></div>
        </>
      )}

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <AdminTopbar onToggleSidebar={() => setShowSidebar(true)} />
        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

