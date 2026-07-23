import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verificarAssinaturaResend } from './resend-webhook'

const SECRET = 'whsec_' + Buffer.from('minha-chave-de-teste-32-bytes!!').toString('base64')

function assinar(svixId: string, svixTimestamp: string, rawBody: string, secret = SECRET): string {
  const semPrefixo = secret.replace(/^whsec_/, '')
  const chave = Buffer.from(semPrefixo, 'base64')
  const conteudo = `${svixId}.${svixTimestamp}.${rawBody}`
  const assinatura = createHmac('sha256', chave).update(conteudo).digest('base64')
  return `v1,${assinatura}`
}

describe('verificarAssinaturaResend', () => {
  const svixId = 'msg_123'
  const rawBody = JSON.stringify({ type: 'email.opened', data: { email_id: 'abc' } })
  const agora = 1_700_000_000

  it('aceita assinatura válida dentro da janela de tempo', () => {
    const svixTimestamp = String(agora)
    const svixSignature = assinar(svixId, svixTimestamp, rawBody)
    expect(verificarAssinaturaResend({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody, agora })).toBe(true)
  })

  it('aceita quando há múltiplas assinaturas espaço-separadas (uma válida)', () => {
    const svixTimestamp = String(agora)
    const valida = assinar(svixId, svixTimestamp, rawBody)
    const svixSignature = `v2,${Buffer.from('assinatura-de-outra-versao').toString('base64')} ${valida}`
    expect(verificarAssinaturaResend({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody, agora })).toBe(true)
  })

  it('rejeita assinatura forjada', () => {
    const svixTimestamp = String(agora)
    const svixSignature = 'v1,' + Buffer.from('lixo-nao-assinado-corretamente').toString('base64')
    expect(verificarAssinaturaResend({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody, agora })).toBe(false)
  })

  it('rejeita quando o corpo foi alterado depois de assinado', () => {
    const svixTimestamp = String(agora)
    const svixSignature = assinar(svixId, svixTimestamp, rawBody)
    expect(verificarAssinaturaResend({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody: rawBody + ' ', agora })).toBe(false)
  })

  it('rejeita timestamp fora da janela de tolerância (replay, 6min atrás)', () => {
    const svixTimestamp = String(agora - 6 * 60)
    const svixSignature = assinar(svixId, svixTimestamp, rawBody)
    expect(verificarAssinaturaResend({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody, agora })).toBe(false)
  })

  it('aceita no limite da janela de tolerância (exatos 5min)', () => {
    const svixTimestamp = String(agora - 5 * 60)
    const svixSignature = assinar(svixId, svixTimestamp, rawBody)
    expect(verificarAssinaturaResend({ secret: SECRET, svixId, svixTimestamp, svixSignature, rawBody, agora })).toBe(true)
  })

  it('rejeita timestamp não numérico sem lançar', () => {
    const svixSignature = assinar(svixId, 'abc', rawBody)
    expect(verificarAssinaturaResend({ secret: SECRET, svixId, svixTimestamp: 'abc', svixSignature, rawBody, agora })).toBe(false)
  })

  it('rejeita secret errado', () => {
    const svixTimestamp = String(agora)
    const svixSignature = assinar(svixId, svixTimestamp, rawBody)
    const outroSecret = 'whsec_' + Buffer.from('outra-chave-bem-diferente-32byt').toString('base64')
    expect(verificarAssinaturaResend({ secret: outroSecret, svixId, svixTimestamp, svixSignature, rawBody, agora })).toBe(false)
  })
})
