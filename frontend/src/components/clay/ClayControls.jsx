export function ClayButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  style = {}
}) {
  const variantClass = variant === 'primary'
    ? 'clay-button-primary'
    : variant === 'danger'
    ? 'clay-button-danger'
    : 'clay-button';

  return (
    <button
      type={type}
      className={`${variantClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: size === 'sm' ? '6px 14px' : size === 'lg' ? '14px 28px' : '10px 20px',
        fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function ClayInput({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  disabled = false,
  name,
  required = false,
  style = {}
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`clay-input ${className}`}
      style={style}
    />
  );
}

export function ClayTextarea({
  placeholder = '',
  value,
  onChange,
  rows = 4,
  className = '',
  disabled = false,
  name,
  required = false,
  style = {}
}) {
  return (
    <textarea
      rows={rows}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`clay-input ${className}`}
      style={{ resize: 'vertical', ...style }}
    />
  );
}

export function ClaySelect({
  options = [],
  value,
  onChange,
  className = '',
  disabled = false,
  name,
  style = {}
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`clay-input ${className}`}
      style={style}
    >
      {options.map((opt) => (
        <option key={opt.value || opt} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
  );
}
