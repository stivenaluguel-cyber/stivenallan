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
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
      {opcoes.map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => filtrar(op)}
          aria-pressed={ativa === op}
          className="home-region-btn"
          style={
            ativa === op
              ? { background: '#B89B5E', color: '#141210', borderColor: '#B89B5E', cursor: 'pointer' }
              : { cursor: 'pointer' }
          }
        >
          {op}
        </button>
      ))}
    </div>
  )
}
