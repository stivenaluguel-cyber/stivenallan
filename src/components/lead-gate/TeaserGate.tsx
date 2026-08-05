'use client'
import { useLeadAccessContext } from './LeadSessionProvider'

type Props = {
  titulo: string
  descricao: string
  // Rótulo do botão. O default fala do benefício ("ver..."), não da barreira
  // ("desbloquear") — a diferença entre convite e pedágio está aqui.
  acao?: string
}

// Cartão que ocupa o lugar de um bloco ainda não liberado.
//
// Decisões deliberadas de tom, porque o risco desta feature é parecer
// chantagem e queimar a página:
//  - sem cadeado, sem blur pesado, sem contador regressivo;
//  - o título diz O QUE tem do outro lado, com o número REAL de itens
//    (calculado por subtração sobre os dados da própria página, nunca
//    inventado) — quem vê sabe se vale a pena;
//  - o texto explica que o cadastro é único e vale pros próximos
//    empreendimentos, que é a única justificativa honesta pra pedir 6 campos;
//  - o conteúdo público em volta continua inteiro. Este cartão substitui um
//    bloco extra, nunca a página.
export default function TeaserGate({ titulo, descricao, acao = 'Ver conteúdo completo' }: Props) {
  const ctx = useLeadAccessContext()

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '32px auto 0',
        padding: 'clamp(24px,4vw,36px)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        background: 'var(--surface)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(19px,2.4vw,23px)', fontWeight: 700,
          color: 'var(--ink)', margin: '0 0 10px',
          textWrap: 'balance' as React.CSSProperties['textWrap'],
        }}
      >
        {titulo}
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--muted)', margin: '0 auto 8px', maxWidth: 460 }}>
        {descricao}
      </p>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)', margin: '0 auto 22px', maxWidth: 460 }}>
        É um cadastro só, uma vez: ele vale para os materiais completos deste e dos
        próximos empreendimentos, sem preencher formulário de novo.
      </p>
      <button
        type="button"
        onClick={() => ctx.requestUnlock()}
        style={{
          minHeight: 44, padding: '12px 28px', borderRadius: 8, border: 'none',
          background: 'var(--bronze)', color: '#fff', fontWeight: 700, fontSize: 15,
          fontFamily: 'var(--font-body)', cursor: 'pointer',
        }}
      >
        {acao}
      </button>
    </div>
  )
}
