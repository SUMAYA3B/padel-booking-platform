export default function PageHeader({ title, subtitle, icon, action }) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
      <div className="d-flex align-items-center gap-3">
        {icon && (
          <div className="d-inline-flex align-items-center justify-content-center rounded-3"
            style={{ width: 50, height: 50, background: '#eaf7f0', color: '#00a859' }}>
            <i className={`bi ${icon} fs-4`}></i>
          </div>
        )}
        <div>
          <h4 className="mb-0 fw-bold">{title}</h4>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
      </div>
      {action && <div className="mt-2 mt-sm-0">{action}</div>}
    </div>
  )
}
