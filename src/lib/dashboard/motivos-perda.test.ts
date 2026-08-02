import { describe, expect, it } from 'vitest'
import { agruparMotivos, SEM_MOTIVO, type EventoPerda } from './motivos-perda'

const evento = (motivo?: string, detalhe?: string, lead = 'l1'): EventoPerda => ({
  metadata: motivo === undefined && detalhe === undefined ? null : { motivo, detalhe },
  created_at: '2026-07-10T14:00:00Z',
  lead_id: lead,
})

describe('agruparMotivos', () => {
  it('ordena do maior ralo para o menor', () => {
    const { porMotivo } = agruparMotivos([
      evento('sem_retorno'), evento('orcamento_incompativel'),
      evento('sem_retorno'), evento('sem_retorno'),
    ])
    expect(porMotivo.map((m) => [m.motivo, m.total])).toEqual([
      ['sem_retorno', 3],
      ['orcamento_incompativel', 1],
    ])
  })

  it('traduz o código gravado para o rótulo do modal', () => {
    const { porMotivo } = agruparMotivos([evento('comprou_com_outro')])
    expect(porMotivo[0].label).toBe('Comprou com outro corretor')
  })

  it('percentual fecha em cima do total de eventos', () => {
    const { total, porMotivo } = agruparMotivos([
      evento('sem_retorno'), evento('sem_retorno'),
      evento('sem_interesse'), evento('outro', 'mudou de cidade'),
    ])
    expect(total).toBe(4)
    expect(porMotivo.find((m) => m.motivo === 'sem_retorno')?.pct).toBe(50)
  })

  it('evento sem motivo não é somado a "Outro"', () => {
    // "Outro" é uma escolha do corretor; ausência de motivo é falta de dado.
    // Misturar os dois inventaria uma decisão que ninguém tomou.
    const { porMotivo } = agruparMotivos([evento(), evento('outro', 'permuta')])
    const semMotivo = porMotivo.find((m) => m.motivo === SEM_MOTIVO)
    expect(semMotivo?.total).toBe(1)
    expect(semMotivo?.label).toBe('Sem motivo registrado')
    expect(porMotivo.find((m) => m.motivo === 'outro')?.total).toBe(1)
  })

  it('motivo em branco conta como não informado', () => {
    const { porMotivo } = agruparMotivos([evento('   ')])
    expect(porMotivo[0].motivo).toBe(SEM_MOTIVO)
  })

  it('guarda os detalhes escritos à mão, que é onde nasce a próxima opção da lista', () => {
    const { porMotivo } = agruparMotivos([
      evento('outro', 'queria térreo'), evento('outro', 'esperando FGTS'),
    ])
    expect(porMotivo[0].detalhes).toEqual(['queria térreo', 'esperando FGTS'])
  })

  it('lista vazia não divide por zero', () => {
    expect(agruparMotivos([])).toEqual({ total: 0, porMotivo: [] })
  })
})
