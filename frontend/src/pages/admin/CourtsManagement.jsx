import { useState, useEffect } from 'react'
import { getAdminCourts, createCourt, updateCourt, deleteCourt } from '../../api/api'
import PageHeader from '../../components/ui/PageHeader'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import StatusChip from '../../components/common/StatusChip'
import EmptyState from '../../components/ui/EmptyState'

export default function CourtsManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price_per_hour: 10,
    is_active: true,
  })

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  // جلب الملاعب من الـ API
  const fetchCourts = async () => {
    try {
      setLoading(true)
      const res = await getAdminCourts()
      setData(res.data?.data ?? res.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourts()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', price_per_hour: 10, is_active: true })
    setShowModal(true)
  }

  const openEdit = (court) => {
    setEditing(court)
    setForm({
      name: court.name,
      description: court.description || '',
      price_per_hour: court.price_per_hour,
      is_active: court.is_active,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updateCourt(editing.id, form)
      } else {
        await createCourt(form)
      }
      setShowModal(false)
      await fetchCourts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الملعب؟')) {
      try {
        await deleteCourt(id)
        await fetchCourts()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const toggleActive = (id) => {
    const court = data.find((c) => c.id === id)
    if (court) {
      updateCourt(id, { ...court, is_active: !court.is_active })
        .then(() => fetchCourts())
        .catch((err) => setError(err.message))
    }
  }

  const filtered = data.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <PageHeader
        title="إدارة الملاعب"
        subtitle={`${data.length} ملعب مسجل`}
        icon="bi-grid-3x3-gap"
        action={
          <button className="btn btn-padel" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i> إضافة ملعب
          </button>
        }
      />

      {/* Search */}
      <div className="mb-4" style={{ maxWidth: 380 }}>
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            className="form-control border-start-0"
            placeholder="بحث عن ملعب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-triangle me-1"></i> {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-padel-green mb-2"></div>
          <div>جارٍ تحميل الملاعب...</div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="bi-grid" title="لا توجد ملاعب" subtitle="اضغط إضافة ملعب للبدء" />
      ) : (
        <div className="row g-4">
          {filtered.map((court) => (
            <div className="col-md-6 col-xl-4" key={court.id}>
              <div className="padel-card overflow-hidden h-100">
                <div className="d-flex align-items-center justify-content-center"
                  style={{ height: 140, background: '#eaf7f0' }}>
                  <i className={court.is_active ? 'bi bi-grid-3x3-gap text-padel-green' : 'bi bi-grid-3x3-gap text-muted'}
                    style={{ fontSize: '3rem' }}></i>
                </div>
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="mb-0 fw-bold">{court.name}</h6>
                    <StatusChip status={court.is_active ? 'active' : 'inactive'} />
                  </div>
                  <p className="text-muted small mb-2">{court.description || 'لا يوجد وصف'}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-padel-green fw-bold fs-5">{court.price_per_hour} ر.ع<span className="small">/ساعة</span></span>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleActive(court.id)}
                        title={court.is_active ? 'تعطيل' : 'تفعيل'}>
                        <i className={`bi ${court.is_active ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                      </button>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(court)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(court.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'تعديل ملعب' : 'إضافة ملعب جديد'}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle me-1"></i> {error}
            </div>
          )}
          <FormField label="اسم الملعب" icon="bi-tag" required value={form.name}
            onChange={(e) => setField('name', e.target.value)} placeholder="مثال: ملعب 1" />
          <FormField label="الوصف" as="textarea" rows={2} value={form.description}
            onChange={(e) => setField('description', e.target.value)} placeholder="وصف مختصر للملعب" />
          <FormField label="السعر للساعة (ر.ع)" type="number" icon="bi-cash" required value={form.price_per_hour}
            onChange={(e) => setField('price_per_hour', e.target.value)} placeholder="10" min="0" step="0.5" />

          <div className="form-check form-switch mb-4">
            <input className="form-check-input" type="checkbox" id="activeCourt" checked={form.is_active}
              onChange={(e) => setField('is_active', e.target.checked)} />
            <label className="form-check-label" htmlFor="activeCourt">ملعب نشط</label>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
            <button type="submit" className="btn btn-padel" disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
              {saving ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
