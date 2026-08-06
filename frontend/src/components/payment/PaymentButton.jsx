import { useState } from 'react'
import { createPaymentSession } from '../../api/api'

/**
 * زر دفع عبر ثواني (Thawani).
 *
 * عند الضغط ينشئ جلسة دفع للحجز (أو يعيد محاولة الدفع) ثم
 * يوجّه المستخدم إلى صفحة بوابة الدفع الخاصة بـ Thawani.
 *
 * @param {{ bookingNumber: string, children?: React.ReactNode, className?: string }} props
 */
export default function PaymentButton({ bookingNumber, children, className = 'btn btn-padel w-100' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    if (!bookingNumber) return
    setLoading(true)
    setError('')
    try {
      const res = await createPaymentSession(bookingNumber)
      const paymentUrl = res.payment?.payment_url
      if (paymentUrl) {
        // إعادة التوجيه إلى بوابة ثواني
        window.location.href = paymentUrl
        return
      }
      // قد يكون الحجز مدفوعاً بالفعل
      if (res.paid) {
        window.location.href = `/payment/success?ref=${bookingNumber}`
        return
      }
      setError('تعذر إنشاء جلسة الدفع. يرجى المحاولة مرة أخرى.')
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء جلسة الدفع.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          <i className="bi bi-exclamation-triangle me-1"></i> {error}
        </div>
      )}
      <button
        type="button"
        className={className}
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            جارٍ تحويلك إلى بوابة الدفع...
          </>
        ) : (
          children || (
            <>
              <i className="bi bi-credit-card me-2"></i>
              ادفع الآن عبر ثواني
            </>
          )
        )}
      </button>
    </div>
  )
}
