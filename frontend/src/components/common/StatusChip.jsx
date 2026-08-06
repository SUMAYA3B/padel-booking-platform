const statusMap = {
  pending: { label: 'قيد الانتظار', color: 'chip-warning', icon: 'bi-hourglass-split' },
  confirmed: { label: 'مؤكد', color: 'chip-success', icon: 'bi-check-circle' },
  completed: { label: 'مكتمل', color: 'chip-info', icon: 'bi-check2-all' },
  cancelled: { label: 'ملغي', color: 'chip-danger', icon: 'bi-x-circle' },
  active: { label: 'نشط', color: 'chip-success', icon: 'bi-check-circle' },
  inactive: { label: 'غير نشط', color: 'chip-secondary', icon: 'bi-pause-circle' },
  paid: { label: 'مدفوع', color: 'chip-success', icon: 'bi-cash' },
  unpaid: { label: 'غير مدفوع', color: 'chip-warning', icon: 'bi-credit-card' },
  refunded: { label: 'مرجع', color: 'chip-secondary', icon: 'bi-arrow-counterclockwise' },
  cash: { label: 'نقدي', color: 'chip-info', icon: 'bi-cash-coin' },
  thawani: { label: 'ثواني', color: 'chip-success', icon: 'bi-credit-card-2-front' },
}

export default function StatusChip({ status }) {
  const config = statusMap[status] || { label: status, color: 'chip-secondary', icon: 'bi-tag' }
  return (
    <span className={`chip ${config.color}`}>
      <i className={`bi ${config.icon}`}></i>
      {config.label}
    </span>
  )
}
