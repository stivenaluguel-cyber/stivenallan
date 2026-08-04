'use client'

import { useEffect, useRef, useState, useId } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  passaNosFiltrosCatalogo, filtrosDaQueryString, queryStringDosFiltros, contarFiltrosAtivos,
  type FiltrosCatalogo, type OpcoesDisponiveis,
} from '@/lib/empreendimentos/filtros-catalogo'
import type { Empreendimento, StatusObra } from '@/lib/empreendimentos'
import { statusLabel } from '@/lib/empreendimentos'

const STATUS_OPCOES: StatusObra[] = ['na planta', 'em obras', 'pronto', 'entregue']

type Props = {
  cidades: string[]
  bairros: string[]
  construtoras: string[]
  statusDisponiveis: StatusObra[]
  dormitoriosDisponiveis: number[]
  totalGeral: number
  /** 'nenhuma' oculta os campos de área (nenhum resultado tem metragem
   * cadastrada); 'parcial' mostra os campos com uma nota explicando que só
   * empreendimentos com metragem cadastrada entram no filtro; 'total' mostra
   * os campos sem nota. Nunca inventamos área pra quem não tem. */
  coberturaArea: 'nenhuma' | 'parcial' | 'total'
}

const selectStyle: React.CSSProperties = {
  fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.04em',
  color: '#1A1814', border: '1px solid rgba(26,24,20,0.15)', padding: '11px 14px',
  background: '#fff', width: '100%', cursor: 'pointer', appearance: 'auto',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10,
  fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A7240', marginBottom: 6,
}

/** Lê os data-* de um card renderizado no servidor e reconstrói o suficiente pra rodar o mesmo predicado testado em filtros-catalogo.ts. */
function empreendimentoDoCard(card: HTMLElement): Empreendimento {
  const num = (v: string | undefined) => (v ? Number(v) : undefined)
  return {
    slug: card.dataset.slug || '',
    nome: card.dataset.nome || '',
    construtoraSlug: '',
    construtoraNome: card.dataset.construtora || '',
    cidade: card.dataset.cidade || '',
    bairro: card.dataset.bairro || '',
    uf: '',
    imagem: '',
    statusObra: (card.dataset.status || undefined) as StatusObra | undefined,
    dormitoriosMin: num(card.dataset.dormMin),
    dormitoriosMax: num(card.dataset.dormMax),
    areaMin: num(card.dataset.areaMin),
    areaMax: num(card.dataset.areaMax),
  }
}

export default function CatalogFilters({ cidades, bairros, construtoras, statusDisponiveis, dormitoriosDisponiveis, totalGeral, coberturaArea }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Inventário atual pra validar o que vier da URL (achado P1-4: um valor que
  // não existe mais — cidade sem imóvel, faixa de dormitórios que sumiu — não
  // pode deixar um filtro "invisível" ativo enquanto o <select> mostra
  // "Qualquer"/"Todas". Ver filtros-catalogo.ts.
  const disponiveis: OpcoesDisponiveis = { cidades, bairros, construtoras, dormitorios: dormitoriosDisponiveis }
  const [filtros, setFiltros] = useState<FiltrosCatalogo>(() => filtrosDaQueryString(searchParams, disponiveis))
  const [visiveis, setVisiveis] = useState(totalGeral)
  // Incrementado a cada "Limpar filtros" — usado como `key` nos 3 campos de
  // texto/número não controlados (busca, área mín./máx.) pra forçar o React a
  // remontá-los com o valor inicial em branco (achado P2-2: `defaultValue`
  // não some sozinho quando o estado é zerado por fora).
  const [resetKey, setResetKey] = useState(0)
  const idBusca = useId()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const acabouDeLimparRef = useRef(false)

  // Aplica os filtros nos cards já renderizados (mesmo padrão leve de
  // mostrar/esconder via DOM que o filtro anterior já usava — sem re-render
  // de imagem nenhuma) e mantém a URL em sincronia pra ficar compartilhável.
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('[data-slug]')
    let contagem = 0
    cards.forEach((card) => {
      const passa = passaNosFiltrosCatalogo(empreendimentoDoCard(card), filtros)
      card.style.display = passa ? '' : 'none'
      if (passa) contagem++
    })
    setVisiveis(contagem)
    const vazio = document.querySelector<HTMLElement>('[data-empty-state]')
    if (vazio) vazio.style.display = contagem === 0 ? '' : 'none'

    const qs = queryStringDosFiltros(filtros)
    const url = qs ? `${pathname}?${qs}` : pathname
    router.replace(url, { scroll: false })

    // Achado P2-3: o botão "Limpar filtros" some do DOM assim que os filtros
    // zeram (filtrosAtivos vira 0), levando junto o foco de quem clicou nele
    // via teclado — sem isso, o foco cai pro <body> e o usuário perde a
    // posição. Move pro contador de resultados (mesmo elemento que já
    // anuncia a contagem via aria-live), que é estável e sempre existe.
    if (acabouDeLimparRef.current) {
      acabouDeLimparRef.current = false
      statusRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  function atualizar(patch: Partial<FiltrosCatalogo>) {
    setFiltros((f) => ({ ...f, ...patch }))
  }

  function onBuscaChange(v: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => atualizar({ busca: v || undefined }), 250)
  }

  function limparFiltros() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    acabouDeLimparRef.current = true
    setFiltros({})
    setResetKey((k) => k + 1)
  }

  const filtrosAtivos = contarFiltrosAtivos(filtros)

  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          display: 'grid', gap: 14, marginBottom: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={idBusca} style={labelStyle}>Buscar por nome, bairro ou cidade</label>
          <input
            key={`busca-${resetKey}`}
            id={idBusca}
            type="search"
            placeholder="Ex.: Monte Leone, Centro, Içara..."
            defaultValue={filtros.busca || ''}
            onChange={(e) => onBuscaChange(e.target.value)}
            style={{ ...selectStyle, cursor: 'text' }}
          />
        </div>

        <div>
          <label htmlFor="filtro-cidade" style={labelStyle}>Cidade</label>
          <select
            id="filtro-cidade"
            style={selectStyle}
            value={filtros.cidades?.[0] || ''}
            onChange={(e) => atualizar({ cidades: e.target.value ? [e.target.value] : undefined })}
          >
            <option value="">Todas as cidades</option>
            {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-bairro" style={labelStyle}>Bairro</label>
          <select
            id="filtro-bairro"
            style={selectStyle}
            value={filtros.bairros?.[0] || ''}
            onChange={(e) => atualizar({ bairros: e.target.value ? [e.target.value] : undefined })}
          >
            <option value="">Todos os bairros</option>
            {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-construtora" style={labelStyle}>Construtora</label>
          <select
            id="filtro-construtora"
            style={selectStyle}
            value={filtros.construtoras?.[0] || ''}
            onChange={(e) => atualizar({ construtoras: e.target.value ? [e.target.value] : undefined })}
          >
            <option value="">Todas as construtoras</option>
            {construtoras.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-status" style={labelStyle}>Status</label>
          <select
            id="filtro-status"
            style={selectStyle}
            value={filtros.status?.[0] || ''}
            onChange={(e) => atualizar({ status: e.target.value ? [e.target.value as StatusObra] : undefined })}
          >
            <option value="">Qualquer status</option>
            {STATUS_OPCOES.filter((s) => statusDisponiveis.includes(s)).map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-dorms" style={labelStyle}>Dormitórios</label>
          <select
            id="filtro-dorms"
            style={selectStyle}
            value={filtros.dormitorios?.[0] || ''}
            onChange={(e) => atualizar({ dormitorios: e.target.value ? [Number(e.target.value)] : undefined })}
          >
            <option value="">Qualquer quantidade</option>
            {dormitoriosDisponiveis.map((n) => <option key={n} value={n}>{n} dormitório{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        {coberturaArea !== 'nenhuma' && (
          <>
            <div>
              <label htmlFor="filtro-area-min" style={labelStyle}>Área mín. (m²)</label>
              <input
                key={`area-min-${resetKey}`}
                id="filtro-area-min" type="number" min={0} inputMode="numeric" placeholder="Ex.: 60"
                defaultValue={filtros.areaMin ?? ''}
                onChange={(e) => atualizar({ areaMin: e.target.value ? Number(e.target.value) : undefined })}
                style={{ ...selectStyle, cursor: 'text' }}
              />
            </div>

            <div>
              <label htmlFor="filtro-area-max" style={labelStyle}>Área máx. (m²)</label>
              <input
                key={`area-max-${resetKey}`}
                id="filtro-area-max" type="number" min={0} inputMode="numeric" placeholder="Ex.: 200"
                defaultValue={filtros.areaMax ?? ''}
                onChange={(e) => atualizar({ areaMax: e.target.value ? Number(e.target.value) : undefined })}
                style={{ ...selectStyle, cursor: 'text' }}
              />
            </div>
          </>
        )}
      </div>

      {coberturaArea === 'parcial' && (
        <p style={{ margin: '-6px 0 16px', fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, color: '#8A7240', lineHeight: 1.5 }}>
          O filtro de área considera apenas os empreendimentos com metragem cadastrada.
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <p ref={statusRef} tabIndex={-1} role="status" aria-live="polite" style={{ margin: 0, fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 13, color: '#6B655B' }}>
          {visiveis === totalGeral
            ? `${totalGeral} empreendimento${totalGeral !== 1 ? 's' : ''}`
            : `${visiveis} de ${totalGeral} empreendimentos`}
        </p>
        {filtrosAtivos > 0 && (
          <button
            type="button"
            onClick={limparFiltros}
            style={{
              fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 12, letterSpacing: '0.06em',
              color: '#8A7240', background: 'none', border: '1px solid rgba(184,155,94,0.4)',
              padding: '8px 16px', cursor: 'pointer',
            }}
          >
            Limpar filtros ({filtrosAtivos})
          </button>
        )}
      </div>
    </div>
  )
}
