import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

// Página exigida pela Análise do App da Meta (campo "Instruções de exclusão de
// dados do usuário") para a permissão pages_messaging. O conteúdo descreve o que
// o sistema realmente armazena — leads e interações no Supabase, incluindo
// mensagens recebidas pelo Instagram Direct. NÃO é validação jurídica: o prazo
// de atendimento declarado aqui (15 dias, espelhando o art. 19 da LGPD para
// pedidos de acesso) deve ser revisado com orientação jurídica.

export const metadata: Metadata = {
  title: 'Exclusão de Dados',
  description: 'Como solicitar a exclusão dos seus dados pessoais tratados por Stiven Allan — incluindo mensagens enviadas pelo Instagram Direct.',
  alternates: { canonical: SITE_URL + '/exclusao-de-dados' },
  robots: { index: true, follow: true },
}

const C = {
  bg: '#0d0e10',
  card: '#1a1c1f',
  accent: '#D24E22',
  muted: '#a7adb4',
  border: '#2c3035',
  text: '#f4f4f4',
}

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

const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20solicitar%20a%20exclus%C3%A3o%20dos%20meus%20dados.'

export default function ExclusaoDeDadosPage() {
  return (
    <main style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section style={{ padding: '80px 24px 40px', maxWidth: 760, margin: '0 auto' }}>
        <nav style={{ marginBottom: 40 }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: C.muted }}>
            <li><Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Início</Link></li>
            <li style={{ color: C.accent }}>&rsaquo;</li>
            <li style={{ color: C.text }}>Exclusão de Dados</li>
          </ol>
        </nav>

        <p style={{ fontSize: 13, letterSpacing: '0.12em', color: C.accent, textTransform: 'uppercase', marginBottom: 16 }}>
          Última atualização: julho de 2026
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: 20, lineHeight: 1.15 }}>
          Exclusão de Dados
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75 }}>
          Você pode solicitar, a qualquer momento e sem custo, a exclusão dos dados pessoais que tratamos
          sobre você — inclusive das mensagens que você tenha enviado ao nosso perfil no Instagram. Esta
          página explica como pedir e o que acontece depois.
        </p>
      </section>

      <section style={{ padding: '0 24px 80px', maxWidth: 760, margin: '0 auto' }}>

        <Secao id="como-solicitar" titulo="1. Como solicitar">
          <p>
            Envie a solicitação pelo WhatsApp <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>(48) 99164-2332</a>,
            informando:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Seu nome</li>
            <li>O telefone, e-mail ou <strong>@ do Instagram</strong> que você usou para entrar em contato conosco</li>
            <li>Que se trata de um pedido de exclusão de dados</li>
          </ul>
          <p>
            Precisamos desses dados apenas para localizar o registro correto e confirmar que a solicitação
            parte do próprio titular — não pedimos nenhum documento nem informação adicional.
          </p>
        </Secao>

        <Secao id="o-que-e-excluido" titulo="2. O que é excluído">
          <p>Ao confirmarmos a solicitação, removemos do nosso banco de dados:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Seu cadastro de contato (nome, telefone/WhatsApp, e-mail, imóvel de interesse e respostas de qualificação)</li>
            <li>O histórico de atendimento associado a você, incluindo as <strong>mensagens recebidas pelo Instagram Direct</strong>, o identificador da sua conta no Instagram e o seu nome de usuário</li>
            <li>Os registros de origem de campanha vinculados ao seu contato</li>
          </ul>
          <p>
            A exclusão é definitiva: os dados não ficam em cópia ativa nem são reaproveitados para
            atendimento ou publicidade.
          </p>
        </Secao>

        <Secao id="prazo" titulo="3. Prazo">
          <p>
            Atendemos as solicitações em até <strong>15 dias corridos</strong> a partir do recebimento, e
            confirmamos pelo mesmo canal quando a exclusão for concluída.
          </p>
        </Secao>

        <Secao id="limites" titulo="4. O que pode permanecer">
          <p>
            Podemos manter apenas o mínimo necessário quando houver obrigação legal ou regulatória de
            retenção, ou para o exercício regular de direitos em processo — hipóteses previstas no art. 16 da
            LGPD. Nesses casos, os dados ficam bloqueados para qualquer outra finalidade.
          </p>
          <p>
            A exclusão dos dados no nosso sistema não apaga a conversa da sua própria caixa de mensagens do
            Instagram, que é controlada por você e pela Meta. Para remover o histórico do lado do Instagram,
            use as ferramentas do próprio aplicativo.
          </p>
        </Secao>

        <Secao id="outros-direitos" titulo="5. Outros direitos">
          <p>
            Além da exclusão, você pode pedir acesso, correção, portabilidade e informação sobre
            compartilhamento dos seus dados. Todos os direitos e as bases legais do tratamento estão
            descritos na{' '}
            <Link href="/politica-de-privacidade" style={{ color: C.accent }}>Política de Privacidade</Link>.
          </p>
        </Secao>

      </section>
    </main>
  )
}
