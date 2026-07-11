import { describe, expect, it } from 'vitest'
import { HONEYPOT_FIELD, extractIp, isBotSubmission } from './anti-spam'

describe('isBotSubmission', () => {
  it('detects a filled honeypot as bot', () => {
    expect(isBotSubmission({ [HONEYPOT_FIELD]: 'http://spam.example.com' })).toBe(true)
  })

  it('treats empty and whitespace-only honeypot as human', () => {
    expect(isBotSubmission({ [HONEYPOT_FIELD]: '' })).toBe(false)
    expect(isBotSubmission({ [HONEYPOT_FIELD]: '   ' })).toBe(false)
    expect(isBotSubmission({ [HONEYPOT_FIELD]: '\n\t' })).toBe(false)
  })

  it('treats missing honeypot as human (backward-compat com clients antigos)', () => {
    expect(isBotSubmission({ nome: 'Ana' })).toBe(false)
    expect(isBotSubmission({})).toBe(false)
  })

  it('treats non-string honeypot as human (não confundir com botnets)', () => {
    expect(isBotSubmission({ [HONEYPOT_FIELD]: 123 })).toBe(false)
    expect(isBotSubmission({ [HONEYPOT_FIELD]: null })).toBe(false)
    expect(isBotSubmission({ [HONEYPOT_FIELD]: undefined })).toBe(false)
    expect(isBotSubmission({ [HONEYPOT_FIELD]: {} })).toBe(false)
  })

  it('is safe with non-object body', () => {
    expect(isBotSubmission(null)).toBe(false)
    expect(isBotSubmission(undefined)).toBe(false)
    expect(isBotSubmission('string')).toBe(false)
    expect(isBotSubmission(123)).toBe(false)
  })
})

function makeReq(headers: Record<string, string>) {
  return { headers: new Headers(headers) }
}

describe('extractIp', () => {
  it('returns the first IP in x-forwarded-for chain', () => {
    expect(extractIp(makeReq({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1, 172.16.0.1' }))).toBe('1.2.3.4')
  })

  it('trims whitespace around the IP', () => {
    expect(extractIp(makeReq({ 'x-forwarded-for': '  1.2.3.4  , 10.0.0.1' }))).toBe('1.2.3.4')
  })

  it('single IP in x-forwarded-for works too', () => {
    expect(extractIp(makeReq({ 'x-forwarded-for': '1.2.3.4' }))).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    expect(extractIp(makeReq({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8')
  })

  it('prefers x-forwarded-for over x-real-ip', () => {
    expect(
      extractIp(makeReq({ 'x-forwarded-for': '1.2.3.4', 'x-real-ip': '5.6.7.8' })),
    ).toBe('1.2.3.4')
  })

  it('returns "unknown" when no header is present', () => {
    expect(extractIp(makeReq({}))).toBe('unknown')
  })

  it('returns "unknown" when x-forwarded-for is empty or malformed', () => {
    expect(extractIp(makeReq({ 'x-forwarded-for': '' }))).toBe('unknown')
    expect(extractIp(makeReq({ 'x-forwarded-for': ',,,' }))).toBe('unknown')
  })
})
