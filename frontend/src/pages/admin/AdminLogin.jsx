import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FormField from '../../components/ui/FormField'
import { adminLogin, setToken } from '../../api/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await adminLogin(form.email, form.password)
      // حفظ التوكن (مع خيار تذكرني — نستخدم نفس التخزين ببساطة)
      setToken(res.token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg d-flex align-items-center justify-content-center py-5">
      <div className="auth-card p-4 p-md-5">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 text-white"
            style={{ width: 70, height: 70, background: 'linear-gradient(135deg,#00a859,#006838)' }}>
            <i className="bi bi-app-indicator fs-2"></i>
          </div>
          <h3 className="fw-bold mt-3 mb-0">بادل برو</h3>
          <p className="text-muted small mb-0">تسجيل دخول لوحة التحكم</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            <i className="bi bi-exclamation-circle me-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormField
            label="البريد الإلكتروني"
            type="email"
            icon="bi-envelope"
            placeholder="admin@padelpro.om"
            value={form.email}
            required
            onChange={(e) => setField('email', e.target.value)}
          />
          <div className="mb-3">
            <label className="form-label fw-semibold small">كلمة المرور</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-lock text-padel-green"></i></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                required
              />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword((s) => !s)}>
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="remember">تذكرني</label>
          </div>

          <button type="submit" className="btn btn-padel w-100 py-2" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-box-arrow-in-right me-1"></i>
            )}
            {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">نسيت كلمة المرور؟ <a href="#!" onClick={(e) => e.preventDefault()} className="text-padel-green">استعادة</a></small>
        </div>

        <hr className="my-4" />
        <Link to="/" className="btn btn-outline-secondary w-100">
          <i className="bi bi-arrow-right me-1"></i> العودة للموقع
        </Link>
      </div>
    </div>
  )
}
