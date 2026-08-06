import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBooking } from '../../api/api'
import PaymentButton from '../../components/payment/PaymentButton'

/**
 * صفحة إلغاء / فشل الدفع عبر ثواني.
 *
 * تُستدعى بعد عودة المستخدم من بوابة الدفع في حالة الإلغاء أو الفشل.
 * تعرض رسالة وتتيح إعادة محاولة الدفع.
 */
export default function PaymentCancel() {
  const [searchParams] = useSearchParams()
  const bookingNumber = searchParams.get('ref') || searchParams.get('booking_number') || ''
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    if (!bookingNumber) return
    const fetchBooking = async () => {
      try {
        const res = await getBooking(bookingNumber)
        setBooking(res.data ?? res)
      } catch (e) {
        // تجاهل — نعرض الرسالة العامة
      }
    }
    fetchBooking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingNumber])

  return (
    <section className="py-5" style={{ backgroundColor: '#f5f7f6', minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning text-white"
                style={{ width: 90, height: 90, fontSize: '3rem' }}>
                <i className="bi bi-x-circle"></i>
              </div>
              <h2 className="fw-bold mt-3 mb-1">لم يكتمل الدفع</h2>
              <p className="text-muted mb-0">
                يبدو أنك ألغيت الدفع أو لم يكتمل. يمكنك إعادة المحاولة أو الدفع لاحقاً.
              </p>
            </div>

            <div className="padel-card p-4 text-center">
              {booking && (
                <div className="small text-muted mb-3">
                  الحجز: <span className="fw-bold text-padel-green" dir="ltr">{booking.booking_number}</span>
                  <span className="mx-2">|</span>
                  المبلغ: <span className="fw-bold">{booking.final_price ?? booking.total_price} ر.ع</span>
                </div>
              )}

              {bookingNumber && booking ? (
                <PaymentButton bookingNumber={bookingNumber}>
                  <i className="bi bi-credit-card me-2"></i>
                  إعادة المحاولة والدفع
                </PaymentButton>
              ) : (
                <Link to="/book" className="btn btn-padel">
                  <i className="bi bi-calendar-plus me-1"></i> حجز جديد
                </Link>
              )}

              <div className="d-flex gap-3 justify-content-center mt-3">
                <Link to="/" className="btn btn-outline-secondary flex-fill">
                  <i className="bi bi-house me-1"></i> الرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
