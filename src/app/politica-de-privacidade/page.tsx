import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

// Minuta preparada por IA a partir do que o código realmente faz (Meta Pixel/CAPI,
// Google Ads Enhanced Conversions, Supabase, UTMs/gclid/fbclid de sessão). NÃO é
// validação jurídica — revisar com orientação jurídica antes de publicar/atualizar
// a data de "última atualização" abaixo.

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como Stiven Allan coleta, usa e protege os dados de contato enviados pelo site — em conformidade com a LGPD.',
  alternates: { canonical: SITE_URL + '/politica-de-privacidade' },
  robots: { index: true, follow: true },
}

const C = {
  bg: '#0d0e10',
  card: '#1a1c1f',
  accent: '#c9a24b',
  muted: '#a7adb4',
  border: '#2c3035',
  text: '#f4f4f4',
}

const secoes = [
  { id: 'controlador', titulo: '1. Quem somos' },
  { id: 'dados-coletados', titulo: '2. Quais dados coletamos' },
  { id: 'finalidade', titulo: '3. Para que usamos seus dados' },
  { id: 'base-legal', titulo: '4. Base legal do tratamento' },
  { id: 'compartilhamento', titulo: '5. Com quem compartilhamos' },
  { id: 'cookies', titulo: '6. Cookies e atribuição de campanhas' },
  { id: 'retencao', titulo: '7. Por quanto tempo guardamos os dados' },
  { id: 'direitos', titulo: '8. Seus direitos como titular' },
  { id: 'seguranca', titulo: '9. Segurança da informação' },
  { id: 'alteracoes', titulo: '10. Alterações desta política' },
  { id: 'contato', titulo: '11. Fale com a gente' },
]

function Secao({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ paddingTop: 8, marginBottom: 40, scrollMarginTop: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.accent, marginBottom: 12 }}>{titulo}</h2>
      <div style={{ color: C.muted, fontSize: 15, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </section>
  )
}

export default function PoliticaDePrivacidadePage() {
  return (
    <main style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section style={{ padding: '80px 24px 40px', maxWidth: 760, margin: '0 auto' }}>
        <nav style={{ marginBottom: 40 }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: C.muted }}>
            <li><Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Início</Link></li>
            <li style={{ color: C.accent }}>&rsaquo;</li>
            <li style={{ color: C.text }}>Política de Privacidade</li>
          </ol>
        </nav>

        <p style={{ fontSize: 13, letterSpacing: '0.12em', color: C.accent, textTransform: 'uppercase', marginBottom: 16 }}>
          Última atualização: julho de 2026
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: 20, lineHeight: 1.15 }}>
          Política de Privacidade
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, marginBottom: 8 }}>
          Esta página explica, em linguagem simples, quais dados coletamos quando você entra em contato pelo
          site, para que usamos essas informações e quais direitos você tem sobre elas, conforme a Lei Geral
          de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>
      </section>

      <section style={{ padding: '0 24px', maxWidth: 760, margin: '0 auto' }}>
        <nav
          aria-label="Índice da política"
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 48 }}
        >
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>Nesta página</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, columns: '1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '6px 24px' }}>
            {secoes.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} style={{ color: C.muted, textDecoration: 'none', fontSize: 14, lineHeight: 2 }}>{s.titulo}</a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section style={{ padding: '0 24px 80px', maxWidth: 760, margin: '0 auto' }}>

        <Secao id="controlador" titulo="1. Quem somos">
          <p>
            Este site é operado por Stiven Allan, corretor de imóveis inscrito no CRECI 60.275, atuando em
            Criciúma e região Sul de Santa Catarina. Para os fins da LGPD, Stiven Allan é o controlador dos
            dados pessoais tratados através deste site — ou seja, quem decide como e por que esses dados são
            usados.
          </p>
        </Secao>

        <Secao id="dados-coletados" titulo="2. Quais dados coletamos">
          <p>Coletamos apenas o que você mesmo nos informa ao preencher um formulário de contato ou solicitar um catálogo, e alguns dados técnicos de navegação:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Nome completo</li>
            <li>Telefone/WhatsApp</li>
            <li>E-mail (quando informado — em alguns formulários é opcional)</li>
            <li>O empreendimento ou imóvel de interesse, e respostas a perguntas de qualificação (ex.: faixa de investimento, prazo para compra), quando o formulário as solicitar</li>
            <li>Página de origem do contato e, quando presentes na URL de acesso, parâmetros de campanha (UTMs, <code>gclid</code>, <code>fbclid</code>) usados para saber de qual anúncio ou canal você veio</li>
          </ul>
          <p>Não coletamos dados sensíveis (saúde, origem racial, opinião política, religião, etc.) nem dados de menores de idade.</p>
        </Secao>

        <Secao id="finalidade" titulo="3. Para que usamos seus dados">
          <p>Usamos os dados que você envia exclusivamente para:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Retornar seu contato sobre o empreendimento ou imóvel de interesse, por WhatsApp, telefone ou e-mail</li>
            <li>Enviar o material solicitado (catálogo, plantas, condições de pagamento)</li>
            <li>Entender qual campanha ou canal de divulgação gerou o contato, para investir melhor nosso orçamento de anúncios</li>
          </ul>
          <p>Não vendemos seus dados, e não os usamos para nenhuma finalidade além do atendimento comercial descrito acima.</p>
        </Secao>

        <Secao id="base-legal" titulo="4. Base legal do tratamento">
          <p>
            Quando você preenche um formulário pedindo para ser contatado, o tratamento dos seus dados se
            baseia na <strong>execução de procedimentos preliminares a pedido do titular</strong> (art. 7º,
            V, da LGPD) — isto é, você mesmo solicitou o retorno, e usamos seus dados só para atendê-lo.
          </p>
          <p>
            Para o envio de mensagens de acompanhamento comercial sobre o imóvel de interesse, o tratamento se
            apoia no <strong>legítimo interesse</strong> do controlador (art. 7º, IX), sempre limitado à
            finalidade comercial já descrita, e você pode se opor a esse contato a qualquer momento — veja a
            seção 8.
          </p>
          <p>
            Não tratamos o envio do formulário como um consentimento amplo ou obrigatório para outras
            finalidades: ele autoriza apenas o retorno sobre o assunto que você mesmo procurou.
          </p>
        </Secao>

        <Secao id="compartilhamento" titulo="5. Com quem compartilhamos">
          <p>Seus dados podem ser compartilhados com prestadores de serviço que dão suporte à operação do site e ao atendimento comercial, sempre limitados ao necessário para cada finalidade:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong>Meta (Facebook/Instagram Ads)</strong> — para medir a eficácia de campanhas. Quando aplicável, e-mail e telefone são enviados de forma criptografada (hash), nunca em texto simples.</li>
            <li><strong>Google Ads</strong> — para conversões avançadas (Enhanced Conversions), também com e-mail, telefone e nome enviados apenas na forma de hash criptográfico (SHA-256), que não pode ser revertido ao dado original.</li>
            <li><strong>Supabase</strong> — infraestrutura de banco de dados onde os contatos ficam armazenados com segurança.</li>
            <li><strong>Construtoras parceiras</strong> — quando necessário para viabilizar o atendimento sobre um empreendimento específico (por exemplo, repassar seu interesse à incorporadora responsável).</li>
          </ul>
          <p>Não compartilhamos seus dados com terceiros para fins de revenda de listas de contato.</p>
        </Secao>

        <Secao id="cookies" titulo="6. Cookies e atribuição de campanhas">
          <p>
            Quando você chega ao site a partir de um anúncio, guardamos temporariamente (na sessão do seu
            navegador) os parâmetros de origem da campanha — como <code>utm_source</code>, <code>gclid</code>
            {' '}ou <code>fbclid</code> — para associar um eventual contato seu à campanha correspondente. Esses
            dados não identificam você sozinhos e são descartados ao final da sessão de navegação.
          </p>
        </Secao>

        <Secao id="retencao" titulo="7. Por quanto tempo guardamos os dados">
          <p>
            Mantemos seus dados enquanto durar a relação comercial (do primeiro contato até a eventual compra
            e pós-venda) ou até que você solicite a exclusão, o que ocorrer primeiro. Após esse período, os
            dados são removidos ou anonimizados, salvo obrigação legal de retenção por prazo maior.
          </p>
        </Secao>

        <Secao id="direitos" titulo="8. Seus direitos como titular">
          <p>Conforme o art. 18 da LGPD, você pode a qualquer momento solicitar:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Confirmação de que tratamos seus dados, e acesso a eles</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados fora do previsto aqui</li>
            <li>Portabilidade dos dados a outro fornecedor</li>
            <li>Eliminação dos dados tratados com o seu consentimento</li>
            <li>Informação sobre com quem compartilhamos seus dados</li>
            <li>Revogação do consentimento (quando o tratamento depender dele) e oposição ao tratamento baseado em legítimo interesse</li>
          </ul>
          <p>Para exercer qualquer um desses direitos, use os canais de contato da seção 11.</p>
        </Secao>

        <Secao id="seguranca" titulo="9. Segurança da informação">
          <p>
            Adotamos medidas técnicas e administrativas razoáveis para proteger seus dados contra acesso não
            autorizado, perda, alteração ou vazamento — incluindo conexão criptografada (HTTPS), controle de
            acesso ao banco de dados e envio de identificadores sensíveis (e-mail, telefone) sempre em forma
            de hash às plataformas de anúncio.
          </p>
        </Secao>

        <Secao id="alteracoes" titulo="10. Alterações desta política">
          <p>
            Esta política pode ser atualizada para refletir mudanças no site ou na legislação. A data no topo
            desta página indica a versão vigente. Recomendamos revisitá-la periodicamente.
          </p>
        </Secao>

        <Secao id="contato" titulo="11. Fale com a gente">
          <p>Para dúvidas sobre esta política ou para exercer seus direitos como titular de dados, fale diretamente com Stiven Allan:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>WhatsApp: <a href="https://wa.me/5548991642332" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>(48) 99164-2332</a></li>
            <li>E-mail: <a href="mailto:contato@stivenallan.com.br" style={{ color: C.accent }}>contato@stivenallan.com.br</a></li>
            <li>CRECI 60.275 — Criciúma, Santa Catarina</li>
          </ul>
        </Secao>

      </section>
    </main>
  )
}
