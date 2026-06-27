import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: '#D24E22',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: '#D24E22',
    border: '1.5px solid #D24E22',
  },
  danger: {
    background: '#DC2626',
    color: '#fff',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: '#6b7280',
    border: '1.5px solid #e5e7eb',
  },
};

const SIZES: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: 13, borderRadius: 6 },
  md: { padding: '10px 20px', fontSize: 14, borderRadius: 8 },
  lg: { padding: '13px 28px', fontSize: 15, borderRadius: 10 },
};

const HOVER_BG: Record<ButtonVariant, string> = {
  primary: '#B8421C',
  secondary: '#FFF3EC',
  danger: '#B91C1C',
  ghost: '#f3f4f6',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: 600,
    fontFamily: 'Inter, system-ui, sans-serif',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.65 : 1,
    transition: 'background 0.15s, opacity 0.15s, transform 0.1s',
    transform: hovered && !disabled && !loading ? 'translateY(-1px)' : 'none',
    boxShadow: variant === 'primary' && hovered && !disabled
      ? '0 4px 12px rgba(210,78,34,0.3)'
      : 'none',
    width: fullWidth ? '100%' : undefined,
    whiteSpace: 'nowrap' as const,
    lineHeight: 1.4,
    ...VARIANTS[variant],
    ...SIZES[size],
    ...(hovered && !disabled && !loading
      ? { background: HOVER_BG[variant] }
      : {}),
    ...style,
  };

  return (
    <button
      style={baseStyle}
      disabled={disabled || loading}
      onMouseEnter={e => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={e => { setHovered(false); onMouseLeave?.(e); }}
      {...props}
    >
      {loading && (
        <span style={{
          display: 'inline-block',
          width: 14, height: 14,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {!loading && icon}
      {children}
    </button>
  );
}
