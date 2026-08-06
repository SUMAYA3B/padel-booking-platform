import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAvailability, getAvailabilityCalendar, createBooking, getAdminCourts, getPublicOffers } from '../../api/api'
import FormField from '../../components/ui/FormField'

// أسماء الأيام حسب التقويم العربي (يبدأ بالسبت)
const DAY_NAMES = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

// تحويل Date إلى صيغة YYYY-MM-DD (بدون تغيير المنطقة الزمنية)
const toIso = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// صيغة الشهر YYYY-MM
const toMonth = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// رقم عمود اليوم (0 = السبت) من رقم يوم JavaScript (0 = الأحد)
const jsDayToCol = (jsDay) => (jsDay + 1) % 7

// تسمية التاريخ بالعربية
const formatDateLabel = (iso) => {
  const [yy, mm, dd] = iso.split('-').map(Number)
  const date = new Date(yy, mm - 1, dd)
  return date.toLocaleDateString('ar-OM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// الوقت الحالي بصيغة HH:MM لمقارنة أوقات اليوم الحالي
const nowHHMM = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// تحويل وقت بصيغة 24 ساعة إلى صيغة 12 ساعة مع صباحاً/مساءً للعرض فقط.
// الـ API والـ Backend ما زالا يتعاملان بصيغة 12 ساعة للعرض (H:i = 24),
// لكن الواجهة تعرض الأوقات بوضوح أكبر بنظام 12 ساعة والنصف (صباحاً/مساءً).
const to12Hour = (hhmm) => {
  const [hh, mm] = hhmm.split(':').map(Number)
  const period = hh >= 12 ? 'م' : 'ص'
  const hour = hh % 12 === 0 ? 12 : hh % 12
  return `${hour}:${String(mm).padStart(2, '0')} ${period}`
}

export default function BookingPage() {
  const navigate = useNavigate()
  const [date, setDate] = useState(toIso(new Date()))
  const [selectedSlots, setSelectedSlots] = useState([])
  const [hours, setHours] = useState(1)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    payment: 'cash',
  })
  const [step, setStep] = useState(1)

  // ===== بيانات السعر الحالية من قاعدة البيانات =====
  // يُجلب عند فتح الصفحة حتى يكون ملخص الدفع مطابقاً لأحدث الأسعار/العروض،
  // وليس الأسعار الثابتة القديمة المخزنة في كود الواجهة.
  const [courts, setCourts] = useState([])
  const [offers, setOffers] = useState([])

  // جلب أحدث الأسعار والعروض من قاعدة البيانات (بدون أي Cache).
  // تُستدعى عند فتح الصفحة ومرة أخرى قبل عرض/تأكيد ملخص الدفع حتى
  // لا يعتمد الملخص على أسعار قديمة. تعيد القيم الطازجة لتحديث الـ state.
  const fetchLatestPrices = async () => {
    const [courtsRes, offersRes] = await Promise.all([
      getAdminCourts(),
      getPublicOffers(),
    ])
    const freshCourts = courtsRes.data?.data ?? courtsRes.data ?? []
    const freshOffers = offersRes.data?.data ?? offersRes.data ?? []
    setCourts(freshCourts)
    setOffers(freshOffers)
    return { courts: freshCourts, offers: freshOffers }
  }

  useEffect(() => {
    // جلب الملاعب والعروض الحالية لتسعير الملخص بدقة وبأحدث الأسعار.
    fetchLatestPrices().catch(() => {})

    // إعادة الجلب عند عودة المستخدم لهذه الصفحة/التبويب (focus) لضمان أن
    // الملخص يعرض دائماً أحدث سعر من قاعدة البيانات وليس سعراً قديماً.
    const onFocus = () => fetchLatestPrices().catch(() => {})
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  // ===== حالة التقويم الشهري =====
  const [currentMonth, setCurrentMonth] = useState(() => toMonth(new Date()))
  const [calendarData, setCalendarData] = useState({}) // iso -> { is_closed, open_time, close_time }
  const [calendarLoading, setCalendarLoading] = useState(true)

  // جلب بيانات التقويم الشهري (حالة كل يوم وساعات عمله)
  useEffect(() => {
    setCalendarLoading(true)
    getAvailabilityCalendar(currentMonth)
      .then((res) => {
        const list = res.data?.data ?? res.data ?? []
        const map = {}
        list.forEach((d) => { map[d.date] = d })
        setCalendarData(map)
      })
      .catch(() => setCalendarData({}))
      .finally(() => setCalendarLoading(false))
  }, [currentMonth])

  // جلب الأوقات المتاحة (ساعة واحدة لكل وقت) من الـ API عند تغيير التاريخ.
  // يُبقي الجلب ثابتاً بساعة واحدة لكل خلية، ويُتاح للعميل توزيع الساعات
  // المختارة على أوقات وأيام متعددة ضمن نفس عملية الحجز.
  const fetchSlots = async () => {
    try {
      setLoadingSlots(true)
      setError('')
      const res = await getAvailability(date, 1)
      // تطبيع البيانات: res.data قد يكون مصفوفة من الأوقات
      const raw = res.data ?? []
      const list = Array.isArray(raw) ? raw : []
      setSlots(list)
    } catch (err) {
      setError(err.message)
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    fetchSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const selectedCourt = (courts && courts.length > 0 ? courts[0] : null) || { price_per_hour: 0 }

  // إضافة/إزالة وقت (ساعة واحدة) من الحجز. يمكن توزيع الساعات على
  // أوقات وأيام مختلفة ضمن نفس عملية الحجز.
  const toggleSlot = (dateStr, time) => {
    setSelectedSlots((prev) => {
      const key = `${dateStr}|${time}`
      const idx = prev.findIndex((s) => `${s.date}|${s.start_time}` === key)
      if (idx !== -1) return prev.filter((_, i) => i !== idx)
      if (prev.length >= hours) return prev
      const [hh] = time.split(':').map(Number)
      const end = `${String(hh + 1).padStart(2, '0')}:00`
      const slots = [...prev, { date: dateStr, start_time: time, end_time: end }]
      slots.sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time))
      return slots
    })
  }

  // عند تقليل عدد الساعات المطلوب، اقتطاع الاختيار الزائد
  const changeHours = (h) => {
    setHours(h)
    setSelectedSlots((prev) => prev.slice(0, h))
  }

  // القيمة الأساسية: تُقرأ من قاعدة البيانات عندما يكون الجلب متاحاً،
  // مع قيمة احتياطية معقولة حتى لا يظهر صفراً في حال تعذّر جلب سعر الملعب
  // (سعر العرض الفعلي يُجلَب دائماً من getPublicOffers ولا يعتمد على هذا).
  const basePrice = Number(selectedCourt.price_per_hour) || 10
  const totalHours = selectedSlots.length

  // تحديد أفضل عرض مطابق لعدد الساعات من قاعدة البيانات (مطابق لمنطق PricingService).
  // العرض النشط والصالح حالياً والذي ينطبق على عدد الساعات المختارة.
  const matchesHours = (off) => {
    if (!off || off.is_active === false) return false
    const min = Number(off.min_hours)
    const max = off.max_hours ? Number(off.max_hours) : null
    if (!Number.isFinite(min)) return false
    if (totalHours < min) return false
    if (max !== null && totalHours > max) return false
    return true
  }

  const bestOffer = offers
    .filter(matchesHours)
    .sort((a, b) => Number(a.price_per_hour) - Number(b.price_per_hour))[0] || null

  // السعر الفعّال للساعة بعد تطبيق العرض (إن وجد).
  let effectivePrice = basePrice
  if (bestOffer) {
    if (bestOffer.price_per_hour != null) {
      effectivePrice = Number(bestOffer.price_per_hour)
    } else if (bestOffer.discount_percent != null) {
      effectivePrice = basePrice * (1 - Number(bestOffer.discount_percent) / 100)
    }
  }
  const total = totalHours * effectivePrice

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    // تحقق من رقم الهاتف العُماني: 8 أرقام يبدأ بـ 9 أو 7
    if (!/^[97][0-9]{7}$/.test(form.phone)) {
      setError('رقم الهاتف يجب أن يكون 8 أرقام ويبدأ بالرقم 9 أو 7 (مثال: 91123456)')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      // إعادة جلب أحدث الأسعار قبل الإرسال لضمان تحديث الـ state (الملخص)
      // بأحدث سعر من قاعدة البيانات وتطابقه مع السعر المستخدم في الدفع،
      // بدلاً من أي بيانات قديمة أو مخزّنة.
      await fetchLatestPrices()

      // إرسال الساعات الموزعة على أوقات/أيام مختلفة كعدة حجوزات فرعية
      // ضمن حجز واحد (عملية دفع واحدة).
      const payload = {
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,
        payment_method: form.payment,
        slots: selectedSlots.map((s) => ({
          booking_date: s.date,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      }

      const res = await createBooking(payload)
      const bookingNumber = res.data?.booking_number ?? res.booking_number

      // إذا كانت طريقة الدفع عبر ثواني، وجّه المستخدم إلى بوابة الدفع
      if (form.payment === 'thawani') {
        const paymentUrl = res.payment?.payment_url
        if (paymentUrl) {
          window.location.href = paymentUrl
          return
        }
        // إذا فشل إنشاء الجلسة، أظهر رسالة إن وجدت
        if (res.payment?.error) {
          setError(res.payment.error)
          setSubmitting(false)
          return
        }
      }

      navigate(`/confirmation/${bookingNumber}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ===== بناء خلايا التقويم الشهري =====
  const today = new Date()
  const todayIso = toIso(today)
  const currentMonthIso = toMonth(today)
  const [cY, cM] = currentMonth.split('-').map(Number)
  const firstOfMonth = new Date(cY, cM - 1, 1)
  const leadingCols = jsDayToCol(firstOfMonth.getDay())
  const daysInMonth = new Date(cY, cM, 0).getDate()

  const cells = []
  for (let i = 0; i < leadingCols; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: `${currentMonth}-${String(d).padStart(2, '0')}`, day: d })
  }

  // التنقل بين الشهور (يمنع الذهاب إلى الماضي)
  const prevMonth = () => {
    setCurrentMonth((prev) => {
      const [py, pm] = prev.split('-').map(Number)
      const nd = new Date(py, pm - 2, 1)
      return toMonth(nd)
    })
  }
  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const [py, pm] = prev.split('-').map(Number)
      const nd = new Date(py, pm, 1)
      return toMonth(nd)
    })
  }

  // حالة الأوقات: تعطيل الماضي (اليوم) وغير المتاح / المحجوز
  const isSlotDisabled = (slot) => {
    const available = slot.is_available !== undefined ? slot.is_available : slot.available_courts > 0
    if (!available) return true
    if (date === todayIso && slot.start_time <= nowHHMM()) return true
    return false
  }

  return (
    <section className="py-5" style={{ backgroundColor: '#f5f7f6' }}>
      <div className="container">
        <div className="mb-4 text-center">
          <div className="d-inline-flex align-items-center gap-2 mb-2">
            <span className="bg-padel-green rounded-circle" style={{ width: 8, height: 8 }}></span>
            <span className="text-padel-green fw-bold small">بادل برو</span>
          </div>
          <h1 className="fw-bold mb-2">احجز ملعبك الآن</h1>
          <p className="text-muted">اختر التاريخ والوقت ثم أكمل بياناتك</p>
        </div>

        {/* Stepper */}
        <div className="d-flex justify-content-center gap-4 mb-4">
          {[
            { n: 1, label: 'اختر الوقت' },
            { n: 2, label: 'بياناتك' },
            { n: 3, label: 'التأكيد' },
          ].map((s) => (
            <div key={s.n} className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{
                  width: 34, height: 34,
                  background: step === s.n ? '#00a859' : step > s.n ? '#00a859' : '#c9d1ce',
                  fontSize: '0.85rem',
                }}
              >
                {step > s.n ? <i className="bi bi-check"></i> : s.n}
              </div>
              <span className={`small ${step === s.n ? 'fw-bold' : 'text-muted'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* ===== LEFT: Date & Slots ===== */}
          <div className="col-lg-8">
            <div className="padel-card p-4 mb-4">
              <h6 className="fw-bold mb-3"><i className="bi bi-calendar3 text-padel-green me-2"></i>اختر التاريخ</h6>

              {/* ===== رأس التقويم + أزرار التنقل ===== */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentMonth === currentMonthIso}
                  onClick={prevMonth}
                  title="الشهر السابق"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
                <span className="fw-bold">
                  {new Date(cY, cM - 1, 1).toLocaleDateString('ar-OM', { month: 'long', year: 'numeric' })}
                </span>
                <button className="btn btn-outline-secondary btn-sm" onClick={nextMonth} title="الشهر التالي">
                  <i className="bi bi-chevron-left"></i>
                </button>
              </div>

              {/* ===== أسماء الأيام (الصف العلوي) ===== */}
              <div className="d-flex flex-wrap text-center mb-1">
                {DAY_NAMES.map((dayName) => (
                  <div style={{ width: '14.2857%' }} key={dayName}>
                    <small className="fw-bold text-padel-green">{dayName}</small>
                  </div>
                ))}
              </div>

              {/* ===== أرقام الأيام ===== */}
              {calendarLoading ? (
                <div className="text-center py-4 text-muted">
                  <div className="spinner-border spinner-border-sm text-padel-green"></div>
                </div>
              ) : (
                <div className="d-flex flex-wrap">
                  {cells.map((cell, i) => {
                    if (cell === null) return <div style={{ width: '14.2857%', padding: 2 }} key={`blank-${i}`}></div>
                    const entry = calendarData[cell.iso]
                    const isPast = cell.iso < todayIso
                    const isClosed = entry?.is_closed
                    const disabled = isPast || isClosed
                    const isSelected = cell.iso === date
                    return (
                      <div style={{ width: '14.2857%', padding: 2 }} key={cell.iso}>
                        <button
                          type="button"
                          className={`calendar-day w-100 ${isSelected ? 'calendar-selected' : ''} ${disabled ? 'calendar-disabled' : ''} ${isClosed ? 'calendar-closed' : ''}`}
                          style={{ height: 48 }}
                          disabled={disabled}
                          onClick={() => setDate(cell.iso)}
                          title={isClosed ? 'غير متاح (مغلق)' : isPast ? 'تاريخ مضى' : ''}
                        >
                          <span>{cell.day}</span>
                          {isClosed && <i className="bi bi-x-circle-fill d-block" style={{ fontSize: '0.7rem', marginTop: 2 }}></i>}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ===== إيضاحات حالة الأيام ===== */}
              <div className="d-flex flex-wrap gap-2 mt-3 mb-0 small">
                <span className="chip chip-success"><i className="bi bi-circle me-1"></i>متاح</span>
                <span className="chip chip-danger"><i className="bi bi-x-circle me-1"></i>مغلق / غير متاح</span>
                <span className="chip chip-secondary"><i className="bi bi-circle me-1"></i>تاريخ مضى</span>
              </div>

              {/* ===== اختيار الأوقات ===== */}
              <h6 className="fw-bold mb-3 mt-4"><i className="bi bi-clock text-padel-green me-2"></i>اختر الأوقات المتاحة</h6>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="small text-muted">عدد الساعات (يمكن توزيعها على أيام وأوقات):</span>
                {[1, 2, 3, 4].map((h) => (
                  <button
                    key={h}
                    className={`btn btn-sm rounded-pill ${hours === h ? 'btn-padel' : 'btn-outline-secondary'}`}
                    onClick={() => changeHours(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div className="text-muted small mb-3">
                <i className="bi bi-info-circle me-1"></i>
                اختر {hours} ساعة من هذا اليوم أو من أيام أخرى في التقويم.
                يمكنك التنقل بين الأيام لإضافة الساعات المتبقية من اختيارك.
              </div>

              {loadingSlots ? (
                <div className="text-center py-4 text-muted">
                  <div className="spinner-border text-padel-green"></div>
                  <div className="mt-2 small">جارٍ تحميل الأوقات...</div>
                </div>
              ) : error ? (
                <div className="alert alert-danger py-2 small" role="alert">
                  <i className="bi bi-exclamation-triangle me-1"></i> {error}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  <i className="bi bi-clock-history d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                  لا توجد أوقات متاحة لهذا التاريخ
                </div>
              ) : (
                <div className="row g-2">
                  {slots.map((slot) => {
                    const time = slot.start_time
                    const isDisabled = isSlotDisabled(slot)
                    const isSelected = selectedSlots.some((s) => s.date === date && s.start_time === time)
                    return (
                      <div className="col-3 col-md-2" key={time}>
                        <button
                          className={`slot-btn w-100 ${
                            isDisabled
                              ? 'slot-disabled'
                              : isSelected
                              ? 'slot-selected'
                              : 'slot-available'
                          }`}
                          disabled={isDisabled}
                          onClick={() => toggleSlot(date, time)}
                          title={isDisabled ? (slot.is_available ? 'وقت مضي / غير متاح' : 'محجوز') : `${slot.available_courts} ملعب متاح`}
                        >
                          {to12Hour(time)}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="d-flex gap-2 mt-3 small">
                <span className="chip chip-success"><i className="bi bi-circle me-1"></i>متاح</span>
                <span className="chip chip-secondary"><i className="bi bi-circle me-1"></i>غير متاح / محجوز</span>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: Summary & Form ===== */}
          <div className="col-lg-4">
            <div className="padel-card p-4 sticky-top" style={{ top: 90 }}>
              {step === 1 ? (
                <>
                  <h6 className="fw-bold mb-3"><i className="bi bi-receipt text-padel-green me-2"></i>ملخص الحجز</h6>

                  {selectedSlots.length === 0 ? (
                    <div className="alert alert-light border text-muted small text-center py-3">
                      <i className="bi bi-calendar-plus d-block mb-2" style={{ fontSize: '1.4rem' }}></i>
                      لم تختَر أي أوقات بعد. اختر {hours} ساعة من التقويم.
                    </div>
                  ) : (
                    <>
                      <div className="small text-muted mb-1">الأوقات المختارة:</div>
                      <ul className="list-unstyled small mb-2">
                        {selectedSlots.map((s) => (
                          <li key={`${s.date}|${s.start_time}`} className="d-flex justify-content-between border-bottom py-1">
                            <span>{formatDateLabel(s.date)}</span>
                            <span className="fw-semibold" dir="ltr">{to12Hour(s.start_time)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="d-flex justify-content-between mb-2 small">
                        <span className="text-muted">إجمالي الساعات:</span>
                        <span className="fw-semibold">{totalHours} ساعة</span>
                      </div>
                    </>
                  )}

                  <div className="d-flex justify-content-between mb-2 small">
                    <span className="text-muted">السعر الأساسي:</span>
                    <span className="fw-semibold">{basePrice} ر.ع / ساعة</span>
                  </div>
                  {bestOffer && (
                    <div className="d-flex justify-content-between mb-2 small text-padel-green fw-bold">
                      <span>توفير ({bestOffer.name})</span>
                      <span>-{(basePrice - effectivePrice).toFixed(2)} ر.ع/ساعة</span>
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>الإجمالي:</span>
                    <span className="text-padel-green">{total} ر.ع</span>
                  </div>
                  <button
                    className="btn btn-padel w-100 mt-4"
                    disabled={selectedSlots.length === 0}
                    onClick={() => {
                      // إعادة جلب أحدث الأسعار قبل عرض بيانات الدفع لضمان
                      // مطابقة السعر المعروض للسعر المستخدم في عملية الدفع.
                      fetchLatestPrices().catch(() => {})
                      setStep(2)
                    }}
                  >
                    متابعة البيانات <i className="bi bi-arrow-left ms-1"></i>
                  </button>
                  {selectedSlots.length === 0 && (
                    <div className="text-danger small text-center mt-2">
                      <i className="bi bi-exclamation-circle me-1"></i>اختر وقتاً واحداً على الأقل للمتابعة
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger py-2 small" role="alert">
                      <i className="bi bi-exclamation-triangle me-1"></i> {error}
                    </div>
                  )}
                  <h6 className="fw-bold mb-3"><i className="bi bi-person text-padel-green me-2"></i>بيانات الحجز</h6>
                  <FormField label="الاسم الكامل" icon="bi-person" required value={form.name}
                    onChange={(e) => setField('name', e.target.value)} placeholder="أدخل اسمك الكامل" />
                  <FormField label="رقم الهاتف (عُمان)" icon="bi-telephone" required value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)} placeholder="8X XXXXXX (مثال: 91123456)" />
                  <small className="text-muted">8 أرقام يبدأ بـ 9 أو 7، بدون رمز البلد (مثال: 91123456)</small>
                  <FormField label="البريد الإلكتروني (اختياري)" icon="bi-envelope" type="email" value={form.email}
                    onChange={(e) => setField('email', e.target.value)} placeholder="name@example.com" />
                  <FormField label="ملاحظات (اختياري)" as="textarea" rows={2} value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)} placeholder="أي ملاحظات إضافية" />

                  <label className="form-label fw-semibold small mt-2">طريقة الدفع</label>
                  <div className="d-flex gap-2 mb-2">
                    <button type="button" className={`btn ${form.payment === 'cash' ? 'btn-padel' : 'btn-outline-secondary'} flex-fill`}
                      onClick={() => setField('payment', 'cash')}>
                      <i className="bi bi-cash-coin me-1"></i> نقداً
                    </button>
                    <button type="button" className={`btn ${form.payment === 'thawani' ? 'btn-padel' : 'btn-outline-secondary'} flex-fill`}
                      onClick={() => setField('payment', 'thawani')}>
                      <i className="bi bi-credit-card me-1"></i> ثواني
                    </button>
                  </div>

                  {form.payment === 'thawani' && (
                    <div className="alert alert-info py-2 small mb-3" role="alert">
                      <i className="bi bi-credit-card-2-front me-1"></i>
                      سيتم تحويلك إلى بوابة الدفع الآمنة عبر ثواني بعد تأكيد الحجز.
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setStep(1)}>
                      <i className="bi bi-arrow-right"></i> رجوع
                    </button>
                    <button type="submit" className="btn btn-padel flex-fill" disabled={submitting}>
                      {submitting ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <i className={`bi ${form.payment === 'thawani' ? 'bi-credit-card' : 'bi-check2'} ms-1`}></i>
                      )}
                      {submitting
                        ? 'جارٍ إرسال الحجز...'
                        : form.payment === 'thawani'
                          ? 'تأكيد والدفع عبر ثواني'
                          : 'تأكيد الحجز'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
