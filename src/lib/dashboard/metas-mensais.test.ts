import { describe, it, expect } from 'vitest'
import type { MetasDiarias, ResumoDia } from './metas-diarias'
import {
  calcularProgressoMensal,
  competenciaDe,
  diasNoMes,
  diasUteisRestantesNoMes,
  montarCalendario,
  normalizarMetasMensais,
  type RegistroSelado,
} from './metas-mensais'

const METAS: MetasDiarias = { novos_contatos: 2, followups: 1, visitas: 0, conteudos: 0, reunioes: 0 }
const cheio: ResumoDia = { novos_contatos: 5, followups: 3, visitas: 0, conteudos: 0, reunioes: 0 }
const parcial: ResumoDia = { novos_contatos: 1, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 }
const zero: ResumoDia = { novos_contatos: 0, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 }

describe('competenciaDe e diasNoMes', () => {
  it('normaliza qualquer data para o dia 1', () => {
    expect(competenciaDe('2026-07-29')).toBe('2026-07-01')
    expect(competenciaDe('2026-07-01')).toBe('2026-07-01')
  })

  it('conta os dias do mês, inclusive fevereiro bissexto', () => {
    expect(diasNoMes('2026-07-01')).toBe(31)
    expect(diasNoMes('2026-02-01')).toBe(28)
    expect(diasNoMes('2028-02-01')).toBe(29)
  })
})

describe('normalizarMetasMensais', () => {
  it('campo ausente mantém o padrão em vez de virar zero', () => {
    // Number(null) === 0 zeraria a meta em silêncio.
    const m = normalizarMetasMensais({ meta_vgv: null, meta_vendas: undefined, meta_propostas: '' })
    expect(m).toEqual({ meta_vgv: 0, meta_vendas: 0, meta_propostas: 0 })
  })

  it('aceita valor em formato pt-BR', () => {
    expect(normalizarMetasMensais({ meta_vgv: '1.500.000,50' }).meta_vgv) .toBe(1500000.5)
  })

  it('vendas e propostas são inteiros; VGV aceita centavos', () => {
    const m = normalizarMetasMensais({ meta_vgv: 1000.75, meta_vendas: 3.9, meta_propostas: 5.2 })
    expect(m.meta_vgv).toBe(1000.75)
    expect(m.meta_vendas).toBe(3)
    expect(m.meta_propostas).toBe(5)
  })

  it('valor negativo é ignorado', () => {
    expect(normalizarMetasMensais({ meta_vendas: -5 }).meta_vendas).toBe(0)
  })
})

describe('calcularProgressoMensal', () => {
  it('meta zero some do painel em vez de aparecer como 0/0', () => {
    const p = calcularProgressoMensal(
      { meta_vgv: 1_000_000, meta_vendas: 0, meta_propostas: 0 },
      { vgv: 500_000, vendas: 1, propostas: 2 },
      '2026-07-15',
    )
    expect(p.itens).toHaveLength(1)
    expect(p.itens[0].chave).toBe('vgv')
  })

  it('percentual é limitado a 100', () => {
    const p = calcularProgressoMensal(
      { meta_vgv: 100_000, meta_vendas: 0, meta_propostas: 0 },
      { vgv: 500_000, vendas: 0, propostas: 0 },
      '2026-07-15',
    )
    expect(p.itens[0].percentual).toBe(100)
    expect(p.itens[0].cumprida).toBe(true)
  })

  it('calcula quanto falta por dia útil restante', () => {
    const p = calcularProgressoMensal(
      { meta_vgv: 1_000_000, meta_vendas: 0, meta_propostas: 0 },
      { vgv: 400_000, vendas: 0, propostas: 0 },
      '2026-07-29',
    )
    expect(p.vgvFaltante).toBe(600_000)
    expect(p.diasUteisRestantes).toBeGreaterThan(0)
    expect(p.vgvPorDiaUtil).toBe(Math.round(600_000 / p.diasUteisRestantes))
  })

  it('"no ritmo" compara com o proporcional decorrido, não com a meta cheia', () => {
    // Dia 15 de 31, com metade da meta feita: está no ritmo, ainda que a
    // barra mostre 50%.
    const p = calcularProgressoMensal(
      { meta_vgv: 1_000_000, meta_vendas: 0, meta_propostas: 0 },
      { vgv: 500_000, vendas: 0, propostas: 0 },
      '2026-07-15',
    )
    expect(p.noRitmo).toBe(true)

    const atrasado = calcularProgressoMensal(
      { meta_vgv: 1_000_000, meta_vendas: 0, meta_propostas: 0 },
      { vgv: 50_000, vendas: 0, propostas: 0 },
      '2026-07-25',
    )
    expect(atrasado.noRitmo).toBe(false)
  })

  it('sem meta de VGV nunca acusa atraso', () => {
    const p = calcularProgressoMensal(
      { meta_vgv: 0, meta_vendas: 2, meta_propostas: 0 },
      { vgv: 0, vendas: 0, propostas: 0 },
      '2026-07-29',
    )
    expect(p.noRitmo).toBe(true)
  })

  it('sem meta nenhuma o progresso geral é zero e não divide por zero', () => {
    const p = calcularProgressoMensal(
      { meta_vgv: 0, meta_vendas: 0, meta_propostas: 0 },
      { vgv: 0, vendas: 0, propostas: 0 },
      '2026-07-29',
    )
    expect(p.itens).toEqual([])
    expect(p.percentualGeral).toBe(0)
  })
})

describe('diasUteisRestantesNoMes', () => {
  it('conta apenas segunda a sexta, incluindo hoje', () => {
    // 29/07/2026 é uma quarta. Restam 29, 30, 31 (qua, qui, sex) = 3.
    expect(diasUteisRestantesNoMes('2026-07-29')).toBe(3)
  })

  it('no último dia útil resta um', () => {
    expect(diasUteisRestantesNoMes('2026-07-31')).toBe(1)
  })

  it('data inválida devolve zero em vez de NaN', () => {
    expect(diasUteisRestantesNoMes('xx')).toBe(0)
  })
})

describe('montarCalendario', () => {
  const base = { competencia: '2026-07-01', metasAtuais: METAS, selados: [] as RegistroSelado[] }

  it('gera todos os dias do mês com o offset correto da grade', () => {
    const c = montarCalendario({ ...base, hoje: '2026-07-31', resumoPorDia: {} })
    expect(c.dias).toHaveLength(31)
    // 01/07/2026 é uma quarta-feira.
    expect(c.offsetInicial).toBe(3)
  })

  it('dia futuro não é avaliado nem conta contra o corretor', () => {
    const c = montarCalendario({ ...base, hoje: '2026-07-10', resumoPorDia: {} })
    expect(c.dias.find((d) => d.dia === 20)?.status).toBe('futuro')
    expect(c.diasAvaliados).toBeLessThan(31)
  })

  it('classifica completo, parcial e zerado', () => {
    const c = montarCalendario({
      ...base,
      hoje: '2026-07-10',
      // 01, 02 e 03 de julho são qua, qui e sex.
      resumoPorDia: { '2026-07-01': cheio, '2026-07-02': parcial, '2026-07-03': zero },
    })
    expect(c.dias.find((d) => d.dia === 1)?.status).toBe('completo')
    expect(c.dias.find((d) => d.dia === 2)?.status).toBe('parcial')
    expect(c.dias.find((d) => d.dia === 3)?.status).toBe('zerado')
  })

  it('fim de semana sem atividade não é dia falhado', () => {
    // 04 e 05 de julho de 2026 são sábado e domingo.
    const c = montarCalendario({ ...base, hoje: '2026-07-10', resumoPorDia: {} })
    expect(c.dias.find((d) => d.dia === 4)?.status).toBe('fim_de_semana')
    expect(c.dias.find((d) => d.dia === 5)?.status).toBe('fim_de_semana')
  })

  it('fim de semana COM trabalho é avaliado normalmente', () => {
    const c = montarCalendario({ ...base, hoje: '2026-07-10', resumoPorDia: { '2026-07-04': cheio } })
    expect(c.dias.find((d) => d.dia === 4)?.status).toBe('completo')
  })

  it('percentual do mês é sobre os dias avaliados, não sobre 31', () => {
    const c = montarCalendario({
      ...base,
      hoje: '2026-07-03',
      resumoPorDia: { '2026-07-01': cheio, '2026-07-02': cheio, '2026-07-03': zero },
    })
    expect(c.diasAvaliados).toBe(3)
    expect(c.diasBatidos).toBe(2)
    expect(c.percentualDoMes).toBe(67)
  })
})

describe('montarCalendario — dia selado', () => {
  it('o registro selado vence o cálculo ao vivo', () => {
    // A meta atual exigiria 2 contatos e o dia teve 5 — ao vivo daria
    // "completo". Mas na época a meta era outra e o dia NÃO foi cumprido:
    // o histórico tem que preservar isso.
    const c = montarCalendario({
      competencia: '2026-07-01',
      hoje: '2026-07-10',
      metasAtuais: METAS,
      resumoPorDia: { '2026-07-01': cheio },
      selados: [{
        data: '2026-07-01', cumpridas: 1, total: 3, percentual: 40, dia_completo: false,
        metas: { novos_contatos: 20, followups: 10, visitas: 2 },
        resumo: { novos_contatos: 5, followups: 3, visitas: 0 },
      }],
    })
    const dia = c.dias.find((d) => d.dia === 1)
    expect(dia?.status).toBe('parcial')
    expect(dia?.selado).toBe(true)
    expect(dia?.detalhe.novos_contatos).toEqual({ feito: 5, meta: 20 })
  })

  it('dia sem selado usa a meta atual e fica marcado como não selado', () => {
    const c = montarCalendario({
      competencia: '2026-07-01', hoje: '2026-07-10', metasAtuais: METAS,
      resumoPorDia: { '2026-07-02': cheio }, selados: [],
    })
    const dia = c.dias.find((d) => d.dia === 2)
    expect(dia?.selado).toBe(false)
    expect(dia?.status).toBe('completo')
  })
})

describe('montarCalendario — sequências', () => {
  it('a melhor sequência é a maior corrida de dias batidos', () => {
    const c = montarCalendario({
      competencia: '2026-07-01', hoje: '2026-07-10', metasAtuais: METAS, selados: [],
      resumoPorDia: {
        '2026-07-01': cheio, '2026-07-02': cheio, '2026-07-03': zero,
        '2026-07-06': cheio, '2026-07-07': cheio, '2026-07-08': cheio,
      },
    })
    expect(c.melhorSequencia).toBe(3)
  })

  it('fim de semana sem trabalho não quebra a sequência de sexta para segunda', () => {
    // 03/07 é sexta, 04 e 05 são fim de semana, 06 é segunda.
    const c = montarCalendario({
      competencia: '2026-07-01', hoje: '2026-07-06', metasAtuais: METAS, selados: [],
      resumoPorDia: { '2026-07-03': cheio, '2026-07-06': cheio },
    })
    expect(c.melhorSequencia).toBe(2)
    expect(c.sequenciaAtual).toBe(2)
  })

  it('o dia de hoje ainda aberto não zera a sequência', () => {
    // Ontem foi batido; hoje ainda está no começo e por isso não conta contra.
    const c = montarCalendario({
      competencia: '2026-07-01', hoje: '2026-07-02', metasAtuais: METAS, selados: [],
      resumoPorDia: { '2026-07-01': cheio, '2026-07-02': zero },
    })
    expect(c.sequenciaAtual).toBe(1)
  })

  it('um dia falhado no meio zera a sequência atual', () => {
    const c = montarCalendario({
      competencia: '2026-07-01', hoje: '2026-07-03', metasAtuais: METAS, selados: [],
      resumoPorDia: { '2026-07-01': cheio, '2026-07-02': zero, '2026-07-03': cheio },
    })
    expect(c.sequenciaAtual).toBe(1)
    expect(c.melhorSequencia).toBe(1)
  })

  it('mês sem nenhum dia batido devolve zero nas duas sequências', () => {
    const c = montarCalendario({
      competencia: '2026-07-01', hoje: '2026-07-10', metasAtuais: METAS, selados: [], resumoPorDia: {},
    })
    expect(c.sequenciaAtual).toBe(0)
    expect(c.melhorSequencia).toBe(0)
  })

  it('competência inválida devolve calendário vazio em vez de quebrar', () => {
    const c = montarCalendario({
      competencia: 'xx', hoje: '2026-07-10', metasAtuais: METAS, selados: [], resumoPorDia: {},
    })
    expect(c.dias).toEqual([])
  })
})
