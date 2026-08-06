import { useState, useEffect } from 'react'
import { getOffers, createOffer, updateOffer, deleteOffer } from '../../api/api'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import FormField from '../../components/ui/FormField'
import StatusChip from '../../components/common/StatusChip'
import EmptyState from '../../components/ui/EmptyState'

export default function OffersManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    min_hours: 1,
    max_hours: '',
    price_per_hour: '',
    discount_percent: '',
    is_active: true,
    court_ids: [],
  })

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  // جلب العروض
  const fetchOffers = async () => {
    try {
      setLoading(true)
      const res = await getOffers()
      setData(res.data?.data ?? res.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const courtIdsOf = (off) => (off.courts && Array.isArray(off.courts) ? off.courts.map((c) => c.id) : [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: '', description: '', min_hours: 1, max_hours: '',
      price_per_hour: '', discount_percent: '', is_active: true, court_ids: [],
    })
    setShowModal(true)
  }

  const openEdit = (off) => {
    setEditing(off)
    setForm({
      name: off.name,
      description: off.description,
      min_hours: off.min_hours,
      max_hours: off.max_hours || '',
      price_per_hour: off.price_per_hour || '',
      discount_percent: off.discount_percent || '',
      is_active: off.is_active,
      court_ids: courtIdsOf(off),
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      max_hours: form.max_hours || null,
      price_per_hour: form.price_per_hour || null,
      discount_percent: form.discount_percent || null,
    }
    try {
      if (editing) {
        await updateOffer(editing.id, payload)
      } else {
        await createOffer(payload)
      }
      setShowModal(false)
      await fetchOffers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      try {
        await deleteOffer(id)
        await fetchOffers()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const toggleActive = async (off) => {
    try {
      await updateOffer(off.id, { ...off, court_ids: courtIdsOf(off), is_active: !off.is_active })
      await fetchOffers()
    } catch (err) {
      setError(err.message)
    }
  }

  // نص الملاعب المعنية
  const courtsLabel = (off) => {
    if (off.courts && off.courts.length) return off.courts.map((c) => c.name).join('، ')
    return 'جميع الملاعب'
  }

  // Determine price display text
  const priceLabel = (off) => {
    if (off.price_per_hour) return `${off.price_per_hour} ر.ع / ساعة`
    if (off.discount_percent) return `خصم ${off.discount_percent}%`
    return '—'
  }

  const rangeLabel = (off) => {
    if (off.max_hours) return `${off.min_hours} - ${off.max_hours} ساعات`
    return `${off.min_hours}+ ساعات`
  }

  return (
    <div>
      <PageHeader
        title="إدارة العروض"
        subtitle={`${data.length} عروض متاحة`}
        icon="bi-tags"
        action={
          <button className="btn btn-padel" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i> إضافة عرض
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
          <div>جارٍ تحميل العروض...</div>
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon="bi-tags" title="لا توجد عروض" subtitle="اضف عرضاً لتشجيع الحجوزات الطويلة" />
      ) : (
        <div className="row g-4">
          {data.map((off) => (
            <div className="col-md-6 col-xl-4" key={off.id}>
              <div className={`padel-card p-4 h-100 ${!off.is_active ? 'opacity-75 border border-secondary' : ''}`}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-3 text-padel-green d-flex align-items-center justify-content-center"
                      style={{ width: 44, height: 44, background: '#eaf7f0', fontSize: '1.3rem' }}>
                      <i className="bi bi-percent"></i>
                    </span>
                    <div>
                      <h6 className="mb-0 fw-bold">{off.name}</h6>
                      <div className="small text-muted">{rangeLabel(off)}</div>
                    </div>
                  </div>
                  <StatusChip status={off.is_active ? 'active' : 'inactive'} />
                </div>

                <p className="text-muted small mt-2 mb-2">{off.description || 'لا يوجد وصف'}</p>

                <div className="d-flex justify-content-between align-items-center bg-light rounded-3 p-2 mb-3">
                  <span className="small text-muted">السعر</span>
                  <span className="fw-bold text-padel-green">{priceLabel(off)}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="chip chip-info"><i className="bi bi-grid-3x3-gap me-1"></i>{courtsLabel(off)}</span>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleActive(off)}>
                      <i className={`bi ${off.is_active ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                    </button>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(off)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(off.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editing ? 'تعديل عرض' : 'إضافة عرض جديد'} size="modal-lg">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle me-1"></i> {error}
            </div>
          )}
          <div className="row g-3">
            <div className="col-md-6">
              <FormField label="اسم العرض" icon="bi-tag" required value={form.name}
                onChange={(e) => setField('name', e.target.value)} placeholder="مثال: عرض ساعتين" />
            </div>
            <div className="col-md-6">
              <FormField label="الوصف" value={form.description}
                onChange={(e) => setField('description', e.target.value)} placeholder="وصف مختصر" />
            </div>
            <div className="col-md-3">
              <FormField label="الحد الأدنى (ساعات)" type="number" required value={form.min_hours}
                onChange={(e) => setField('min_hours', e.target.value)} min="1" />
            </div>
            <div className="col-md-3">
              <FormField label="الحد الأقصى (اختياري)" type="number" value={form.max_hours}
                onChange={(e) => setField('max_hours', e.target.value)} min="1" placeholder="أو اتركه فارغاً" />
            </div>
            <div className="col-md-3">
              <FormField label="السعر / ساعة" type="number" icon="bi-cash" value={form.price_per_hour}
                onChange={(e) => setField('price_per_hour', e.target.value)} min="0" placeholder="اختياري" />
            </div>
            <div className="col-md-3">
              <FormField label="نسبة الخصم %" type="number" icon="bi-percent" value={form.discount_percent}
                onChange={(e) => setField('discount_percent', e.target.value)} min="0" max="100" placeholder="أو نسبة" />
            </div>
            <div className="col-md-12">
              <div className="alert alert-light border small mb-0">
                <i className="bi bi-info-circle me-1 text-padel-green"></i>
                يسري هذا العرض على <strong>جميع الملاعب</strong>.
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="activeOffer" checked={form.is_active}
                  onChange={(e) => setField('is_active', e.target.checked)} />
                <label className="form-check-label" htmlFor="activeOffer">عرض نشط</label>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end mt-4">
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
