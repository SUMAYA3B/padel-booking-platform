import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer mt-auto py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 className="text-white mb-3">
              <i className="bi bi-app-indicator me-2 text-padel-green"></i>
              بادل برو
            </h5>
            <p className="small">
              منصة احترافية لحجز ملاعب البادل. نوفر لك أفضل الملاعب مع نظام حجز سهل وسريع.
            </p>
            <div className="d-flex gap-2">
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-whatsapp"></i></a>
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-facebook"></i></a>
            </div>
          </div>
          <div className="col-lg-2">
            <h6 className="text-white mb-3">روابط سريعة</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/" className="text-white-50">الرئيسية</Link></li>
              <li className="mb-2"><Link to="/book" className="text-white-50">احجز الآن</Link></li>
              <li className="mb-2"><Link to="/admin" className="text-white-50">لوحة التحكم</Link></li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h6 className="text-white mb-3">تواصل معنا</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><i className="bi bi-telephone me-2"></i> +968 9000 0000</li>
              <li className="mb-2"><i className="bi bi-envelope me-2"></i> info@padelpro.om</li>
              <li className="mb-2"><i className="bi bi-geo-alt me-2"></i> مسقط، عمان</li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h6 className="text-white mb-3">ساعات العمل</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">السبت - الخميس: 06:00 - 23:00</li>
              <li className="mb-2">الجمعة: 14:00 - 23:00</li>
            </ul>
          </div>
        </div>
        <hr className="text-white-50" />
        <div className="text-center small">
          © 2025 بادل برو. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  )
}
