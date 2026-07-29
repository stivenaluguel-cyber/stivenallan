import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

// O layout raiz (src/app/layout.tsx) define `alternates: { canonical: SITE_URL }`.
// Metadata do Next é MESCLADA com a do layout, então qualquer página que não
// declare o próprio canonical herda o da home — e passa a dizer ao Google
// "este conteúdo é a página inicial".
//
// Em página `noindex` isso parecia inofensivo, mas não é: um canonical errado
// é pior que nenhum, porque mistura o sinal da própria home. Três páginas
// estavam assim (as duas LPs de tráfego pago e a do Casa Guaíba Park) —
// achado ao comparar a campanha com o master plan de aquisição.
//
// Este teste é uma guarda estrutural: página nova com noindex e sem canonical
// próprio quebra o build de testes em vez de silenciosamente herdar o errado.

function paginasComNoindex(): string[] {
  // grep é mais confiável que glob aqui: pega só os arquivos que realmente
  // declaram noindex, sem varrer a árvore inteira.
  const saida = execSync(
    "grep -rl 'index: false' src/app --include='page.tsx' || true",
    { encoding: 'utf-8' },
  )
  return saida.split('\n').map((l) => l.trim()).filter(Boolean)
}

describe('canonical em páginas noindex', () => {
  const paginas = paginasComNoindex()

  it('existe pelo menos uma página noindex para conferir', () => {
    expect(paginas.length).toBeGreaterThan(0)
  })

  it.each(paginas)('%s declara canonical próprio', (arquivo) => {
    const src = readFileSync(arquivo, 'utf-8')
    expect(
      // Sem o flag `s`: ele exige target ES2018 (o projeto está em ES2017) e
      // aqui era no-op — o padrão não usa `.`, e `[^}]*` já atravessa
      // newline por conta própria. Com o flag, `tsc --noEmit` falhava no CI.
      /alternates\s*:\s*\{[^}]*canonical/.test(src),
      `${arquivo} usa noindex mas não declara alternates.canonical — vai herdar o canonical da home pelo layout raiz`,
    ).toBe(true)
  })

  it.each(paginas)('%s não aponta canonical para a raiz do site', (arquivo) => {
    const src = readFileSync(arquivo, 'utf-8')
    const m = src.match(/canonical\s*:\s*([^,\n}]+)/)
    expect(m, `${arquivo}: canonical não encontrado`).not.toBeNull()
    const valor = (m?.[1] ?? '').trim()
    // `canonical: SITE_URL` puro = aponta para a home. Precisa ter caminho.
    expect(
      valor === 'SITE_URL' || valor === '`${SITE_URL}`',
      `${arquivo}: canonical aponta para a home (${valor})`,
    ).toBe(false)
  })
})
