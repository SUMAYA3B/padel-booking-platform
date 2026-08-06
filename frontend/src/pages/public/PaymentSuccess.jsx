import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBooking, verifyPayment } from '../../api/api'
import PaymentButton from '../../components/payment/PaymentButton'

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

/**
 * صفحة نتيجة الدفع عبر ثواني.
 *
 * تُستدعى بعد عودة المستخدم من بوابة الدفع.
 * تتحقق أولاً من حالة الدفع لدى Thawani (مثل مشروع thawani-payment المرجعي)
 * ثم تُظهر إما تأكيد النجاح أو حالة "غير مؤكد" مع إمكانية إعادة المحاولة.
 */
export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const bookingNumber = searchParams.get('ref') || searchParams.get('booking_number') || ''
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paid, setPaid] = useState(false)
  const [status, setStatus] = useState('verifying') // verifying | paid | pending

  useEffect(() => {
    if (!bookingNumber) {
      setLoading(false)
      setStatus('pending')
      setError('رقم الحجز غير موجود في رابط الدفع.')
      return
    }

    const run = async () => {
      setStatus('verifying')
      setLoading(true)
      setError('')

      // 1) التحقق من حالة الدفع لدى Thawani
      try {
        const verifyRes = await verifyPayment(bookingNumber)
        if (verifyRes.paid) {
          setPaid(true)
          setStatus('paid')
        } else {
          setStatus('pending')
        }
      } catch (err) {
        // فشل التحقق — نعتمد على حالة الحجز لاحقاً
        setError(err.message)
      }

      // 2) جلب تفاصيل الحجز للعرض
      try {
        const res = await getBooking(bookingNumber)
        const b = res.data ?? res
        setBooking(b)
        if (b?.payment_status === 'paid') {
          setPaid(true)
          setStatus('paid')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingNumber])

  return (
    <section className="py-5" style={{ backgroundColor: '#f5f7f6', minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-padel-green mb-2"></div>
                <div>جارٍ تأكيد الدفع...</div>
              </div>
            ) : error && !booking ? (
              <div className="text-center">
                <div className="display-4 text-muted mb-3"><i className="bi bi-bank"></i></div>
                <h4 className="fw-bold">تعذر تأكيد الدفع</h4>
                <p className="text-muted">{error || 'الحجز غير موجود'}</p>
                <Link to="/" className="btn btn-padel"><i className="bi bi-house me-1"></i> الرئيسية</Link>
              </div>
            ) : status === 'paid' ? (
              <>
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white"
                    style={{ width: 90, height: 90, fontSize: '3rem' }}>
                    <i className="bi bi-check2-circle"></i>
                  </div>
                  <h2 className="fw-bold mt-3 mb-1">تم الدفع بنجاح!</h2>
                  <p className="text-muted mb-0">شكراً لك، تم تأكيد حجزك بعد استلام الدفعة.</p>
                </div>

                <div className="padel-card p-4">
                  <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                    <span className="text-muted">رقم الحجز</span>
                    <span className="fw-bold text-padel-green" dir="ltr">{booking.booking_number}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                    <span className="text-muted">اسم العميل</span>
                    <span className="fw-semibold">{booking.customer_name}</span>
                  </div>
                  {Array.isArray(booking.slots) && booking.slots.length > 0 ? (
                    <div className="border-bottom pb-3 mb-3">
                      <span className="text-muted d-block mb-2">مواعيد الحجز:</span>
                      <ul className="list-unstyled small mb-0">
                        {booking.slots.map((s) => (
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
                    <span className="text-muted">حالة الدفع</span>
                    <span className="fw-semibold text-success">مدفوع</span>
                  </div>
                  <div className="d-flex justify-content-between fs-5 fw-bold">
                    <span>الإجمالي (بعد الخصم)</span>
                    <span className="text-padel-green">{booking.final_price ?? booking.total_price} ر.ع</span>
                  </div>
                </div>

                <div className="d-flex gap-3 justify-content-center mt-4">
                  <Link to="/" className="btn btn-outline-padel px-4">
                    <i className="bi bi-house me-1"></i> الرئيسية
                  </Link>
                  <Link to={`/confirmation/${booking.booking_number}`} className="btn btn-padel px-4">
                    <i className="bi bi-receipt me-1"></i> تفاصيل الحجز
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning text-white"
                  style={{ width: 90, height: 90, fontSize: '3rem' }}>
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <h2 className="fw-bold mt-3 mb-1">لم يتم تأكيد الدفع بعد</h2>
                <p className="text-muted mb-1">
                  لم نتمكن من تأكيد نجاح الدفعة عبر ثواني حتى الآن. قد يكون الدفع قيد المعالجة.
                </p>
                {booking && (
                  <p className="small text-muted mb-3">
                    الحجز: <span className="fw-bold text-padel-green" dir="ltr">{booking.booking_number}</span>
                    <span className="mx-2">|</span>
                    المبلغ: <span className="fw-bold">{booking.final_price ?? booking.total_price} ر.ع</span>
                  </p>
                )}
                {error && <p className="small text-danger mb-3">{error}</p>}

                {bookingNumber && booking ? (
                  <PaymentButton bookingNumber={bookingNumber} className="btn btn-padel px-4">
                    <i className="bi bi-credit-card me-2"></i>
                    إعادة محاولة الدفع
                  </PaymentButton>
                ) : (
                  <Link to="/book" className="btn btn-padel px-4">
                    <i className="bi bi-calendar-plus me-1"></i> حجز جديد
                  </Link>
                )}

                <div className="d-flex gap-3 justify-content-center mt-3">
                  <Link to="/" className="btn btn-outline-secondary flex-fill">
                    <i className="bi bi-house me-1"></i> الرئيسية
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
