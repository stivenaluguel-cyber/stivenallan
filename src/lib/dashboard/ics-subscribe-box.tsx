'use client'

import { useState } from 'react'

const T = { bronze: '#D24E22', ink: '#1a1a1a', mutedInk: '#71717a', border: '#e4e4e7' }

export function IcsSubscribeBox({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Assinar no Google Calendar / Calendário do Mac</div>
      <p style={{ fontSize: 12.5, color: T.mutedInk, margin: 0, lineHeight: 1.5 }}>
        Link só de leitura — as datas com roteiro aparecem como eventos de dia inteiro. Edições continuam sendo
        feitas aqui no dashboard; os apps de calendário atualizam sozinhos a cada algumas horas.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          style={{ flex: 1, padding: '8px 10px', border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 12, fontFamily: 'monospace', color: T.mutedInk, background: '#fafafa' }}
        />
        <button
          onClick={copiar}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: T.bronze, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {copiado ? 'Copiado!' : 'Copiar link'}
        </button>
      </div>
      <details style={{ fontSize: 12, color: T.mutedInk }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Como assinar</summary>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div><strong>Google Calendar:</strong> Outras agendas → + → Por URL → cole o link.</div>
          <div><strong>Calendário do Mac:</strong> Arquivo → Nova assinatura de calendário → cole o link.</div>
        </div>
      </details>
    </div>
  )
}
