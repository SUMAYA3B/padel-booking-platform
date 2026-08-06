import { useState, useEffect } from 'react'
import { getClosedDates, createClosedDate, deleteClosedDate, getAdminCourts } from '../../api/api'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import FormField from '../../components/ui/FormField'
import EmptyState from '../../components/ui/EmptyState'

export default function ClosedDates() {
  const [data, setData] = useState([])
  const [courtsList, setCourtsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ court_id: '', start_date: '', end_date: '', reason: '' })

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getClosedDates()
      setData(res.data?.data ?? res.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // جلب الملاعب الحقيقية من الـ API
  useEffect(() => {
    getAdminCourts()
      .then((res) => setCourtsList(res.data?.data ?? res.data ?? []))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  // توسيع نطاق التاريخ إلى قائمة أيام (كل الأيام بين البداية والنهاية)
  const expandDates = () => {
    const { start_date, end_date } = form
    if (!start_date || !end_date) return []
    const result = []
    const start = new Date(start_date)
    const end = new Date(end_date)
    if (end < start) return []
    const cursor = new Date(start)
    while (cursor <= end) {
      result.push(cursor.toISOString().slice(0, 10))
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const dates = expandDates()
      if (dates.length === 0) {
        setError('يرجى إدخال نطاق تاريخ صحيح (البداية ≤ النهاية).')
        setSaving(false)
        return
      }
      for (const date of dates) {
        await createClosedDate({
          court_id: form.court_id ? Number(form.court_id) : null,
          date,
          reason: form.reason || null,
        })
      }
      setShowModal(false)
      setForm({ court_id: '', start_date: '', end_date: '', reason: '' })
      await fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من إزالة هذا الإغلاق؟')) {
      try {
        await deleteClosedDate(id)
        await fetchData()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  // اسم الملعب (إما علاقة أو court_id)
  const courtName = (c) => c.court?.name || (c.court_id ? `ملعب ${c.court_id}` : 'جميع الملاعب')

  return (
    <div>
      <PageHeader
        title="أيام الإغلاق"
        subtitle="أغلق الملاعب في تواريخ محددة للصيانة أو العطلات"
        icon="bi-calendar-x"
        action={
          <button className="btn btn-padel" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> إضافة إغلاق
          </button>
        }
      />

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-triangle me-1"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-padel-green mb-2"></div>
          <div>جارٍ تحميل أيام الإغلاق...</div>
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon="bi-calendar-x" title="لا توجد أيام إغلاق" subtitle="أي ملعب يعمل بكامل ساعاته" />
      ) : (
        <div className="row g-4">
          {data.map((c) => (
            <div className="col-md-6 col-xl-4" key={c.id}>
              <div className="padel-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-3 text-danger d-flex align-items-center justify-content-center"
                      style={{ width: 40, height: 40, background: '#fdecea' }}>
                      <i className="bi bi-calendar-x"></i>
                    </span>
                    <div>
                      <div className="fw-bold">{courtName(c)}</div>
                      <div className="small text-muted">{c.date}</div>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
                <div className="mt-3">
                  {c.reason ? (
                    <span className="chip chip-secondary"><i className="bi bi-info-circle me-1"></i>{c.reason}</span>
                  ) : (
                    <span className="chip chip-secondary">بدون سبب</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title="إضافة أيام إغلاق">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle me-1"></i> {error}
            </div>
          )}

          <FormField
            label="الملعب"
            as="select"
            options={[
              { value: '', label: 'جميع الملاعب' },
              ...courtsList.map((c) => ({ value: String(c.id), label: c.name })),
            ]}
            value={form.court_id}
            onChange={(e) => setField('court_id', e.target.value)}
          />

          <div className="row g-2">
            <div className="col-6">
              <FormField label="تاريخ البداية" type="date" icon="bi-calendar" required value={form.start_date}
                onChange={(e) => setField('start_date', e.target.value)} />
            </div>
            <div className="col-6">
              <FormField label="تاريخ النهاية" type="date" icon="bi-calendar" required value={form.end_date}
                onChange={(e) => setField('end_date', e.target.value)} />
            </div>
          </div>

          <FormField label="السبب (اختياري)" as="textarea" rows={2} value={form.reason}
            onChange={(e) => setField('reason', e.target.value)} placeholder="مثال: صيانة دورية" />

          <div className="d-flex gap-2 justify-content-end mt-3">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
            <button type="submit" className="btn btn-padel" disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
              {saving ? 'جارٍ الإضافة...' : 'حفظ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
