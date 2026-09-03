export function ClayCard({ children, className = '', elevated = false, recessed = false, onClick, style = {} }) {
  const variantClass = recessed
    ? 'clay-surface-recessed'
    : elevated
    ? 'clay-surface-elevated'
    : 'clay-surface';

  return (
    <div
      className={`${variantClass} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}

export function ClaySurface({ children, className = '', variant = 'surface', style = {} }) {
  const map = {
    surface: 'clay-surface',
    elevated: 'clay-surface-elevated',
    recessed: 'clay-surface-recessed',
    raised: 'clay-raised',
    inset: 'clay-inset'
  };

  return (
    <div className={`${map[variant] || 'clay-surface'} ${className}`} style={style}>
      {children}
    </div>
  );
}
