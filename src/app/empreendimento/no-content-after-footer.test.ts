import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

// P1-5 (revisão independente): a página do Aura Residence renderizava
// PropertyFAQ, EspelhoPublico e RelatedProperties DEPOIS de </footer> —
// conteúdo principal fora da ordem natural de leitura e da árvore de
// landmarks (o rodapé deixa de ser o último elemento, o que confunde leitores
// de tela e a ordem de rastreamento). A correção moveu os três componentes
// pra antes do rodapé; este teste é a guarda estrutural que impede essa
// regressão em qualquer página de empreendimento, atual ou futura — inclusive
// no template compartilhado dos empreendimentos da Eraldo.
//
// O botão flutuante de WhatsApp (`<a>` com ícone) é UI fixa, não conteúdo, e
// já aparece depois do rodapé em todas as páginas do site — não é o alvo
// deste teste.

function paginasDeEmpreendimentoComFooter(): string[] {
  // grep é mais confiável que glob aqui: pega só os arquivos que realmente
  // renderizam um <footer> — várias páginas da Eraldo delegam pro template
  // compartilhado e não têm footer próprio.
  const saida = execSync(
    "grep -rl '</footer>' src/app/empreendimento src/components/eraldo/EmpreendimentoTemplate.tsx --include='*.tsx' || true",
    { encoding: 'utf-8' },
  )
  return saida.split('\n').map((l) => l.trim()).filter(Boolean)
}

const COMPONENTES_DE_CONTEUDO_PRINCIPAL = ['PropertyFAQ', 'EspelhoPublico', 'RelatedProperties']

describe('nenhum conteúdo principal depois do rodapé (P1-5)', () => {
  const paginas = paginasDeEmpreendimentoComFooter()

  it('existe pelo menos uma página de empreendimento com rodapé para conferir', () => {
    expect(paginas.length).toBeGreaterThan(0)
  })

  it.each(paginas)('%s não renderiza PropertyFAQ/EspelhoPublico/RelatedProperties depois do </footer>', (arquivo) => {
    const src = readFileSync(arquivo, 'utf-8')
    const depoisDoFooter = src.slice(src.lastIndexOf('</footer>') + '</footer>'.length)
    for (const componente of COMPONENTES_DE_CONTEUDO_PRINCIPAL) {
      expect(
        depoisDoFooter.includes(`<${componente}`),
        `${arquivo}: <${componente}> aparece depois do </footer> — conteúdo principal deve vir antes do rodapé`,
      ).toBe(false)
    }
  })

  it.each(paginas)('%s não renderiza nenhuma <section> depois do </footer>', (arquivo) => {
    const src = readFileSync(arquivo, 'utf-8')
    const depoisDoFooter = src.slice(src.lastIndexOf('</footer>') + '</footer>'.length)
    expect(
      /<section\b/.test(depoisDoFooter),
      `${arquivo}: há uma <section> depois do </footer> — só chrome fixo (ex.: botão flutuante de WhatsApp) pode vir depois do rodapé`,
    ).toBe(false)
  })
})
