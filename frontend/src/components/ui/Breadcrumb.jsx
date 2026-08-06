import { Link } from 'react-router-dom'

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <Link to="/admin" className="text-padel-green">الرئيسية</Link>
        </li>
        {items?.map((item, idx) => {
          const last = idx === items.length - 1
          return item.href ? (
            <li className="breadcrumb-item" key={idx}>
              <Link to={item.href} className="text-padel-green">{item.label}</Link>
            </li>
          ) : (
            <li className={`breadcrumb-item ${last ? 'active' : ''}`} key={idx} aria-current={last ? 'page' : undefined}>
              {item.label}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
