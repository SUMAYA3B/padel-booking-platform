export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon,
  options = [],
  as = 'input',
  rows = 3,
  hint,
}) {
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label fw-semibold small">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="input-group">
        {icon && (
          <span className="input-group-text bg-white">
            <i className={`bi ${icon} text-padel-green`}></i>
          </span>
        )}

        {as === 'select' ? (
          <select
            className="form-select"
            value={value}
            onChange={onChange}
            disabled={disabled}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            className="form-control"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
          ></textarea>
        ) : (
          <input
            type={type}
            className="form-control"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </div>

      {hint && <small className="text-muted">{hint}</small>}
    </div>
  )
}
