'use client'

import { useState } from 'react'

export default function RegionFilter({ cidades }: { cidades: string[] }) {
  const [ativa, setAtiva] = useState<string>('Todos')
  const opcoes = ['Todos', ...cidades]

  function filtrar(cidade: string) {
    setAtiva(cidade)
    const cards = document.querySelectorAll<HTMLElement>('[data-cidade]')
    cards.forEach((card) => {
      const c = card.getAttribute('data-cidade') || ''
      card.style.display = cidade === 'Todos' || c === cidade ? '' : 'none'
    })
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
        <select
          value={ativa}
          onChange={(e) => filtrar(e.target.value)}
          aria-label="Filtrar empreendimentos por cidade"
          className="home-region-select"
        >
          {opcoes.map((op) => (
            <option key={op} value={op}>
              {op === 'Todos' ? 'Todas as cidades' : op}
            </option>
          ))}
        </select>
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
      </div>
    </div>
  )
}
