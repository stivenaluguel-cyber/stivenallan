// @vitest-environment happy-dom
//
// P2-2/P2-3: "Limpar filtros" precisa devolver a UI a um estado limpo de
// verdade (inputs não controlados realmente vazios, não só o estado React
// zerado por baixo) e mover o foco pra um elemento estável quando o próprio
// botão de limpar some do DOM — sem isso o foco cai pro <body> e quem usa
// teclado/leitor de tela perde a posição. Testa com DOM real (happy-dom)
// porque isso é exatamente o tipo de bug que um teste de função pura não
// pega: o React re-renderiza, mas o <input defaultValue> não "esquece"
// sozinho o que o usuário digitou.
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import CatalogFilters from './CatalogFilters'
import type { StatusObra } from '@/lib/empreendimentos'

// React rastreia o "último valor visto" de inputs controlados/não-controlados
// por dentro do próprio node (truque do value tracker) pra distinguir digitação
// real de atribuição programática — setar `.value =` direto no elemento não
// dispara o onChange do React sem passar pelo setter nativo do protótipo.
function setNativeValue(el: HTMLInputElement | HTMLSelectElement, value: string) {
  const proto = Object.getPrototypeOf(el)
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value')
  descriptor?.set?.call(el, value)
}

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const replaceMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/empreendimentos',
}))

const PROPS = {
  cidades: ['Criciúma', 'Içara'],
  bairros: ['Centro', 'Michel'],
  construtoras: ['Construtora Fontana', 'Eraldo Construções'],
  statusDisponiveis: ['na planta', 'em obras'] as StatusObra[],
  dormitoriosDisponiveis: [2, 3],
  totalGeral: 2,
}

function montarCards(container: HTMLElement) {
  container.innerHTML = `
    <div data-slug="monte-leone" data-nome="Monte Leone" data-cidade="Criciúma" data-bairro="Centro" data-construtora="Construtora Fontana" data-status="na planta" data-area-min="60" data-area-max="80" data-dorm-min="2" data-dorm-max="2"></div>
    <div data-slug="pineto" data-nome="Pineto" data-cidade="Içara" data-bairro="Michel" data-construtora="Eraldo Construções" data-status="em obras" data-area-min="90" data-area-max="120" data-dorm-min="3" data-dorm-max="3"></div>
    <div data-empty-state style="display:none"></div>
  `
}

let container: HTMLDivElement
let cardsContainer: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.useFakeTimers()
  replaceMock.mockClear()
  container = document.createElement('div')
  document.body.appendChild(container)
  cardsContainer = document.createElement('div')
  document.body.appendChild(cardsContainer)
  montarCards(cardsContainer)
})

afterEach(() => {
  act(() => root?.unmount())
  container.remove()
  cardsContainer.remove()
  vi.useRealTimers()
})

function montar() {
  act(() => {
    root = createRoot(container)
    root.render(<CatalogFilters {...PROPS} />)
  })
  // useEffect inicial roda a filtragem e cria o efeito debounced
  act(() => vi.runOnlyPendingTimers())
}

describe('CatalogFilters — Limpar filtros (P2-2/P2-3)', () => {
  it('após limpar: busca vazia, selects no padrão, área vazia, URL limpa, todos os cards voltam e o contador atualiza', () => {
    montar()

    const busca = document.querySelector('input[type="search"]') as HTMLInputElement
    const selectCidade = document.getElementById('filtro-cidade') as HTMLSelectElement
    const areaMin = document.getElementById('filtro-area-min') as HTMLInputElement
    const areaMax = document.getElementById('filtro-area-max') as HTMLInputElement

    // aplica um filtro de busca (debounced) e um select (imediato)
    act(() => {
      setNativeValue(busca, 'Monte')
      busca.dispatchEvent(new Event('input', { bubbles: true }))
    })
    act(() => vi.advanceTimersByTime(300))
    act(() => {
      setNativeValue(selectCidade, 'Içara')
      selectCidade.dispatchEvent(new Event('change', { bubbles: true }))
    })
    act(() => {
      setNativeValue(areaMin, '50')
      areaMin.dispatchEvent(new Event('input', { bubbles: true }))
    })
    act(() => {
      setNativeValue(areaMax, '200')
      areaMax.dispatchEvent(new Event('input', { bubbles: true }))
    })

    // com busca="Monte" E cidade=Içara não há card que passe nos dois filtros ao mesmo tempo
    const monteLeone = cardsContainer.querySelector('[data-slug="monte-leone"]') as HTMLElement
    const pineto = cardsContainer.querySelector('[data-slug="pineto"]') as HTMLElement
    expect(monteLeone.style.display).toBe('none')
    expect(pineto.style.display).toBe('none')

    const limpar = document.querySelector('button') as HTMLButtonElement
    expect(limpar.textContent).toContain('Limpar filtros')
    act(() => limpar.click())
    act(() => vi.runOnlyPendingTimers())

    // P2-2: inputs não controlados realmente voltam a ficar vazios/padrão
    const buscaDepois = document.querySelector('input[type="search"]') as HTMLInputElement
    const areaMinDepois = document.getElementById('filtro-area-min') as HTMLInputElement
    const areaMaxDepois = document.getElementById('filtro-area-max') as HTMLInputElement
    expect(buscaDepois.value).toBe('')
    expect(selectCidade.value).toBe('')
    expect(areaMinDepois.value).toBe('')
    expect(areaMaxDepois.value).toBe('')

    // URL volta limpa (sem querystring) — replace foi chamado só com o pathname
    const ultimaChamada = replaceMock.mock.calls.at(-1)
    expect(ultimaChamada?.[0]).toBe('/empreendimentos')

    // todos os cards reaparecem e o contador soma de novo
    expect(monteLeone.style.display).toBe('')
    expect(pineto.style.display).toBe('')
    const status = document.querySelector('[role="status"]') as HTMLElement
    expect(status.textContent).toContain('2 empreendimentos')

    // P2-3: o botão "Limpar filtros" some (filtrosAtivos voltou a 0)...
    expect(document.querySelector('button')).toBeNull()
    // ...e o foco não caiu pro <body> — foi pro contador de resultados, que é
    // estável e sempre existe.
    expect(document.activeElement).toBe(status)
  })

  it('não renderiza o botão "Limpar filtros" quando nenhum filtro está ativo', () => {
    montar()
    expect(document.querySelector('button')).toBeNull()
  })
})
