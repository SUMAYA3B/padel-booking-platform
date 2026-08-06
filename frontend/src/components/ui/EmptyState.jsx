export default function EmptyState({ icon = 'bi-inbox', title = 'لا توجد بيانات', subtitle, action }) {
  return (
    <div className="text-center py-5">
      <div className="display-4 text-muted mb-3">
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-bold">{title}</h5>
      {subtitle && <p className="text-muted small">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

