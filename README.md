# 🏓 بادل برو — منصة حجز ملاعب البادل

منصة متكاملة لحجز ملاعب البادل عبر الإنترنت، مع نظام عروض ذكية (سعر بالساعة حسب مدة الحجز) ودفع إلكتروني عبر بوابة **ثواني (Thawani)**، ولوحة تحكم لإدارة الملاعب والحجوزات والعروض وساعات العمل وأيام الإغلاق.

---

## 🛠️ التقنيات المستخدمة

### الواجهة الخلفية (Backend)
| التقنية | الاستخدام |
|---------|-----------|
| **Laravel 12** | إطار العمل الرئيسي — بناء الـ API |
| **PHP ^8.2** | لغة البرمجة |
| **MySQL** | قاعدة البيانات |
| **Laravel Sanctum** | المصادقة عبر التوكنات (Tokens) |
| **Laravel HTTP Client** | التواصل مع بوابة الدفع Thawani |
| **PHPUnit** | اختبارات الوحدة والوظائف |

### الواجهة الأمامية (Frontend)
| التقنية | الاستخدام |
|---------|-----------|
| **React 18** | بناء واجهة المستخدم |
| **Vite 5** | أداة البناء والتطوير (Dev Server) |
| **React Router v6** | التوجيه (Routing) |
| **Bootstrap 5 + Bootstrap Icons** | التصميم والأيقونات |
| **Sass** | معالج الأنماط |

### الاختبار والاتصال بالـ API
| الأداة | الاستخدام |
|--------|-----------|
| **Postman** | اختبار نقاط الـ API والتجارب |
| **REST API (JSON)** | بروتوكول الاتصال بين React و Laravel |

### الدفع الإلكتروني
| الخدمة | الاستخدام |
|--------|-----------|
| **Thawani** | بوابة الدفع — تعمل حالياً بوضع التجربة (Stage/UAT) |

---

## 📁 هيكل المشروع

```
padel-booking-platform/
├── app/
│   ├── Http/Controllers/   # Controllers (Customer, Admin, Auth)
│   ├── Http/Requests/      # قواعد التحقق من صحة البيانات
│   ├── Models/             # (Booking, Court, Offer, User, WorkingHour, ClosedDate...)
│   └── Services/           # (Availability, Booking, Pricing, ThawaniPayment)
├── bootstrap/              # ملفات إقلاع التطبيق
├── config/                 # إعدادات Laravel + إعدادات Thawani
├── database/
│   ├── migrations/         # جداول قاعدة البيانات
│   └── seeders/            # البيانات الافتراضية (المسؤول، الملاعب، العروض، الحجوزات)
├── frontend/               # تطبيق React + Vite
│   └── src/
│       ├── api/            # طبقة الاتصال بالـ Backend
│       ├── components/     # مكوّنات قابلة لإعادة الاستخدام
│       ├── layouts/        # (PublicLayout, AdminLayout)
│       └── pages/          # صفحات العامّة والإدارة
├── routes/api.php          # مسارات الـ API
├── public/                 # الملفات العامة
└── .env                    # المتغيرات البيئية (لا تُرفع إلى Git)
```

---

## 🚀 متطلبات التشغيل

- **PHP** ≥ 8.2
- **Composer** (مدير حزم PHP)
- **Node.js** ≥ 18 مع **npm**
- **MySQL** ≥ 8 (خادم قاعدة البيانات)
- **Postman** (اختياري، لاختبار الـ API)

---

## ⚙️ خطوات التشغيل

### 1️⃣ تثبيت اعتماديات الـ Backend
```bash
composer install
```

### 2️⃣ إعداد ملف البيئة `.env`
انسخ الملف النموذجي ثم عدّل بيانات قاعدة البيانات:
```bash
cp .env.example .env      # على Windows: copy .env.example .env
```

افتح `.env` وعدّل سطر الاتصال بقاعدة البيانات ليطابق إعداداتك:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=padel_booking_platform
DB_USERNAME=root
DB_PASSWORD=
```

ثم ولّد مفتاح التطبيق:
```bash
php artisan key:generate
```

### 3️⃣ إنشاء الجداول وملء البيانات الافتراضية
```bash
php artisan migrate --seed
```
> `--seed` يشغّل السيدرات:
> - `AdminUserSeeder` — حسابات المسؤول وموظف.
> - `CourtSeeder` — 4 ملاعب + ساعات عمل لكل أيام الأسبوع.
> - `OfferSeeder` — نظام العروض.
> - `BookingSeeder` — حجوزات تجريبية.

### 4️⃣ تثبيت اعتماديات الـ Frontend
```bash
cd frontend
npm install
```

### 5️⃣ تشغيل الخوادم

> ⚠️ شغّل كل خادم في نافذة Terminal منفصلة.

**Backend (Laravel API):** من جذر المشروع
```bash
php artisan serve
```
> يعمل على: `http://127.0.0.1:8000` — ونقاط الـ API أساسها `/api/v1`.

**Frontend (React + Vite):** في مجلد `frontend`
```bash
npm run dev
```
> يعمل على: `http://localhost:3000`

---

## 🔑 بيانات الدخول إلى لوحة التحكم

افتح صفحة تسجيل الدخول: **`http://localhost:3000/admin/login`**

> ⚠️ تُنشأ هذه الحسابات تلقائياً عند تشغيل سيدر `AdminUserSeeder` (يُشغَّل مع `php artisan migrate --seed`).

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|-------------------|-------------|
| **مدير النظام (Super Admin)** | `admin@padelpro.om` | `password123` |
| **موظف (Staff)** | `staff@padelpro.om` | `password123` |

### صفحات لوحة التحكم
| المسار | الغرض |
|--------|-------|
| `/admin` | لوحة التحكم الرئيسية (Dashboard) |
| `/admin/courts` | إدارة الملاعب |
| `/admin/bookings` | إدارة الحجوزات |
| `/admin/offers` | إدارة العروض |
| `/admin/working-hours` | إدارة ساعات العمل |
| `/admin/closed-dates` | إدارة أيام الإغلاق |

---

## 🌐 نقاط الـ API الرئيسية

| الأصل | الوصف |
|-------|-------|
| `POST /api/v1/auth/register` | تسجيل عميل جديد |
| `POST /api/v1/auth/login` | تسجيل دخول عميل |
| `POST /api/v1/admin/auth/login` | تسجيل دخول المسؤول |
| `GET /api/v1/availability?date=YYYY-MM-DD&hours=1` | جلب الأوقات المتاحة |
| `POST /api/v1/bookings` | إنشاء حجز (`cash` أو `thawani`) |
| `GET /api/v1/bookings/{bookingNumber}` | عرض تفاصيل حجز |
| `POST /api/v1/bookings/{bookingNumber}/cancel` | إلغاء حجز |
| `GET /api/v1/admin/dashboard` | بيانات لوحة التحكم |
| `POST /api/v1/payment/create-session` | إنشاء جلسة دفع (Thawani) |
| `POST /api/v1/payment/verify` | التحقق من حالة الدفع |
| `POST /api/v1/payment/webhook` | تأكيد نجاح/فشل الدفع (Webhook) |
| `POST /api/v1/thawani/callback` | نداء إعادة التوجيه (Callback) |

> جميع نقاط الـ API الإدارية محمية بالتوكن (Bearer Token) وتتطلب دور **Super Admin / Staff**.

---

## 📮 اختبار الـ API عبر Postman

يوجد ملف **`padel-api.postman_collection.json`** بجذر المشروع يحتوي جميع نقاط الـ API مرتبةً وموثّقة.

### خطوات الاستيراد
1. افتح Postman.
2. اضغط **Import** ثم اختر ملف `padel-api.postman_collection.json`.
3. ستجد داخل المجموعة متغيرات جاهزة (Variables):
   - `base_url` = `http://127.0.0.1:8000`
   - `admin_token` = (ضع التوكن بعد تسجيل الدخول)

### أقسام المجموعة

| القسم | المحتوى |
|-------|---------|
| 🔐 المصادقة (Auth) | تسجيل دخول المسؤول، تسجيل/دخول عميل، تسجيل الخروج |
| 🗓️ توفر الملاعب | الاستعلام عن الأوقات المتاحة |
| 📝 الحجوزات (عملاء) | إنشاء/عرض/إلغاء حجز |
| 🔧 لوحة الإدارة (Admin) | Dashboard، الملاعب، الحجوزات، العروض، ساعات العمل، أيام الإغلاق |

> **ملاحظة:** بعد تنفيذ «تسجيل دخول المسؤول»، انسخ قيمة `token` من الرد وضعها في متغير `admin_token` لتُستخدم تلقائياً في بقية الطلبات الإدارية.

---

## 💳 تكامل الدفع عبر ثواني (Thawani)

الإعدادات موجودة في `.env` في صندوق `Thawani Payment Gateway`. المشروع يعمل حالياً بوضع التجربة (UAT):

| المتغيّر | الوصف |
|----------|-------|
| `THAWANI_SECRET_KEY` | المفتاح السري (سرّي — لا يُشارك) |
| `THAWANI_PUBLISHABLE_KEY` | المفتاح العام |
| `THAWANI_MODE` | `sandbox` (تجربة) / `production` (إنتاج) |
| `THAWANI_API_URL` | عنوان API البوابة |
| `THAWANI_CHECKOUT_URL` | عنوان صفحة الدفع (Checkout) |
| `THAWANI_STAGE_ONLY` | قفل التشغيل على وضع التجربة فقط (يرمي خطأً في الإنتاج إلا عند تعديله) |

> **الحصول على المفاتيح:** من منصة مطوّري Thawani (`developer.thawani.om`) — أنشئ متجراً واحصل على المفتاحين (Secret / Publishable).

### ملاحظة أمان (Stage-only)
تتحقق خدمة `ThawaniPaymentService` ألا يعمل التطبيق إلا مع `uatcheckout.thawani.om` ما لم تُغيّر المتغير `THAWANI_STAGE_ONLY=false` عند الانتقال للإنتاج.

---

## 🧪 الاختبارات

اختبارات الـ Backend (PHPUnit). تُشغَّل الاختبارات على قاعدة SQLite داخل الذاكرة تلقائياً
دون التأثير على قاعدة MySQL الفعلية:
```bash
php artisan test
```

---

## 📌 ملاحظات مهمة

- تأكد أن قاعدة بيانات MySQL تعمل قبل `migrate`.
- المسارات الإدارية محمية بالدور **Super Admin / Staff** (عبر `auth:sanctum` + middleware `admin`).
- رقم الهاتف العُماني في الحجز: **8 أرقام يبدأ بـ 9 أو 7** (مثال: `91123456`).
- عند التعديل على `.env` أعد تفريغ الإعدادات:
  ```bash
  php artisan config:clear
  ```

---

## 📚 المصادر

| الغرض | الرابط |
|-------|--------|
| توثيق Laravel | https://laravel.com/docs |
| توثيق React | https://react.dev/ |
| توثيق Vite | https://vitejs.dev/guide/ |
| توثيق React Router | https://reactrouter.com/ |
| توثيق Bootstrap 5 | https://getbootstrap.com/ |
| توثيق Postman | https://learning.postman.com/ |
| بوابة الدفع ثواني (Thawani) | https://developer.thawani.om/ |

---

## 🤖 الذكاء الاصطناعي (AI)

تم استخدام **DeepSeek** كمساعد ذكاء اصطناعي في تطوير وتحسين هذا المشروع.

---

ترخيص المشروع: **MIT**
