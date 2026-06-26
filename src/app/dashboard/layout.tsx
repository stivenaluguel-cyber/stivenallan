import type { ReactNode } from 'react'

export const metadata = { title: 'SA CRM | Painel Interno', description: 'Sistema CRM SA Rede de Parceiros' }

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
