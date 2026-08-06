// ============================================
// API Service Layer - الاتصال بالـ Backend
// ============================================
// هذا الملف يحتوي على كل دالات الاتصال بنقاط الـ API الحقيقية

const API_BASE = 'http://127.0.0.1:8000/api/v1'

// ===== أدوات مساعدة =====

// حفظ/قراءة التوكن في المتصفح (localStorage)
export const setToken = (token) => localStorage.setItem('padel_admin_token', token || '')
export const getToken = () => localStorage.getItem('padel_admin_token') || ''
export const clearToken = () => localStorage.removeItem('padel_admin_token')

// بناء headers مع التوكن عند الحاجة
const buildHeaders = (json = false) => {
  const headers = { Accept: 'application/json' }
  if (json) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

// معالجة الأخطاء (مع دعم رسائل الـ API العربية)
const handleError = async (res) => {
  if (res.ok) return null
  let message = 'حدث خطأ غير متوقع'
  try {
    const data = await res.json()
    if (data?.message) message = data.message
    else if (data?.errors) {
      const first = Object.values(data.errors)[0]
      message = Array.isArray(first) ? first[0] : first
    }
  } catch (e) { /* تجاهل إذا كان الرد ليس JSON */ }
  const error = new Error(message)
  error.status = res.status
  throw error
}

// ===== المصادقة (Auth) =====

// تسجيل دخول المسؤول
export const adminLogin = async (email, password) => {
  const res = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ email, password }),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// تسجيل مستخدم جديد
export const register = async (payload) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// تسجيل دخول عميل
export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ email, password }),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// تسجيل الخروج
export const logout = async () => {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: buildHeaders(true),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// ===== التوفر (Availability) =====

// الاستعلام عن الأوقات المتاحة
export const getAvailability = async (date, hours = 1) => {
  const query = new URLSearchParams({ date, hours: String(hours) })
  const res = await fetch(`${API_BASE}/availability?${query}`, {
    headers: buildHeaders(),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// جلب تقويم الحجز الشهري (حالة اليوم وساعات العمل) لبناء التقويم
export const getAvailabilityCalendar = async (month) => {
  const query = new URLSearchParams({ month })
  const res = await fetch(`${API_BASE}/availability/calendar?${query}`, {
    headers: buildHeaders(),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// ===== الحجوزات (Bookings) — للعميل =====

// إنشاء حجز جديد
export const createBooking = async (payload) => {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// إنشاء جلسة دفع عبر ثواني لحجز قائم (إعادة محاولة)
export const createPaymentSession = async (bookingReference) => {
  const res = await fetch(`${API_BASE}/payment/create-session`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ booking_reference: bookingReference }),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// التحقق من حالة الدفع بعد عودة المستخدم من بوابة ثواني
export const verifyPayment = async (bookingReference) => {
  const res = await fetch(`${API_BASE}/payment/verify`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ booking_reference: bookingReference }),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// عرض تفاصيل حجز
export const getBooking = async (bookingNumber) => {
  const res = await fetch(`${API_BASE}/bookings/${bookingNumber}`, {
    headers: buildHeaders(),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// إلغاء حجز
export const cancelBooking = async (bookingNumber, reason) => {
  const res = await fetch(`${API_BASE}/bookings/${bookingNumber}/cancel`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ reason }),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// ===== العروض العامة (Public) للزوار =====
// عرض العروض الفعالة والسارية حالياً في الصفحة الرئيسية دون الحاجة لتسجيل الدخول
export const getPublicOffers = async () => {
  const res = await fetch(`${API_BASE}/offers`, { headers: buildHeaders() })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// ===== الإدارة (Admin) =====

// لوحة التحكم
export const getDashboard = async () => {
  const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: buildHeaders() })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// الملاعب (إدارة)
export const getAdminCourts = async () => {
  const res = await fetch(`${API_BASE}/admin/courts`, { headers: buildHeaders() })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// إضافة ملعب
export const createCourt = async (payload) => {
  const res = await fetch(`${API_BASE}/admin/courts`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// تعديل ملعب
export const updateCourt = async (id, payload) => {
  const res = await fetch(`${API_BASE}/admin/courts/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// حذف ملعب
export const deleteCourt = async (id) => {
  const res = await fetch(`${API_BASE}/admin/courts/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// الحجوزات (إدارة)
export const getAdminBookings = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.date) query.set('date', params.date)
  if (params.search) query.set('search', params.search)
  const qs = query.toString()
  const res = await fetch(`${API_BASE}/admin/bookings${qs ? `?${qs}` : ''}`, {
    headers: buildHeaders(),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// تغيير حالة حجز
export const updateBookingStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/admin/bookings/${id}/status`, {
    method: 'PATCH',
    headers: buildHeaders(true),
    body: JSON.stringify({ status }),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// العروض (إدارة)
export const getOffers = async () => {
  const res = await fetch(`${API_BASE}/admin/offers`, { headers: buildHeaders() })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// إضافة عرض
export const createOffer = async (payload) => {
  const res = await fetch(`${API_BASE}/admin/offers`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// تعديل عرض
export const updateOffer = async (id, payload) => {
  const res = await fetch(`${API_BASE}/admin/offers/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// حذف عرض
export const deleteOffer = async (id) => {
  const res = await fetch(`${API_BASE}/admin/offers/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// ساعات العمل
export const getWorkingHours = async () => {
  const res = await fetch(`${API_BASE}/admin/working-hours`, { headers: buildHeaders() })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// إضافة ساعات عمل
export const createWorkingHour = async (payload) => {
  const res = await fetch(`${API_BASE}/admin/working-hours`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// أيام الإغلاق
export const getClosedDates = async () => {
  const res = await fetch(`${API_BASE}/admin/closed-dates`, { headers: buildHeaders() })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// إضافة يوم إغلاق
export const createClosedDate = async (payload) => {
  const res = await fetch(`${API_BASE}/admin/closed-dates`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// حذف يوم إغلاق
export const deleteClosedDate = async (id) => {
  const res = await fetch(`${API_BASE}/admin/closed-dates/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}

// حذف ساعات عمل
export const deleteWorkingHour = async (id) => {
  const res = await fetch(`${API_BASE}/admin/working-hours/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })
  const error = await handleError(res)
  if (error) throw error
  return res.json()
}
