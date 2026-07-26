// Mesma paleta usada em src/app/dashboard/crm/page.tsx — o Modo Foco precisa
// parecer nativo do dashboard, não um módulo à parte. Centralizado aqui (e
// não redeclarado em cada arquivo) só porque esta feature tem muitos
// componentes pequenos; o resto do dashboard mantém seu próprio `const D`
// local por página, convenção que não estamos alterando.
export const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
  bronze: '#D24E22', orange: '#FF6A3D', muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)', lineDark: 'rgba(245,241,234,0.14)',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6', amber: '#f59e0b',
  onDark: '#F3F2EE', onDarkMuted: 'rgba(245,241,234,0.65)',
}

export const fmt = (n: number) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')

export const TEMPERATURAS = [
  { v: 3, label: 'Quente', cor: '#ef4444', emoji: '🔥' },
  { v: 2, label: 'Morno', cor: '#f59e0b', emoji: '🌤️' },
  { v: 1, label: 'Frio', cor: '#3b82f6', emoji: '❄️' },
] as const

export const tempInfo = (t?: number | null) => TEMPERATURAS.find((x) => x.v === t) ?? TEMPERATURAS[2]
