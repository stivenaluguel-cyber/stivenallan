import React from 'react'

export const c = {
  paper: '#F3F2EE',
  surface: '#FAFAF7',
  ink: '#161512',
  charcoal: '#131211',
  bronze: '#D24E22',
  orange: '#FF6A3D',
  muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)',
  lineDark: 'rgba(245,241,234,0.14)',
  onDark: '#F3F2EE',
  onDarkMuted: 'rgba(245,241,234,0.7)',
} as const

export const font = {
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  body: "'Hanken Grotesk', system-ui, sans-serif",
} as const

export const space = { xs: 8, sm: 14, md: 24, lg: 48, xl: 90 } as const
export const radius = { sm: 2, md: 3, lg: 4, pill: 40 } as const

export const ui = {
  btnPrimary: {
    background: '#161512',
    color: '#F3F2EE',
    padding: '14px 26px',
    borderRadius: 2,
    fontWeight: 600,
    fontSize: 15,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    letterSpacing: '0.02em',
    transition: 'background .22s ease, transform .22s ease',
  } as React.CSSProperties,
  btnConvert: {
    background: '#FF6A3D',
    color: '#131211',
    padding: '15px 28px',
    borderRadius: 2,
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    letterSpacing: '0.01em',
    transition: 'transform .22s ease, box-shadow .22s ease',
  } as React.CSSProperties,
  btnSecondary: {
    background: 'transparent',
    color: '#161512',
    border: '1px solid rgba(26,24,21,0.25)',
    padding: '14px 26px',
    borderRadius: 2,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  } as React.CSSProperties,
  card: {
    background: '#FAFAF7',
    border: '1px solid rgba(26,24,21,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  } as React.CSSProperties,
  input: {
    font: 'inherit',
    fontSize: 15,
    padding: '13px 14px',
    border: '1px solid rgba(26,24,21,0.16)',
    borderRadius: 2,
    background: '#fff',
    outline: 'none',
    width: '100%',
  } as React.CSSProperties,
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
    color: '#D24E22',
  } as React.CSSProperties,
  h2: {
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(28px,4vw,46px)',
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
    margin: '14px 0 0',
  } as React.CSSProperties,
} as const

export const brl = (n: number) => 'R$\u00a0' + Math.round(n).toLocaleString('pt-BR')
