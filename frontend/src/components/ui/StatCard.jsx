export default function StatCard({ icon, label, value, color = 'green', sub }) {
  const bgColor =
    color === 'green'
      ? 'background:#eaf7f0;color:#00a859'
      : color === 'dark'
      ? 'background:#e8eaeb;color:#111517'
      : color === 'blue'
      ? 'background:#e7f0ff;color:#0d6efd'
      : color === 'orange'
      ? 'background:#fff3e0;color:#f58529'
      : 'background:#eef1f0;color:#6c757d'

  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor.split(';')[0], color: bgColor.split(';')[1].replace('color:', '') }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="h3 mb-0">{value}</div>
      <div className="text-muted small fw-medium">{label}</div>
      {sub && <small className="text-success fw-bold">{sub}</small>}
    </div>
  )
}

