import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { baixarLogo, buscarPreferencias } from '@/lib/marca-dagua/config'
import { processarFotoDoStorage } from '@/lib/marca-dagua/storage'
import { executarComLimiteConcorrencia } from '@/lib/marca-dagua/pool'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/preferencias/marca-dagua/regenerar'

// Quantas fotos processar em paralelo dentro de um lote — cada uma chama
// sharp (CPU) + 2 round-trips de Storage (baixar original, subir
// processada). 3 é conservador o bastante pra não estourar memória numa
// function serverless comum sem deixar o lote lento à toa.
const CONCORRENCIA_MAX = 3
const TAMANHO_LOTE_PADRAO = 5

/**
 * POST — reprocessa fotos existentes a partir do ORIGINAL com a logo/config
 * atual. Desenhado pra não travar a requisição: cada chamada processa só
 * um lote pequeno (paginado por `offset`/`tamanhoLote`) e devolve
 * `proximoOffset` — quem chama (a tela de preferências) repete a chamada
 * em loop até `concluido: true`, atualizando a barra de progresso a cada
 * resposta. Nenhum estado de job fica guardado no servidor entre chamadas;
 * o "progresso" é só a contagem que já passou vs. o total.
 */
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const offset = Number.isFinite(Number(body?.offset)) ? Math.max(0, Number(body.offset)) : 0
  const tamanhoLote = Number.isFinite(Number(body?.tamanhoLote)) ? Math.max(1, Math.min(20, Number(body.tamanhoLote))) : TAMANHO_LOTE_PADRAO

  const client = sb()
  const prefs = await buscarPreferencias(client, adminId)
  if (!prefs.logoPath) return NextResponse.json({ error: 'Nenhuma logo configurada ainda' }, { status: 400 })

  const logoBuffer = await baixarLogo(client, prefs.logoPath)
  if (!logoBuffer) return NextResponse.json({ error: 'Falha ao carregar a logo salva' }, { status: 500 })

  const { count: total, error: erroCount } = await client
    .from('properties_fotos')
    .select('id', { count: 'exact', head: true })
  if (erroCount) return NextResponse.json({ error: erroCount.message }, { status: 500 })

  const { data: lote, error: erroLote } = await client
    .from('properties_fotos')
    .select('id, property_id, storage_path_original, storage_path_processada')
    .order('id', { ascending: true })
    .range(offset, offset + tamanhoLote - 1)
  if (erroLote) return NextResponse.json({ error: erroLote.message }, { status: 500 })

  const resultados = await executarComLimiteConcorrencia(lote ?? [], CONCORRENCIA_MAX, async (foto) => {
    try {
      const r = await processarFotoDoStorage(client, {
        propertyId: foto.property_id,
        storagePathOriginal: foto.storage_path_original,
        storagePathProcessadaExistente: foto.storage_path_processada,
        logoBuffer,
        config: prefs,
      })
      await client
        .from('properties_fotos')
        .update({
          storage_path_processada: r.storagePathProcessada,
          largura_original: r.largura,
          altura_original: r.altura,
          processado_em: new Date().toISOString(),
        })
        .eq('id', foto.id)
      return { id: foto.id, ok: true as const }
    } catch (e) {
      logError(SOURCE, 'falha ao regenerar foto', e, { fotoId: foto.id })
      return { id: foto.id, ok: false as const, erro: e instanceof Error ? e.message : 'erro desconhecido' }
    }
  })

  const sucesso = resultados.filter((r) => r.ok).length
  const falhas = resultados.filter((r) => !r.ok)
  const processadosAteAgora = offset + (lote?.length ?? 0)
  const totalFotos = total ?? 0

  return NextResponse.json({
    processados: processadosAteAgora,
    total: totalFotos,
    sucesso,
    falhas: falhas.length,
    erros: falhas,
    proximoOffset: offset + tamanhoLote,
    concluido: processadosAteAgora >= totalFotos,
  })
}
