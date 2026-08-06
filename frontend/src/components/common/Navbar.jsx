import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  // التمرير السلس (Smooth Scroll) لأعلى الصفحة عند الضغط على "الرئيسية".
  // إذا كان المستخدم على الصفحة الرئيسية نمرّر لأعلاها مباشرة،
  // وإلا ننتقل إلى الصفحة الرئيسية (التي تفتح من الأعلى).
  const goHome = (e) => {
    e.preventDefault()
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  // التمرير السلس إلى قسم داخل الصفحة الرئيسية (#features / #courts / #offers).
  // إذا لم تكن الصفحة الحالية هي الرئيسية ننتقل إليها أولاً ثم نصِل للقسم.
  const scrollToSection = (e, sectionId) => {
    e.preventDefault()
    const scrollToEl = () => {
      document.querySelector(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (location.pathname === '/') {
      scrollToEl()
    } else {
      navigate('/')
      // ننتظر اكتمال فتح الصفحة الرئيسية ثم نمرّر للقسم المطلوب.
      setTimeout(scrollToEl, 150)
    }
  }

  return (
    <nav className="navbar navbar-expand-lg padel-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex flex-column" to="/">
          <span>
            <i className="bi bi-app-indicator me-2"></i>
            بادل<span> برو</span>
          </span>
          <small className="text-uppercase" style={{ fontSize: '0.6rem' }}>Padel Pro</small>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <a className="nav-link text-white" href="/" onClick={goHome}>الرئيسية</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/book">احجز الآن</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#features" onClick={(e) => scrollToSection(e, '#features')}>المميزات</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#courts" onClick={(e) => scrollToSection(e, '#courts')}>الملاعب</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#offers" onClick={(e) => scrollToSection(e, '#offers')}>العروض</a>
            </li>
            <li className="nav-item">
              <Link to="/admin" className="btn btn-padel ms-lg-2">
              
                لوحة التحكم
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
