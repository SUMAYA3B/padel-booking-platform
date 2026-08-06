import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminCourts, getPublicOffers } from '../../api/api'
import SectionTitle from '../../components/ui/SectionTitle'

const features = [
  { icon: 'bi-lightning-charge', title: 'حجز فوري', desc: 'احجز ملعبك في دقائق دون تسجيل' },
  { icon: 'bi-shuffle', title: 'توزيع عشوائي', desc: 'تخصيص عادل للملاعب تلقائياً' },
  { icon: 'bi-tags', title: 'عروض ذكية', desc: 'أسعار خاصة عند حجز ساعات متعددة' },
  { icon: 'bi-credit-card', title: 'دفع آمن', desc: 'ادفع نقداً أو عبر بوابة ثواني' },
]

const pricingTiers = [
  { hours: '1 ساعة', price: '10 ر.ع', per: 'للساعة', badge: 'الأساسية' },
  { hours: '2 ساعات', price: '8 ر.ع', per: 'للساعة', badge: 'الأفضل قيمة', highlight: true },
  { hours: '3 ساعات+', price: '7 ر.ع', per: 'للساعة', badge: 'المرنة' },
]

export default function LandingPage() {
  const [courts, setCourts] = useState([])
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [offersLoading, setOffersLoading] = useState(true)

  useEffect(() => {
    getAdminCourts()
      .then((res) => setCourts(res.data?.data ?? res.data ?? []))
      .catch(() => setCourts([]))
      .finally(() => setLoading(false))

    getPublicOffers()
      .then((res) => setOffers(res.data?.data ?? res.data ?? []))
      .catch(() => setOffers([]))
      .finally(() => setOffersLoading(false))
  }, [])

  // نص السعر لعرض
  const offerPriceLabel = (off) => {
    if (off.price_per_hour) return `${off.price_per_hour} ر.ع / ساعة`
    if (off.discount_percent) return `خصم ${off.discount_percent}%`
    return 'عرض خاص'
  }

  // عدد ساعات العرض
  const offerRangeLabel = (off) => {
    if (off.max_hours) return `${off.min_hours} - ${off.max_hours} ساعات`
    return `${off.min_hours}+ ساعات`
  }

  const courtsOfOffer = (off) => (off.courts && off.courts.length ? off.courts.map((c) => c.name).join('، ') : 'جميع الملاعب')

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              
              <h1 className="display-4 fw-bolder lh-sm mb-3">
                احجز ملعب البادل<br />
                <span className="text-padel-green">بكل سهولة ومرونة</span>
              </h1>
              <p className="lead text-white-50 mb-4" style={{ maxWidth: 520 }}>
                منصة رقمية ذكية تربط بين المستخدمين وأصحاب ملاعب البادل في مكان واحد، لتقديم تجربة حجز سلسة وسريعة ومنظمة، مع حلول متكاملة لإدارة الملاعب والحجوزات
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/book" className="btn btn-padel btn-lg px-4">
                  
                  احجز الآن
                </Link>
              </div>
             
            </div>
            <div className="col-lg-5 d-none d-lg-block text-center">
              <div className="p-4 rounded-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <i className="bi bi-activity text-padel-green" style={{ fontSize: '6rem' }}></i>
                <h5 className="text-white mt-3">استعد للمباراة!</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-5" id="features">
        <div className="container">
          <SectionTitle
            title="لماذا بادل برو؟"
        
            center
          />
          <div className="row g-4">
            {features.map((f, i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                <div className="padel-card p-4 h-100 text-center">
                  <div className="stat-icon mx-auto mb-3" style={{ background: '#eaf7f0', color: '#00a859', width: 60, height: 60, fontSize: '1.6rem' }}>
                    <i className={`bi ${f.icon}`}></i>
                  </div>
                  <h6 className="fw-bold mb-2">{f.title}</h6>
                  <p className="text-muted small mb-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COURTS ===== */}
      <section className="py-5 bg-white" id="courts">
        <div className="container">
          <SectionTitle
            title="ملاعبنا"
            center
          />
          <div className="row g-4 justify-content-center">
            {loading ? (
              <div className="col-12 text-center py-4 text-muted">
                <div className="spinner-border text-padel-green mb-2"></div>
                <div>جارٍ تحميل الملاعب...</div>
              </div>
            ) : courts.length === 0 ? (
              <div className="col-12 text-center py-4 text-muted">
                <i className="bi bi-moon-stars d-block mb-2" style={{ fontSize: '2rem' }}></i>
                لا توجد ملاعب متاحة حاليًا
              </div>
            ) : (
              courts.map((court) => (
                <div className="col-md-6 col-lg-3" key={court.id}>
                  <div className="padel-card overflow-hidden h-100">
                    <div
                      style={{
                        height: 170,
                        backgroundImage: court.image ? `url(${court.image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: court.image ? undefined : '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {!court.image && <i className="bi bi-people text-secondary" style={{ fontSize: '3rem' }}></i>}
                    </div>
                    <div className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0 fw-bold">{court.name}</h6>
                        <span className="text-padel-green fw-bold">{court.price_per_hour} ر.ع</span>
                      </div>
                      <p className="text-muted small mb-2">{court.description}</p>
                      <span className="chip chip-success"><i className="bi bi-check-circle me-1"></i>متاح</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== OFFERS ===== */}
      <section className="py-5 bg-light" id="offers">
        <div className="container">
          <SectionTitle
            title="عروضنا"
            center
          />
          {offersLoading ? (
            <div className="col-12 text-center py-4 text-muted">
              <div className="spinner-border text-padel-green mb-2"></div>
              <div>جارٍ تحميل العروض...</div>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-tags d-block mb-2" style={{ fontSize: '2rem' }}></i>
              لا توجد عروض متاحة حالياً، ترقبوا العروض القادمة
            </div>
          ) : (
            <div className="row g-4 justify-content-center">
              {offers.map((off) => (
                <div className="col-md-6 col-lg-3" key={off.id}>
                  <div className="padel-card p-4 h-100 position-relative overflow-hidden">
                    <span className="chip chip-success position-absolute" style={{ top: 12, left: 12 }}>
                      <i className="bi bi-percent me-1"></i>عرض
                    </span>
                    <div className="mb-2 pe-4">
                      <div className="h5 fw-bold mb-1">{off.name}</div>
                      <div className="text-muted small">{offerRangeLabel(off)}</div>
                    </div>
                    <p className="text-muted small mb-3">{off.description || 'استفد من هذا العرض الخاص'}</p>
                    <div className="d-flex justify-content-between align-items-center bg-light rounded-3 p-2 mb-3">
                      <span className="small text-muted">السعر</span>
                      <span className="fw-bold text-padel-green">{offerPriceLabel(off)}</span>
                    </div>
                    <span className="chip chip-info"><i className="bi bi-grid-3x3-gap me-1"></i>{courtsOfOffer(off)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>



      {/* ===== CTA ===== */}
      <section className="py-5">
        <div className="container">
          <div className="p-5 rounded-4 bg-padel-dark text-center text-white">
            <h2 className="fw-bold mb-2">جاهز تبدأ باللعب؟</h2>
            <p className="text-white-50 mb-4" style={{ maxWidth: 480, margin: '0 auto' }}>
              احجز ملعبك الآن واستمتع بأفضل مرافق البادل في عمان
            </p>
            <Link to="/book" className="btn btn-padel btn-lg px-5">
              احجز الآن
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
