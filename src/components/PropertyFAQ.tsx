type FaqItem = { pergunta: string; resposta: string }

// Server component de propósito (não tem mais 'use client'/useState).
//
// A versão anterior renderizava a resposta com `{open === i && <p>…}`, e `open`
// começava em null — ou seja, NENHUMA resposta existia no HTML entregue pelo
// servidor, só a pergunta. Isso quebrava duas coisas ao mesmo tempo:
//
// 1. O JSON-LD FAQPage declarava um texto que não estava visível na página, o
//    que contraria a política de rich results do Google.
// 2. Rastreadores de IA que não executam JavaScript viam perguntas sem
//    nenhuma resposta — justamente o conteúdo que faz a página ser citada.
//
// <details>/<summary> resolve os dois: o navegador mantém o conteúdo fechado no
// DOM (só escondido via CSS), então ele sai no HTML servido e continua sendo um
// acordeão acessível por teclado, sem JavaScript nenhum.
export function PropertyFAQ({ items, accent = '#18181b' }: { items: FaqItem[]; accent?: string }) {
  if (!items.length) return null
  return (
    <section style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 20px' }}>
      <style>{`
        .pfaq-item > summary { list-style: none; }
        .pfaq-item > summary::-webkit-details-marker { display: none; }
        .pfaq-item > summary { cursor: pointer; padding: 18px 8px; font-size: 15px; font-weight: 600; color: #18181b; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .pfaq-icon { font-size: 18px; flex-shrink: 0; }
        .pfaq-icon::after { content: '+'; }
        .pfaq-item[open] .pfaq-icon::after { content: '−'; }
      `}</style>
      <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '28px', color: '#18181b' }}>
        Perguntas frequentes
      </h2>
      {items.map((item, i) => (
        <details key={i} className="pfaq-item" open={i === 0} style={{ borderBottom: '1px solid #e4e4e7' }}>
          <summary>
            {item.pergunta}
            <span className="pfaq-icon" style={{ color: accent }} aria-hidden="true" />
          </summary>
          <p style={{ padding: '0 8px 18px', fontSize: '14px', lineHeight: 1.7, color: '#52525b', margin: 0 }}>
            {item.resposta}
          </p>
        </details>
      ))}
    </section>
  )
}

export default PropertyFAQ
