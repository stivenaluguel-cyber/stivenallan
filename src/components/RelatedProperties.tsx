import Link from 'next/link'
import { imoveis } from '@/data/imoveis'
import FormContato from '@/app/empreendimento/[construtora]/[slug]/FormContato'
import CtaFixoEmpreendimento from '@/components/CtaFixoEmpreendimento'
import LeadAccessGate from '@/components/lead-gate/LeadAccessGate'
import PropertyInterestTracker from '@/components/lead-gate/PropertyInterestTracker'
import { isLeadGateEnabledForSlug, isPropertyHistoryEnabledForSlug } from '@/lib/lead-gate/flags'
import { createClient } from '@supabase/supabase-js'

type Props = {
  atualSlug: string
  cidade: string
  nomeAtual?: string
  propertyIdAtual?: string | null
  // Quem já tem o próprio formulário na página passa `true` — sem isso a
  // página fica com dois FormContato idênticos a uma dobra de distância.
  semFormulario?: boolean
  // Só usado quando o slug está em LEAD_GATE_SLUGS — contagem REAL de fotos/
  // plantas da própria página (nunca inventar número). Páginas fora do piloto
  // não precisam passar isso.
  previewCount?: { fotos: number; plantas: number }
}

export async function RelatedProperties({ atualSlug, cidade, nomeAtual, propertyIdAtual, semFormulario, previewCount }: Props) {
  const atual = imoveis.find((i) => i.slug === atualSlug)
  const nomeEncontrado = atual?.nome ?? nomeAtual
  const nome = semFormulario ? undefined : nomeEncontrado

  const gateEnabled = !semFormulario && isLeadGateEnabledForSlug(atualSlug)
  const historyEnabled = isPropertyHistoryEnabledForSlug(atualSlug)

  // property_id nunca chegava aqui em 35 das 36 páginas hoje (cada uma passa
  // null) — resolvido por slug quando ausente. Isso beneficia a atribuição do
  // FormContato legado também, não só o gate novo (properties tem SELECT
  // público via RLS, seguro consultar aqui).
  //
  // Client ANÔNIMO direto (não @/lib/supabase/server): aquele helper chama
  // cookies() de next/headers, e qualquer uso de cookies() numa árvore de
  // Server Component tira a página inteira do cache estático/ISR — as 36
  // páginas de empreendimento são `revalidate = 3600` de propósito. Essa
  // consulta é um SELECT público em `properties`, não precisa de sessão
  // nenhuma, então usa o client "puro" pra não regredir o cache.
  let propertyId = propertyIdAtual ?? null
  if (!propertyId && (nome || gateEnabled)) {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false },
        // `next: { revalidate }` no fetch do supabase-js é obrigatório aqui, não
        // otimização. No Next 15 um fetch NÃO cacheado dentro de Server
        // Component tira a rota do prerender — e como isso depende de o
        // prerender conseguir concluir a ida à rede, o resultado passa a variar
        // por LATÊNCIA. Medido: dois builds limpos do mesmo commit deram 8 e 28
        // páginas de empreendimento dinâmicas (o conjunto maior era
        // superconjunto estrito do menor — assinatura de bailout por tempo, não
        // de diferença de código).
        //
        // Consequência sem isto: cada deploy sorteia quais das 36 páginas saem
        // estáticas, o que muda TTFB, custo de função e o que o crawler recebe,
        // sem nenhum aviso no log do build. origin/main não tinha esse risco —
        // lá RelatedProperties é síncrono e não faz I/O nenhum; a chamada de
        // rede foi introduzida por esta branch.
        //
        // 3600 casa com o `export const revalidate = 3600` das páginas: o id do
        // empreendimento por slug é dado praticamente imutável, então nem
        // precisaria de janela tão curta.
        global: {
          fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 3600 } }),
        },
      })
      const { data } = await supabase.from('properties').select('id').eq('slug', atualSlug).maybeSingle()
      propertyId = data?.id ?? null
    } catch {
      // Falha na consulta não pode derrubar a página — segue sem property_id, como hoje.
    }
  }

  const ativos = imoveis.filter((i) => i.ativo === true && i.slug !== atualSlug)
  const mesmaCidade = ativos.filter((i) => i.cidade === cidade)
  const outras = ativos.filter((i) => i.cidade !== cidade)
  const selecionados = [...mesmaCidade, ...outras].slice(0, 3)

  if (!nome && !selecionados.length) return null

  const gateAtivoComId = gateEnabled && !!propertyId

  return (
    <>
      {gateAtivoComId && (
        <>
          <PropertyInterestTracker propertyId={propertyId!} propertySlug={atualSlug} gateEnabled={gateEnabled} historyEnabled={historyEnabled} />
          <LeadAccessGate
            propertyId={propertyId!} propertySlug={atualSlug} propertyName={nome!}
            gateEnabled={gateEnabled} variant="early-inline"
            previewCount={previewCount ?? { fotos: 0, plantas: 0 }}
          />
        </>
      )}
      {/* Este componente é o único ponto por onde os 36 hotsites de
          empreendimento renderizam formulário — trocar a barra aqui alcança
          todos eles sem editar 36 arquivos. A antiga MobileInterestBar era
          mobile-only e cobria o botão flutuante de WhatsApp. */}
      {nome && <CtaFixoEmpreendimento nome={nome} slug={atualSlug} />}
      {nome && gateAtivoComId ? (
        <LeadAccessGate
          propertyId={propertyId!} propertySlug={atualSlug} propertyName={nome}
          gateEnabled={gateEnabled} variant="section-bottom"
          previewCount={previewCount ?? { fotos: 0, plantas: 0 }}
        />
      ) : nome ? (
        <section id="contato" style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 20px 16px', scrollMarginTop: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '8px', color: '#18181b' }}>
            Tenho interesse
          </h2>
          <p style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', margin: '0 0 28px' }}>
            Receba as condições e plantas do {nome} direto com o Stiven.
          </p>
          <FormContato empreendimento={nome} propertyId={propertyId} propertySlug={atualSlug} />
        </section>
      ) : null}

      {selecionados.length > 0 && (
        <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '48px 20px 64px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '32px', color: '#18181b' }}>
            Você também pode gostar
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {selecionados.map((imovel) => (
              <Link
                key={imovel.slug}
                href={`/empreendimento/${imovel.construtora_slug}/${imovel.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e4e4e7', background: '#fff' }}
              >
                {imovel.img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imovel.img}
                    alt={`Fachada do ${imovel.nome}`}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                  />
                )}
                <div style={{ padding: '16px 18px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: '#18181b' }}>{imovel.nome}</h3>
                  <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
                    {imovel.cidade}/{imovel.uf}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export default RelatedProperties
