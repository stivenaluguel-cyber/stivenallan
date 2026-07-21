'use client'

import { useState } from 'react'

function SelectArrow() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    >
      <path d="M6 9l6 6 6-6" stroke="#B89B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function RegionFilter({ cidades, construtoras }: { cidades: string[]; construtoras: string[] }) {
  const [cidadeAtiva, setCidadeAtiva] = useState<string>('Todos')
  const [construtoraAtiva, setConstrutoraAtiva] = useState<string>('Todos')

  const opcoesCidade = ['Todos', ...cidades]
  const opcoesConstrutora = ['Todos', ...construtoras]

  function aplicar(cidade: string, construtora: string) {
    const cards = document.querySelectorAll<HTMLElement>('[data-cidade]')
    let visiveis = 0
    cards.forEach((card) => {
      const c = card.getAttribute('data-cidade') || ''
      const k = card.getAttribute('data-construtora') || ''
      const combina = (cidade === 'Todos' || c === cidade) && (construtora === 'Todos' || k === construtora)
      card.style.display = combina ? '' : 'none'
      if (combina) visiveis++
    })
    const vazio = document.querySelector<HTMLElement>('[data-empty-state]')
    if (vazio) vazio.style.display = visiveis === 0 ? '' : 'none'
  }

  function filtrarCidade(cidade: string) {
    setCidadeAtiva(cidade)
    aplicar(cidade, construtoraAtiva)
  }

  function filtrarConstrutora(construtora: string) {
    setConstrutoraAtiva(construtora)
    aplicar(cidadeAtiva, construtora)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 280, flex: '1 1 220px' }}>
        <select
          value={cidadeAtiva}
          onChange={(e) => filtrarCidade(e.target.value)}
          aria-label="Filtrar empreendimentos por cidade"
          className="cat-region-select"
        >
          {opcoesCidade.map((op) => (
            <option key={op} value={op}>
              {op === 'Todos' ? 'Todas as cidades' : op}
            </option>
          ))}
        </select>
        <SelectArrow />
      </div>
      <div style={{ position: 'relative', width: '100%', maxWidth: 280, flex: '1 1 220px' }}>
        <select
          value={construtoraAtiva}
          onChange={(e) => filtrarConstrutora(e.target.value)}
          aria-label="Filtrar empreendimentos por construtora"
          className="cat-region-select"
        >
          {opcoesConstrutora.map((op) => (
            <option key={op} value={op}>
              {op === 'Todos' ? 'Todas as construtoras' : op}
            </option>
          ))}
        </select>
        <SelectArrow />
      </div>
    </div>
  )
}
