import { ExternalLink, Lightbulb } from 'lucide-react'

// Mesma paleta de src/app/dashboard/page.tsx — cada página do dashboard
// mantém seu próprio `const D` local (convenção já estabelecida em
// src/components/dashboard/focus/tokens.ts).
const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
  bronze: '#D24E22', muted: '#6B655B', line: 'rgba(26,24,21,0.08)',
  amber: '#f59e0b',
}

// Deep link direto pra propriedade — sc-domain: precisa vir com o ':'
// codificado (%3A) no querystring, senão o Search Console não resolve a
// propriedade certa.
const URL_SEARCH_CONSOLE = 'https://search.google.com/search-console?resource_id=sc-domain%3Astivenallan.com.br'

const PASSOS = [
  {
    numero: 1,
    titulo: 'Desempenho',
    texto: 'Comparar cliques/impressões/CTR/posição dos últimos 7 dias vs. os 7 anteriores — ver tendência.',
  },
  {
    numero: 2,
    titulo: 'Consultas',
    texto: 'Olhar CTR por consulta nos últimos 28 dias.',
  },
  {
    numero: 3,
    titulo: 'Páginas',
    texto: 'Olhar impressão/CTR por página nos últimos 28 dias.',
  },
]

const ACHADOS = [
  'Nomes de empreendimento em italiano de uma palavra só (ex.: Tremezzo, Calliano, Pavia) tendem a CTR baixo por ambiguidade de intenção de busca — o termo também é um lugar/palavra real na Itália. Nem sempre é corrigível só com copy melhor.',
  'O relatório "Páginas" e o "Índice do Google" no Search Console são sempre históricos (dias/semanas de atraso). Só o "Teste em tempo real" na ferramenta Inspecionar URL reflete o estado atual — use para confirmar se uma correção já foi ao ar.',
]

export default function RotinaSeoPage() {
  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.muted, marginBottom: 6, fontWeight: 700 }}>
            Rotina Semanal
          </div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, margin: 0, color: D.ink }}>
            Rotina Semanal de SEO
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: D.muted, lineHeight: 1.6 }}>
            Propriedade <code style={{ background: D.line, padding: '1px 6px', borderRadius: 4, fontSize: 13 }}>sc-domain:stivenallan.com.br</code> no Google Search Console.
            Os passos 1-3 são feitos via Windsor.ai (dados) e documentados aqui como checklist; o passo 4 é ação direta no Search Console.
          </p>
        </div>

        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PASSOS.map((p) => (
              <div key={p.numero} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: D.sidebar, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 800,
                }}>
                  {p.numero}
                </span>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: D.ink, marginBottom: 2 }}>{p.titulo}</div>
                  <p style={{ margin: 0, fontSize: 13.5, color: D.muted, lineHeight: 1.55 }}>{p.texto}</p>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: D.bronze, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 800,
              }}>
                4
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: D.ink, marginBottom: 2 }}>Indexação</div>
                <p style={{ margin: '0 0 12px', fontSize: 13.5, color: D.muted, lineHeight: 1.55 }}>
                  Verificar o Índice do Google e solicitar reindexação de páginas corrigidas, direto no Search Console.
                </p>
                <a
                  href={URL_SEARCH_CONSOLE}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, background: D.bronze, color: '#fff',
                    border: 'none', borderRadius: 8, padding: '11px 20px', fontSize: 13.5, fontWeight: 700,
                    textDecoration: 'none', minHeight: 44,
                  }}
                >
                  Abrir Search Console <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFF7ED', border: '2px solid ' + D.amber, borderRadius: 12, padding: '18px 20px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Lightbulb size={18} color="#92400E" />
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#92400E' }}>
              Regra de ouro
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#78350F', lineHeight: 1.6 }}>
            CTR baixo com posição boa é problema de título/meta description, não de conteúdo. Corrija a copy antes de reescrever a página inteira.
          </p>
        </div>

        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 15, fontWeight: 700, margin: '0 0 14px', color: D.ink }}>
            Achados
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ACHADOS.map((texto, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: 5, height: 5, borderRadius: '50%', background: D.bronze, marginTop: 8 }} />
                <p style={{ margin: 0, fontSize: 13.5, color: D.ink, lineHeight: 1.6 }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
