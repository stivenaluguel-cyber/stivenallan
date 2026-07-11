import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { logError, logInfo, logWarn } from './log'

type Parsed = {
  level: string
  source: string
  message: string
  ts: string
  error?: { message: string; stack?: string } | string
  [k: string]: unknown
}

function parseLastCall(spy: ReturnType<typeof vi.spyOn>): Parsed {
  const raw = spy.mock.calls[spy.mock.calls.length - 1][0] as string
  return JSON.parse(raw)
}

describe('logInfo', () => {
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    logSpy.mockRestore()
  })

  it('emite JSON com level, source, message, ts', () => {
    logInfo('src', 'algo aconteceu')
    expect(logSpy).toHaveBeenCalledTimes(1)
    const parsed = parseLastCall(logSpy)
    expect(parsed.level).toBe('info')
    expect(parsed.source).toBe('src')
    expect(parsed.message).toBe('algo aconteceu')
    expect(parsed.ts).toBe('2026-01-01T12:00:00.000Z')
  })

  it('inclui campos de contexto no JSON', () => {
    logInfo('cron', 'run summary', { processados: 5, enviados: 3 })
    const parsed = parseLastCall(logSpy)
    expect(parsed.processados).toBe(5)
    expect(parsed.enviados).toBe(3)
  })

  it('sem contexto, JSON não tem chaves extras', () => {
    logInfo('src', 'msg')
    const parsed = parseLastCall(logSpy)
    // Só as 4 chaves reservadas
    expect(Object.keys(parsed).sort()).toEqual(['level', 'message', 'source', 'ts'])
  })

  it('contexto NÃO consegue sobrescrever campos reservados', () => {
    logInfo('src', 'msg', { level: 'error', source: 'hijack', ts: 'fake' } as never)
    const parsed = parseLastCall(logSpy)
    expect(parsed.level).toBe('info')
    expect(parsed.source).toBe('src')
    expect(parsed.ts).toBe('2026-01-01T12:00:00.000Z')
  })
})

describe('logWarn', () => {
  it('escreve em console.warn com level warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    logWarn('src', 'atenção', { key: 'value' })
    const parsed = parseLastCall(warnSpy)
    expect(parsed.level).toBe('warn')
    expect(parsed.key).toBe('value')
    warnSpy.mockRestore()
  })
})

describe('logError', () => {
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errSpy.mockRestore()
  })

  it('escreve em console.error com level error', () => {
    logError('src', 'falhou')
    const parsed = parseLastCall(errSpy)
    expect(parsed.level).toBe('error')
  })

  it('normaliza Error com message + stack', () => {
    const boom = new Error('boom')
    logError('src', 'exception', boom)
    const parsed = parseLastCall(errSpy)
    expect(typeof parsed.error).toBe('object')
    expect((parsed.error as { message: string }).message).toBe('boom')
    expect((parsed.error as { stack?: string }).stack).toContain('log.test.ts')
  })

  it('normaliza string como error', () => {
    logError('src', 'msg', 'raw string reason')
    const parsed = parseLastCall(errSpy)
    expect(parsed.error).toBe('raw string reason')
  })

  it('sem error, JSON não tem chave error', () => {
    logError('src', 'msg', undefined, { leadId: 'abc' })
    const parsed = parseLastCall(errSpy)
    expect('error' in parsed).toBe(false)
    expect(parsed.leadId).toBe('abc')
  })

  it('null como error é tratado como ausente', () => {
    logError('src', 'msg', null)
    const parsed = parseLastCall(errSpy)
    expect('error' in parsed).toBe(false)
  })

  it('objeto plain (ex: erro Supabase) é preservado como shape JSON', () => {
    logError('src', 'msg', { code: 'PGRST204', message: 'column x missing' })
    const parsed = parseLastCall(errSpy)
    expect(parsed.error).toEqual({ code: 'PGRST204', message: 'column x missing' })
  })
})
