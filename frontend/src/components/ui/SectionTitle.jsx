export default function SectionTitle({ title, subtitle, center = false }) {
  return (
    <div className={`mb-4 ${center ? 'text-center' : ''}`}>
      <div className="d-inline-flex align-items-center gap-2 mb-2">
        <span className="bg-padel-green rounded-circle" style={{ width: 8, height: 8 }}></span>
        <span className="text-padel-green fw-bold small text-uppercase">بادل برو</span>
      </div>
      <h2 className="fw-bold mb-2">{title}</h2>
      {subtitle && <p className="text-muted" style={{ maxWidth: 640 }}>{subtitle}</p>}
    </div>
  )
}
