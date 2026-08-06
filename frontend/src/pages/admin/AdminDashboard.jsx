import { useState, useEffect } from 'react'
import { getDashboard } from '../../api/api'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import StatusChip from '../../components/common/StatusChip'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [weekly, setWeekly] = useState([])
  const [byStatus, setByStatus] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await getDashboard()
      const d = res.data ?? {}
      setStats(d.stats ?? {})
      setWeekly(d.weekly_bookings ?? [])
      setByStatus(d.bookings_by_status ?? { pending: 0, confirmed: 0, completed: 0, cancelled: 0 })
      setRecent(d.recent_bookings ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const doughnutData = [
    { label: 'قيد الانتظار', value: byStatus.pending || 0, color: '#ffc107' },
    { label: 'مؤكد', value: byStatus.confirmed || 0, color: '#00a859' },
    { label: 'مكتمل', value: byStatus.completed || 0, color: '#0d6efd' },
    { label: 'ملغي', value: byStatus.cancelled || 0, color: '#dc3545' },
  ]
  const total = doughnutData.reduce((s, d) => s + d.value, 0)
  const weeklyValues = weekly.map((w) => w.count)
  const maxWeekly = weeklyValues.length ? Math.max(...weeklyValues) : 1
  const weekDays = weekly.map((w) => w.label)
  const totalRevenue = Number(stats?.total_revenue ?? 0)

  // حارس التحميل: لا نعرض المحتوى حتى تكتمل البيانات
  if (loading || !stats) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-padel-green mb-3" role="status"></div>
        <div>جارٍ تحميل لوحة التحكم...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-danger d-inline-block py-2 small" role="alert">
          <i className="bi bi-exclamation-triangle me-1"></i> {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        subtitle="نظرة عامة على أداء المنصة اليوم"
        icon="bi-speedometer2"
        action={
          <span className="chip chip-success"><i className="bi bi-check-circle me-1"></i>النظام يعمل</span>
        }
      />

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-triangle me-1"></i> {error}
        </div>
      )}

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard icon="bi-grid-3x3-gap" label="إجمالي الملاعب" value={stats.total_courts} color="green" sub="+1 هذا الشهر" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="bi-calendar-check" label="حجوزات اليوم" value={stats.today_bookings} color="blue" sub="+2 عن أمس" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="bi-cash-stack" label="إجمالي الإيرادات" value={totalRevenue + ' ر.ع'} color="orange" sub="هذا الشهر" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="bi-tags" label="عروض نشطة" value={stats.active_offers ?? 0} color="dark" sub="متاح حالياً" />
        </div>
      </div>

      <div className="row g-4">
        {/* Weekly chart */}
        <div className="col-lg-8">
          <div className="padel-card p-4">
            <h6 className="fw-bold mb-4">حجوزات هذا الأسبوع</h6>
            <div className="d-flex align-items-end justify-content-between" style={{ height: 180 }}>
              {weeklyValues.map((v, i) => (
                <div key={i} className="text-center" style={{ width: '12%' }}>
                  <div className="fw-bold small" style={{ color: '#00a859' }}>{v}</div>
                  <div className="bg-padel-green rounded-top mx-auto"
                    style={{ height: (v / maxWeekly) * 150, maxWidth: 32 }}></div>
                  <div className="small text-muted mt-2">{weekDays[i] || ''}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="padel-card p-4 mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">أحدث الحجوزات</h6>
              <a href="#/admin/bookings" className="small text-padel-green fw-bold">عرض الكل</a>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle padel-table">
                <thead>
                  <tr>
                    <th>رقم الحجز</th>
                    <th>العميل</th>
                    <th>الملعب</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b) => (
                    <tr key={b.id}>
                      <td className="small fw-bold" dir="ltr">{b.booking_number}</td>
                      <td>{b.customer_name}</td>
                      <td>{b.court?.name || b.court_name}</td>
                      <td className="small">{b.booking_date}</td>
                      <td><StatusChip status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Doughnut + Activity side column */}
        <div className="col-lg-4">
          <div className="padel-card p-4">
            <h6 className="fw-bold mb-4">توزيع الحجوزات</h6>
            <div className="text-center mb-3">
              <div className="position-relative d-inline-block">
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 160, height: 160, border: `15px solid #00a859`, borderRightColor: '#ffc107', borderBottomColor: '#0d6efd', borderTopColor: '#dc3545' }}>
                  <div>
                    <div className="h4 mb-0">{total}</div>
                    <div className="small text-muted">حجز</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              {doughnutData.map((d) => (
                <div key={d.label} className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center gap-2 small">
                    <span className="rounded-circle" style={{ width: 10, height: 10, background: d.color }}></span>
                    {d.label}
                  </span>
                  <span className="fw-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="padel-card p-4 mt-4">
            <h6 className="fw-bold mb-3">ملخص الحالة</h6>
            {doughnutData.map((d) => (
              <div key={d.label} className="d-flex justify-content-between align-items-center mb-2">
                <span className="d-flex align-items-center gap-2 small">
                  <span className="rounded-circle" style={{ width: 10, height: 10, background: d.color }}></span>
                  {d.label}
                </span>
                <span className="fw-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
