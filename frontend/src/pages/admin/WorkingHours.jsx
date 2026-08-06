import { useState, useEffect } from 'react'
import { getWorkingHours, createWorkingHour, getAdminCourts } from '../../api/api'
import PageHeader from '../../components/ui/PageHeader'


const daysOfWeek = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الإثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
]

export default function WorkingHours() {
  const [courtsList, setCourtsList] = useState([])
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [rows, setRows] = useState(() =>
    daysOfWeek.map((d) => ({
      day_of_week: d.value,
      day_name: d.label,
      open_time: '06:00',
      close_time: '23:00',
      is_active: true,
    }))
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // جلب الملاعب الفعلية من الـ API
  useEffect(() => {
    getAdminCourts()
      .then((res) => {
        const list = res.data?.data ?? res.data ?? []
        setCourtsList(list)
        if (list.length) setSelectedCourt(list[0].id)
      })
      .catch((err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // جلب ساعات العمل للملعب المحدد
  const fetchHours = async (courtId) => {
    if (!courtId) return
    try {
      setLoading(true)
      setError('')
      const res = await getWorkingHours()
      const list = res.data?.data ?? res.data ?? []
      const courtHours = list.filter((w) => Number(w.court_id) === Number(courtId))
      // قص الثواني من أوقات الـ DB (مثل 06:00:00 → 06:00) لملاءمة input type="time"
      // وتفادي رفض التحقق من صحة البيانات عند الإرسال.
      const trimTime = (t) => (t ? String(t).slice(0, 5) : t)
      setRows(() =>
        daysOfWeek.map((d) => {
          const existing = courtHours.find((w) => w.day_of_week === d.value)
          return {
            day_of_week: d.value,
            day_name: d.label,
            open_time: trimTime(existing?.open_time) || '06:00',
            close_time: trimTime(existing?.close_time) || '23:00',
            is_active: existing?.is_active ?? true,
          }
        })
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHours(selectedCourt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourt])

  const updateRow = (index, key, value) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)))
  }

  const saveAll = async () => {
    if (selectedCourt == null) {
      setError('لا يوجد ملعب محدد لحفظ ساعات العمل.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      for (const r of rows) {
        await createWorkingHour({
          court_id: Number(selectedCourt),
          day_of_week: r.day_of_week,
          open_time: r.open_time,
          close_time: r.close_time,
          is_active: r.is_active,
        })
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="ساعات العمل"
        subtitle="حدد أوقات عمل كل ملعب حسب أيام الأسبوع"
        icon="bi-clock-history"
      />

      {/* Court selector */}
      <div className="mb-4" style={{ maxWidth: 380 }}>
        <label className="form-label fw-semibold small">اختر الملعب</label>
        <select
          className="form-select"
          value={selectedCourt ?? ''}
          onChange={(e) => setSelectedCourt(Number(e.target.value))}
        >
          {courtsList.length === 0 && <option value="">لا توجد ملاعب</option>}
          {courtsList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-triangle me-1"></i> {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success py-2 small" role="alert">
          <i className="bi bi-check-circle me-1"></i> تم حفظ ساعات العمل بنجاح
        </div>
      )}

      <div className="padel-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">أوقات {courtsList.find((c) => c.id === selectedCourt)?.name || 'الملعب المحدد'}</h6>
          <button className="btn btn-padel btn-sm" onClick={saveAll} disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-check2-circle me-1"></i>}
            {saving ? 'جارٍ الحفظ...' : 'حفظ الكل'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4 text-muted">
            <div className="spinner-border text-padel-green mb-2"></div>
            <div className="small">جارٍ تحميل ساعات العمل...</div>
          </div>
        ) : (
          <div className="table-responsive">
          <table className="table table-hover align-middle padel-table">
            <thead>
              <tr>
                <th>اليوم</th>
                <th>وقت الفتح</th>
                <th>وقت الإغلاق</th>
                <th>مفعل</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => (
                <tr key={r.day_of_week}>
                  <td className="fw-semibold">{r.day_name}</td>
                  <td style={{ maxWidth: 140 }}>
                    <input
                      type="time"
                      className="form-control"
                      value={r.open_time}
                      onChange={(e) => updateRow(index, 'open_time', e.target.value)}
                    />
                  </td>
                  <td style={{ maxWidth: 140 }}>
                    <input
                      type="time"
                      className="form-control"
                      value={r.close_time}
                      onChange={(e) => updateRow(index, 'close_time', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={r.is_active}
                        onChange={(e) => updateRow(index, 'is_active', e.target.checked)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Note */}
      <div className="alert alert-success d-flex align-items-center gap-2 mt-4">
        <i className="bi bi-lightbulb"></i>
        <small>ساعات العمل تنطبق على جميع الحجوزات. يمكنك تعطيل يوم كامل بتعطيل المفتاح.</small>
      </div>
    </div>
  )
}
