// ============================================
// DUMMY DATA - For Frontend UI Demonstration
// ============================================

export const courts = [
  {
    id: 1,
    name: 'ملعب 1',
    description: 'ملعب داخلي مكيّف',
    price_per_hour: 10,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 2,
    name: 'ملعب 2',
    description: 'ملعب خارجي',
    price_per_hour: 12,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1614068623389-4f36a10f0fbb?auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 3,
    name: 'ملعب 3 - VIP',
    description: 'ملعب فاخر مع إنارة LED',
    price_per_hour: 15,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1614068624436-f5b0f1a9e0e0?auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 4,
    name: 'ملعب 4',
    description: 'ملعب داخلي مع مرافق إضافية',
    price_per_hour: 11,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1614068624866-31e4d7d2e3a0?auto=format&fit=crop&w=600&q=60',
  },
]

export const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
]

// Determine which slots are available/disabled (dummy logic)
export const availableSlots = [
  { time: '06:00', available: true },
  { time: '07:00', available: true },
  { time: '08:00', available: false },
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: false },
  { time: '12:00', available: true },
  { time: '13:00', available: true },
  { time: '14:00', available: true },
  { time: '15:00', available: false },
  { time: '16:00', available: true },
  { time: '17:00', available: true },
  { time: '18:00', available: true },
  { time: '19:00', available: false },
  { time: '20:00', available: true },
  { time: '21:00', available: true },
  { time: '22:00', available: false },
  { time: '23:00', available: true },
]

export const bookings = [
  {
    id: 1,
    booking_number: 'BK-20250115-A1B2C3',
    customer_name: 'أحمد محمد',
    customer_phone: '0551112222',
    court_name: 'ملعب 1',
    booking_date: '2025-01-15',
    start_time: '06:00',
    end_time: '08:00',
    total_price: 20,
    status: 'confirmed',
    payment_method: 'cash',
    payment_status: 'paid',
    created_at: '2025-01-14'
  },
  {
    id: 2,
    booking_number: 'BK-20250115-D4E5F6',
    customer_name: 'سارة علي',
    customer_phone: '0553334444',
    court_name: 'ملعب 2',
    booking_date: '2025-01-15',
    start_time: '09:00',
    end_time: '10:00',
    total_price: 12,
    status: 'pending',
    payment_method: 'thawani',
    payment_status: 'unpaid',
    created_at: '2025-01-14'
  },
  {
    id: 3,
    booking_number: 'BK-20250115-G7H8I9',
    customer_name: 'خالد حسن',
    customer_phone: '0555556666',
    court_name: 'ملعب 3',
    booking_date: '2025-01-16',
    start_time: '18:00',
    end_time: '21:00',
    total_price: 45,
    status: 'confirmed',
    payment_method: 'thawani',
    payment_status: 'paid',
    created_at: '2025-01-13'
  },
  {
    id: 4,
    booking_number: 'BK-20250115-J1K2L3',
    customer_name: 'نورة عبدالله',
    customer_phone: '0557778888',
    court_name: 'ملعب 4',
    booking_date: '2025-01-14',
    start_time: '16:00',
    end_time: '18:00',
    total_price: 22,
    status: 'completed',
    payment_method: 'cash',
    payment_status: 'paid',
    created_at: '2025-01-12'
  },
  {
    id: 5,
    booking_number: 'BK-20250115-M4N5O6',
    customer_name: 'عمر يوسف',
    customer_phone: '0559990000',
    court_name: 'ملعب 1',
    booking_date: '2025-01-13',
    start_time: '07:00',
    end_time: '09:00',
    total_price: 20,
    status: 'cancelled',
    payment_method: 'cash',
    payment_status: 'refunded',
    created_at: '2025-01-11'
  },
  {
    id: 6,
    booking_number: 'BK-20250116-P7Q8R9',
    customer_name: 'لمى سلطان',
    customer_phone: '0561112222',
    court_name: 'ملعب 2',
    booking_date: '2025-01-16',
    start_time: '10:00',
    end_time: '12:00',
    total_price: 24,
    status: 'pending',
    payment_method: 'cash',
    payment_status: 'unpaid',
    created_at: '2025-01-15'
  },
]

export const offers = [
  {
    id: 1,
    name: 'عرض ساعة واحدة',
    description: 'السعر الأساسي لحجز ساعة واحدة',
    min_hours: 1,
    max_hours: 1,
    price_per_hour: 10.00,
    discount_percent: null,
    is_active: true,
    applicable_courts: 'جميع الملاعب'
  },
  {
    id: 2,
    name: 'عرض ساعتين',
    description: 'توفير عند حجز ساعتين',
    min_hours: 2,
    max_hours: 2,
    price_per_hour: 8.00,
    discount_percent: null,
    is_active: true,
    applicable_courts: 'جميع الملاعب'
  },
  {
    id: 3,
    name: 'عرض 3 ساعات',
    description: 'أفضل قيمة لحجز 3 ساعات',
    min_hours: 3,
    max_hours: 4,
    price_per_hour: 7.00,
    discount_percent: null,
    is_active: true,
    applicable_courts: 'ملعب 1, ملعب 2'
  },
  {
    id: 4,
    name: 'خصم العروض الكبرى',
    description: 'خصم 15% على الحجوزات الطويلة من 5 ساعات',
    min_hours: 5,
    max_hours: null,
    price_per_hour: null,
    discount_percent: 15,
    is_active: true,
    applicable_courts: 'جميع الملاعب'
  },
  {
    id: 5,
    name: 'عرض VIP',
    description: 'سعر خاص لملعب VIP من 2 ساعات',
    min_hours: 2,
    max_hours: null,
    price_per_hour: 12.00,
    discount_percent: null,
    is_active: false,
    applicable_courts: 'ملعب 3'
  },
]

export const workingHoursData = [
  { court_id: 1, day_of_week: 0, day_name: 'الأحد', open_time: '06:00', close_time: '23:00', is_active: true },
  { court_id: 1, day_of_week: 1, day_name: 'الإثنين', open_time: '06:00', close_time: '23:00', is_active: true },
  { court_id: 1, day_of_week: 2, day_name: 'الثلاثاء', open_time: '06:00', close_time: '23:00', is_active: true },
  { court_id: 1, day_of_week: 3, day_name: 'الأربعاء', open_time: '06:00', close_time: '23:00', is_active: true },
  { court_id: 1, day_of_week: 4, day_name: 'الخميس', open_time: '06:00', close_time: '23:00', is_active: true },
  { court_id: 1, day_of_week: 5, day_name: 'الجمعة', open_time: '14:00', close_time: '23:00', is_active: true },
  { court_id: 1, day_of_week: 6, day_name: 'السبت', open_time: '08:00', close_time: '23:00', is_active: true },
]

export const closedDatesData = [
  { id: 1, court_name: 'جميع الملاعب', date: '2025-02-01', reason: 'صيانة دورية' },
  { id: 2, court_name: 'ملعب 3', date: '2025-02-05', reason: 'إصلاح الإضاءة' },
  { id: 3, court_name: 'ملعب 2', date: '2025-02-10', reason: 'إعادة طلاء الأرضية' },
  { id: 4, court_name: 'جميع الملاعب', date: '2025-02-20', reason: 'عطلة رسمية' },
]

export const dashboardStats = {
  total_courts: 4,
  today_bookings: 6,
  total_revenue: 4520,
  avg_utilization: 72,
  weekly_bookings: [45, 62, 38, 71, 55, 84, 69],
  bookings_by_status: {
    pending: 12,
    confirmed: 38,
    completed: 210,
    cancelled: 9,
  },
}

export const recentActivities = [
  { id: 1, action: 'حجز جديد', detail: 'أحمد محمد حجز ملعب 1 (06:00-08:00)', time: 'منذ 5 دقائق' },
  { id: 2, action: 'تأكيد حجز', detail: 'تم تأكيد حجز سارة علي', time: 'منذ 20 دقيقة' },
  { id: 3, action: 'إلغاء حجز', detail: 'ألغى عمر يوسف حجزه', time: 'منذ ساعة' },
  { id: 4, action: 'دفع عبر ثواني', detail: 'دفع خالد حسن بالمبلغ 45 ر.ع', time: 'منذ ساعتين' },
]
