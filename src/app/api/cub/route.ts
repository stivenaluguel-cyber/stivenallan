// API Route: GET /api/cub
// Lógica de scraping/fallback vive em src/lib/cub-sinduscon.ts (compartilhada
// com a página pública /indicadores, que chama buscarCub() direto — sem hop
// HTTP interno).

import { NextResponse } from 'next/server'
import { buscarCub } from '@/lib/cub-sinduscon'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const dados = await buscarCub()
  return NextResponse.json(dados)
}
