import type { SupabaseClient } from '@supabase/supabase-js'
import { logError, logInfo } from '@/lib/log'

// Lógica de "comentário → DM" (estilo ManyChat), portada de um template
// standalone (Deno edge function + RPCs guardadas por secret) pra rodar
// direto no webhook Next.js existente. Lá a camada de RPC existia porque a
// edge function só tinha a chave publishable; aqui o servidor já roda com a
// service role key, então as funções abaixo consultam o Supabase direto —
// sem precisar reinventar a guarda de RPC.

const GRAPH_VERSION = 'v21.0'
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`
const SOURCE = 'instagram/comment-automations'

export type DmButton = { title: string; url?: string; payload?: string }

export type Automacao = {
  id: string
  nome: string
  ativo: boolean
  media_id: string | null
  keywords: string[]
  match_type: 'any' | 'contains' | 'exact'
  only_once_per_user: boolean
  public_reply: string | null
  dm_message: string | null
  dm_buttons: DmButton[]
  require_follow: boolean
  follow_prompt: string | null
}

function matches(text: string, keywords: string[], matchType: Automacao['match_type']): boolean {
  if (matchType === 'any' || !keywords || keywords.length === 0) return true
  const t = (text ?? '').toLowerCase().trim()
  if (matchType === 'exact') return keywords.some((k) => t === k.toLowerCase().trim())
  return keywords.some((k) => t.includes(k.toLowerCase().trim()))
}

// URL pública desta função de click-tracking (ver src/app/api/instagram/click/route.ts).
function trackingBaseUrl(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.com.br'
  return `${site.replace(/\/$/, '')}/api/instagram/click`
}

function trackUrl(automationId: string, idx: number, commenterId: string, dest: string): string {
  const base = trackingBaseUrl()
  const params = new URLSearchParams({ a: automationId, i: String(idx), u: commenterId ?? '', d: dest })
  return `${base}?${params.toString()}`
}

// ctx presente => reescreve URLs de botão pro redirect de tracking (CTR).
function buildDmMessage(text: string | null, buttons: DmButton[], ctx?: { automationId: string; commenterId: string }) {
  const valid = (buttons ?? []).filter((b) => b && b.title && (b.url || b.payload)).slice(0, 3)
  if (valid.length === 0) return { text: text || ' ' }
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: (text || '').slice(0, 640) || ' ',
        buttons: valid.map((b, i) =>
          b.url
            ? { type: 'web_url', url: ctx ? trackUrl(ctx.automationId, i, ctx.commenterId, b.url) : b.url, title: String(b.title).slice(0, 20) }
            : { type: 'postback', payload: b.payload, title: String(b.title).slice(0, 20) },
        ),
      },
    },
  }
}

function buildFollowPrompt(text: string | null) {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: (text || 'Me segue primeiro pra liberar o link 🔒').slice(0, 640),
        buttons: [{ type: 'postback', title: 'Já te segui ✅', payload: 'FOLLOW_CHECK' }],
      },
    },
  }
}

async function graphPost(path: string, body: Record<string, unknown>, token: string) {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: token }),
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, body: json }
}

async function publicReply(commentId: string, message: string, token: string) {
  return graphPost(`${commentId}/replies`, { message }, token)
}

async function privateReply(igUserId: string, commentId: string, message: unknown, token: string) {
  return graphPost(`${igUserId}/messages`, { recipient: { comment_id: commentId }, message }, token)
}

async function sendDm(igUserId: string, recipientId: string, message: unknown, token: string) {
  return graphPost(`${igUserId}/messages`, { recipient: { id: recipientId }, message }, token)
}

async function checkFollow(igsid: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${GRAPH}/${igsid}?fields=is_user_follow_business&access_token=${encodeURIComponent(token)}`)
    const data = await res.json()
    return data?.is_user_follow_business === true
  } catch {
    return false
  }
}

async function buscarAutomacoesAtivas(supabase: SupabaseClient, mediaId: string): Promise<Automacao[]> {
  const { data, error } = await supabase
    .from('ig_comment_automacoes')
    .select('*')
    .eq('ativo', true)
    .or(`media_id.is.null,media_id.eq.${mediaId}`)
    .order('created_at', { ascending: true })
  if (error) {
    logError(SOURCE, 'falha ao buscar automações', error)
    return []
  }
  return (data ?? []) as Automacao[]
}

async function jaDisparouPara(supabase: SupabaseClient, automacaoId: string, commenterId: string): Promise<boolean> {
  const { count } = await supabase
    .from('ig_comment_automacao_execucoes')
    .select('id', { count: 'exact', head: true })
    .eq('automacao_id', automacaoId)
    .eq('commenter_id', commenterId)
    .in('dm_status', ['sent', 'awaiting_follow'])
  return (count ?? 0) > 0
}

async function logExecucao(supabase: SupabaseClient, row: Record<string, unknown>) {
  const { error } = await supabase.from('ig_comment_automacao_execucoes').insert(row)
  if (error) logError(SOURCE, 'falha ao logar execução', error)
}

type ComentarioMeta = {
  id: string
  text?: string
  media?: { id?: string }
  from?: { id?: string; username?: string }
}

// change.value do webhook (field === 'comments').
export async function processarComentario(
  supabase: SupabaseClient,
  igUserId: string,
  comment: ComentarioMeta,
  pageAccessToken: string,
): Promise<void> {
  const commentId = comment.id
  const text = comment.text ?? ''
  const mediaId = comment.media?.id ?? ''
  const fromId = comment.from?.id ?? ''
  const fromUsername = comment.from?.username ?? ''
  if (!fromId || fromId === igUserId) return

  const automacoes = await buscarAutomacoesAtivas(supabase, mediaId)

  for (const auto of automacoes) {
    if (!matches(text, auto.keywords ?? [], auto.match_type ?? 'contains')) continue
    if (auto.only_once_per_user && (await jaDisparouPara(supabase, auto.id, fromId))) continue

    let publicStatus = 'skipped'
    let dmStatus = 'skipped'
    let erro: string | null = null

    if (auto.public_reply) {
      const r = await publicReply(commentId, auto.public_reply, pageAccessToken)
      publicStatus = r.ok ? 'sent' : 'error'
      if (!r.ok) erro = JSON.stringify(r.body?.error ?? r.body)
    }

    const querDm = auto.dm_message || (auto.dm_buttons && auto.dm_buttons.length > 0)
    if (querDm) {
      if (auto.require_follow) {
        const segue = await checkFollow(fromId, pageAccessToken)
        if (segue) {
          const r = await privateReply(igUserId, commentId, buildDmMessage(auto.dm_message, auto.dm_buttons, { automationId: auto.id, commenterId: fromId }), pageAccessToken)
          dmStatus = r.ok ? 'sent' : 'error'
          if (!r.ok) erro = (erro ? erro + ' | ' : '') + JSON.stringify(r.body?.error ?? r.body)
        } else {
          const r = await privateReply(igUserId, commentId, buildFollowPrompt(auto.follow_prompt), pageAccessToken)
          dmStatus = r.ok ? 'awaiting_follow' : 'error'
          if (!r.ok) erro = (erro ? erro + ' | ' : '') + JSON.stringify(r.body?.error ?? r.body)
          const { error: pendErr } = await supabase
            .from('ig_comment_automacao_pendentes')
            .upsert({ automacao_id: auto.id, commenter_id: fromId }, { onConflict: 'automacao_id,commenter_id' })
          if (pendErr) logError(SOURCE, 'falha ao registrar pendente do gate', pendErr)
        }
      } else {
        const r = await privateReply(igUserId, commentId, buildDmMessage(auto.dm_message, auto.dm_buttons, { automationId: auto.id, commenterId: fromId }), pageAccessToken)
        dmStatus = r.ok ? 'sent' : 'error'
        if (!r.ok) erro = (erro ? erro + ' | ' : '') + JSON.stringify(r.body?.error ?? r.body)
      }
    }

    await logExecucao(supabase, {
      automacao_id: auto.id,
      comment_id: commentId,
      media_id: mediaId,
      commenter_id: fromId,
      commenter_username: fromUsername,
      comment_text: text,
      public_reply_status: publicStatus,
      dm_status: dmStatus,
      error: erro,
    })
    logInfo(SOURCE, 'comentário processado', { automacaoId: auto.id, fromId, publicStatus, dmStatus })
    break // só a primeira regra que bater dispara — evita spam de várias DMs pro mesmo comentário.
  }
}

// entry.messaging[].postback (payload === 'FOLLOW_CHECK') — confirma o gate
// e libera a DM que ficou pendente.
export async function processarFollowPostback(
  supabase: SupabaseClient,
  igUserId: string,
  senderId: string,
  pageAccessToken: string,
): Promise<void> {
  if (!senderId || senderId === igUserId) return

  const { data: pendentes, error } = await supabase
    .from('ig_comment_automacao_pendentes')
    .select('id, automacao_id, ig_comment_automacoes(id, dm_message, dm_buttons, follow_prompt)')
    .eq('commenter_id', senderId)
  if (error || !pendentes || pendentes.length === 0) return

  const segue = await checkFollow(senderId, pageAccessToken)

  for (const pend of pendentes) {
    const auto = (pend as unknown as { ig_comment_automacoes: Automacao | null }).ig_comment_automacoes
    if (!auto) continue

    if (segue) {
      const r = await sendDm(igUserId, senderId, buildDmMessage(auto.dm_message, auto.dm_buttons, { automationId: auto.id, commenterId: senderId }), pageAccessToken)
      await supabase.from('ig_comment_automacao_pendentes').delete().eq('id', pend.id)
      await logExecucao(supabase, {
        automacao_id: auto.id,
        commenter_id: senderId,
        comment_text: '(confirmou seguir — link liberado)',
        public_reply_status: 'skipped',
        dm_status: r.ok ? 'sent' : 'error',
        error: r.ok ? null : JSON.stringify(r.body?.error ?? r.body),
      })
    } else {
      await sendDm(igUserId, senderId, buildFollowPrompt(auto.follow_prompt || 'Ainda não te vejo seguindo 👀 me segue e toca de novo!'), pageAccessToken)
    }
  }
}

export async function registrarClique(
  supabase: SupabaseClient,
  automacaoId: string,
  buttonIndex: number,
  commenterId: string,
): Promise<void> {
  const { error } = await supabase
    .from('ig_comment_automacao_cliques')
    .insert({ automacao_id: automacaoId, button_index: buttonIndex, commenter_id: commenterId })
  if (error) logError(SOURCE, 'falha ao registrar clique', error)
}
