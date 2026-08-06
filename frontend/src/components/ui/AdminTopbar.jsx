import { Link } from 'react-router-dom'

export default function AdminTopbar({ onToggleSidebar }) {
  return (
    <div className="d-flex align-items-center justify-content-between py-3 px-4 bg-white border-bottom">
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-outline-dark btn-sm d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <Link to="/" className="btn btn-outline-padel btn-sm">
          <i className="bi bi-eye me-1"></i>
          عرض الموقع
        </Link>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="position-relative">
          <i className="bi bi-bell fs-5 text-muted"></i>
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
            3
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle bg-padel-green text-white d-flex align-items-center justify-content-center"
            style={{ width: 34, height: 34, fontWeight: 700 }}>
            م
          </div>
          <div className="d-none d-sm-block">
            <div className="small fw-bold">مدير النظام</div>
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  )
}
