import { useState, useEffect } from 'react'
import { getAdminBookings, updateBookingStatus } from '../../api/api'
import PageHeader from '../../components/ui/PageHeader'
import StatusChip from '../../components/common/StatusChip'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import FormField from '../../components/ui/FormField'

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
]

export default function BookingsManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('confirmed')
  const [saving, setSaving] = useState(false)

  // جلب الحجوزات من الـ API
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await getAdminBookings(statusFilter ? { status: statusFilter } : {})
      setData(res.data?.data ?? res.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const viewDetail = (b) => {
    setSelected(b)
    setShowDetail(true)
  }

  const openStatus = (b) => {
    setSelected(b)
    setNewStatus(b.status)
    setShowStatusModal(true)
  }

  const saveStatus = async () => {
    setSaving(true)
    setError('')
    try {
      await updateBookingStatus(selected.id, newStatus)
      setShowStatusModal(false)
      setSelected((prev) => ({ ...prev, status: newStatus }))
      setData((prev) => prev.map((b) => (b.id === selected.id ? { ...b, status: newStatus } : b)))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // تصفية محلية إضافية على search (التصفية حسب الحالة تتم على الخادم)
  const filtered = data.filter((b) => {
    const q = search.toLowerCase()
    return (
      (b.customer_name?.toLowerCase().includes(q) || '') ||
      (b.booking_number?.toLowerCase().includes(q) || '') ||
      (b.customer_phone?.includes(search) || '')
    )
  })

  return (
    <div>
      <PageHeader
        title="إدارة الحجوزات"
        subtitle={`${data.length} حجز`}
        icon="bi-calendar-check"
      />

      {/* Filters */}
      <div className="row g-2 mb-4">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              className="form-control border-start-0"
              placeholder="بحث بالاسم، الرقم، أو الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-triangle me-1"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-padel-green mb-2"></div>
          <div>جارٍ تحميل الحجوزات...</div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="bi-calendar-x" title="لا توجد حجوزات" subtitle="طابق معايير البحث" />
      ) : (
        <div className="padel-card p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle padel-table mb-0">
              <thead>
                <tr>
                  <th>رقم الحجز</th>
                  <th>العميل</th>
                  <th>الملعب</th>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                  <th>المبلغ</th>
                  <th>الدفع</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="small fw-bold" dir="ltr">{b.booking_number}</td>
                    <td>
                      <div className="fw-semibold">{b.customer_name}</div>
                      <small className="text-muted" dir="ltr">{b.customer_phone}</small>
                    </td>
                    <td>{b.court_name}</td>
                    <td className="small">{b.booking_date}</td>
                    <td className="small" dir="ltr">{b.start_time} - {b.end_time}</td>
                    <td className="fw-bold" style={{ color: '#00a859' }}>{b.total_price} ر.ع</td>
                    <td>
                      <div><StatusChip status={b.payment_method} /></div>
                      <div className="mt-1"><StatusChip status={b.payment_status} /></div>
                    </td>
                    <td><StatusChip status={b.status} /></td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => viewDetail(b)}>
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => openStatus(b)}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal show={showDetail} onClose={() => setShowDetail(false)} title="تفاصيل الحجز" size="modal-lg">
        {selected && (
          <div className="row g-3">
            <div className="col-md-6">
              <div className="small text-muted">رقم الحجز</div>
              <div className="fw-bold" dir="ltr">{selected.booking_number}</div>
            </div>
            <div className="col-md-6">
              <div className="small text-muted">الحالة</div>
              <StatusChip status={selected.status} />
            </div>
            <div className="col-md-6">
              <div className="small text-muted">العميل</div>
              <div className="fw-bold">{selected.customer_name}</div>
            </div>
            <div className="col-md-6">
              <div className="small text-muted">الهاتف</div>
              <div dir="ltr">{selected.customer_phone}</div>
            </div>
            <div className="col-md-6">
              <div className="small text-muted">الملعب</div>
              <div>{selected.court_name}</div>
            </div>
            <div className="col-md-6">
              <div className="small text-muted">التاريخ</div>
              <div>{selected.booking_date}</div>
            </div>
            <div className="col-md-6">
              <div className="small text-muted">الوقت</div>
              <div dir="ltr">{selected.start_time} - {selected.end_time}</div>
            </div>
            <div className="col-md-6">
              <div className="small text-muted">المبلغ</div>
              <div className="fw-bold" style={{ color: '#00a859' }}>{selected.total_price} ر.ع</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Change status Modal */}
      <Modal show={showStatusModal} onClose={() => setShowStatusModal(false)} title="تغيير حالة الحجز">
        {selected && (
          <>
            <div className="alert alert-light border">
              <div className="fw-semibold">{selected.customer_name}</div>
              <div className="small text-muted" dir="ltr">{selected.booking_number}</div>
            </div>
            <FormField
              label="الحالة الجديدة"
              as="select"
              options={[
                { value: 'pending', label: 'قيد الانتظار' },
                { value: 'confirmed', label: 'مؤكد' },
                { value: 'completed', label: 'مكتمل' },
                { value: 'cancelled', label: 'ملغي' },
              ]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button className="btn btn-outline-secondary" onClick={() => setShowStatusModal(false)}>إلغاء</button>
              <button className="btn btn-padel" onClick={saveStatus} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                {saving ? 'جارٍ الحفظ...' : 'حفظ التغيير'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
