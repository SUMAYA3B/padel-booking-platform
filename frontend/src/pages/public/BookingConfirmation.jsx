import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBooking } from '../../api/api'

// تحويل وقت بصيغة 24 ساعة إلى صيغة 12 ساعة مع صباحاً/مساءً للعرض فقط
const to12Hour = (hhmm) => {
  const [hh, mm] = hhmm.split(':').map(Number)
  const period = hh >= 12 ? 'م' : 'ص'
  const hour = hh % 12 === 0 ? 12 : hh % 12
  return `${hour}:${String(mm).padStart(2, '0')} ${period}`
}

// تسمية التاريخ بالعربية
const formatDateLabel = (iso) => {
  if (!iso) return ''
  const [yy, mm, dd] = iso.split('-').map(Number)
  const date = new Date(yy, mm - 1, dd)
  return date.toLocaleDateString('ar-OM', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function BookingConfirmation() {
  const { bookingNumber } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getBooking(bookingNumber)
        setBooking(res.data ?? res)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (bookingNumber) fetchBooking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingNumber])

  if (loading) {
    return (
      <section className="py-5 text-center text-muted" style={{ backgroundColor: '#f5f7f6', minHeight: '80vh' }}>
        <div className="spinner-border text-padel-green"></div>
        <div className="mt-2">جارٍ تحميل تفاصيل الحجز...</div>
      </section>
    )
  }

  if (error || !booking) {
    return (
      <section className="py-5" style={{ backgroundColor: '#f5f7f6', minHeight: '80vh' }}>
        <div className="container text-center">
          <div className="display-4 text-muted mb-3"><i className="bi bi-exclamation-triangle"></i></div>
          <h4 className="fw-bold">تعذر العثور على الحجز</h4>
          <p className="text-muted">{error || 'رقم الحجز غير موجود'}</p>
          <Link to="/" className="btn btn-padel me-2"><i className="bi bi-house me-1"></i> الرئيسية</Link>
          <Link to="/book" className="btn btn-outline-padel"><i className="bi bi-calendar-plus me-1"></i> حجز جديد</Link>
        </div>
      </section>
    )
  }

  const courtName = booking.court?.name || booking.court_name || 'ملعب'
  const paymentLabel = booking.payment_method === 'cash' ? 'نقداً عند الوصول' : 'ثواني'
  // السلات الموزعة على أيام وأوقات مختلفة (في الحجز متعدد الساعات)
  const slots = Array.isArray(booking.slots) ? booking.slots : []
  const hasSlots = slots.length > 0
  // أوقات كان العميل قد اختارها لكنها كانت محجوزة مسبقاً (حجزت المتاح فقط)
  const unavailable = Array.isArray(booking.unavailable_hours) ? booking.unavailable_hours : []

  return (
    <section className="py-5" style={{ backgroundColor: '#f5f7f6', minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white"
                style={{ width: 90, height: 90, fontSize: '3rem' }}>
                <i className="bi bi-check2-circle"></i>
              </div>
              <h2 className="fw-bold mt-3 mb-1">تم تأكيد حجزك!</h2>
              <p className="text-muted mb-0">شكراً لك {booking.customer_name}، حجزك جاهز</p>
            </div>

            <div className="padel-card p-4">
              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <span className="text-muted">رقم الحجز</span>
                <span className="fw-bold text-padel-green" dir="ltr">{booking.booking_number}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <span className="text-muted">ملعب</span>
                <span className="fw-semibold">{courtName}</span>
              </div>
              {hasSlots ? (
                <div className="border-bottom pb-3 mb-3">
                  <span className="text-muted d-block mb-2">مواعيد الحجز:</span>
                  <ul className="list-unstyled small mb-0">
                    {slots.map((s) => (
                      <li key={`${s.booking_date}|${s.start_time}`} className="d-flex justify-content-between py-1">
                        <span>{formatDateLabel(s.booking_date)}</span>
                        <span className="fw-semibold" dir="ltr">{to12Hour(s.start_time)} - {to12Hour(s.end_time)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                    <span className="text-muted">التاريخ</span>
                    <span className="fw-semibold">{booking.booking_date}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                    <span className="text-muted">الوقت</span>
                    <span className="fw-semibold" dir="ltr">{to12Hour(booking.start_time)} - {to12Hour(booking.end_time)}</span>
                  </div>
                </>
              )}
              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <span className="text-muted">طريقة الدفع</span>
                <span className="fw-semibold">{booking.payment_method === 'cash' ? 'نقداً عند الوصول' : 'ثواني'}</span>
              </div>
              <div className="d-flex justify-content-between fs-5 fw-bold">
                <span>الإجمالي (بعد الخصم)</span>
                <span className="text-padel-green">{booking.final_price ?? booking.total_price} ر.ع</span>
              </div>

              <div className="alert alert-success d-flex align-items-center gap-2 mt-4 mb-0">
                <i className="bi bi-info-circle"></i>
                <small>سيتم إرسال تفاصيل الحجز إلى هاتفك. احفظ رقم الحجز للرجوع إليه لاحقاً.</small>
              </div>
            </div>

            {unavailable.length > 0 && (
              <div className="alert alert-warning d-flex align-items-center gap-2 mt-3 mb-0">
                <i className="bi bi-exclamation-triangle"></i>
                <small>
                  لاحظ أن بعض الأوقات التي اخترتها كانت محجوزة مسبقاً فلم تتمكن من حجزها،
                  وقد حجزنا لك الأوقات المتاحة فقط.
                </small>
              </div>
            )}

            <div className="d-flex gap-3 justify-content-center mt-4">
              <Link to="/" className="btn btn-outline-padel px-4">
                <i className="bi bi-house me-1"></i> الرئيسية
              </Link>
              <Link to="/book" className="btn btn-padel px-4">
                <i className="bi bi-calendar-plus me-1"></i> حجز جديد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
