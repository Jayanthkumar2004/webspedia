import { Star, X, AlertTriangle, Search, Sparkles } from 'lucide-react';

export function ClayBadge({ children, className = '', style = {} }) {
  return (
    <span className={`clay-badge ${className}`} style={style}>
      {children}
    </span>
  );
}

export function ClayAvatar({ src, name = 'User', size = 44, className = '', style = {} }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  return src ? (
    <img
      src={src}
      alt={name}
      className={`clay-avatar ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, ...style }}
    />
  ) : (
    <div
      className={`clay-avatar ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.4}px`, ...style }}
    >
      {initial}
    </div>
  );
}

export function ClayModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="clay-surface-elevated"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '32px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            className="clay-button"
            style={{ padding: '6px', borderRadius: '50%' }}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ClayTabs({ tabs = [], activeTab, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
      {tabs.map((tab) => {
        const id = tab.id || tab;
        const label = tab.label || tab;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`clay-pill ${isActive ? 'active' : ''}`}
            style={{
              background: isActive ? 'var(--accent-gradient)' : 'var(--clay-surface)',
              color: isActive ? '#ffffff' : 'var(--text-primary)',
              border: isActive ? 'none' : 'var(--clay-border-subtle)',
              cursor: 'pointer'
            }}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function ClaySkeleton({ width = '100%', height = '20px', style = {} }) {
  return (
    <div
      className="clay-skeleton"
      style={{ width, height, ...style }}
    />
  );
}

export function ClayEmptyState({ icon: Icon = Sparkles, title = 'No items found', message = 'Check back later or try adjusting your search parameters.' }) {
  return (
    <div className="clay-surface" style={{ padding: '60px 24px', textAlign: 'center', margin: '24px 0' }}>
      <div className="clay-avatar" style={{ margin: '0 auto 18px', width: '56px', height: '56px' }}>
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>{message}</p>
    </div>
  );
}

export function ClayErrorState({ title = 'Something went wrong', message = 'An unexpected error occurred. Please try again.', onRetry }) {
  return (
    <div className="clay-surface" style={{ padding: '48px 24px', textAlign: 'center', border: '1px solid var(--color-danger)' }}>
      <div className="clay-avatar" style={{ margin: '0 auto 16px', background: 'var(--color-danger)' }}>
        <AlertTriangle size={24} color="#ffffff" />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="clay-button clay-button-primary" type="button">
          Retry
        </button>
      )}
    </div>
  );
}

export function ClayRating({ rating = 5, showNumber = true }) {
  return (
    <div className="clay-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <Star size={13} fill="#facc15" color="#facc15" />
      {showNumber && <span>{Number(rating).toFixed(1)}</span>}
    </div>
  );
}
