import Link from 'next/link'

interface GuiaMetaProps {
  publishedISO: string
  publishedLabel: string
  updatedISO: string
  updatedLabel: string
  fontes?: React.ReactNode[]
}

/**
 * Bloco de autoria/data/fontes visível, exibido no topo de cada guia.
 * Datas vêm do histórico real do projeto (git), nunca inventadas — ver /imprensa.
 * Esta linha de autoria não cita CRECI (Gate B, validação oficial da situação
 * cadastral, está aberto). Isso NÃO remove outras menções de "CRECI 60.275"
 * que continuam no corpo dos guias (CTAs, rodapé) — Gate B permanece aberto
 * até validação oficial e padronização completa em todo o projeto. Ver PR #17.
 */
export default function GuiaMeta({ publishedISO, publishedLabel, updatedISO, updatedLabel, fontes = [] }: GuiaMetaProps) {
  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.10)', borderBottom: '1px solid rgba(0,0,0,0.10)', padding: '16px 0', margin: '0 0 32px', fontSize: 13, color: '#666', lineHeight: 1.8 }}>
      <p style={{ margin: 0 }}>
        Por <strong>Stiven Allan</strong> · Publicado em <time dateTime={publishedISO}>{publishedLabel}</time> · Atualizado em <time dateTime={updatedISO}>{updatedLabel}</time> ·{' '}
        <Link href="/imprensa" style={{ color: 'inherit', textDecoration: 'underline' }}>sobre o autor e política editorial</Link>
      </p>
      {fontes.length > 0 && (
        <p style={{ margin: '8px 0 0' }}>
          Fontes: {fontes.map((f, i) => (
            <span key={i}>{i > 0 && ' · '}{f}</span>
          ))}
        </p>
      )}
    </div>
  )
}
