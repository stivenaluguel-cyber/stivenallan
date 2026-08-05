import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

// Página exigida pela Análise do App da Meta (campo "URL dos Termos de Serviço")
// para a permissão pages_messaging. Descreve apenas o que o site realmente faz —
// sem inventar dados societários (CNPJ, endereço) que não constam no repositório.
// NÃO é validação jurídica: revisar com orientação jurídica antes de tratar como
// instrumento contratual.

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Condições de uso do site stivenallan.com.br e dos canais de atendimento de Stiven Allan, corretor de imóveis.',
  alternates: { canonical: SITE_URL + '/termos-de-uso' },
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

export default function TermosDeUsoPage() {
  return (
    <main style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section style={{ padding: '80px 24px 40px', maxWidth: 760, margin: '0 auto' }}>
        <nav style={{ marginBottom: 40 }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: C.muted }}>
            <li><Link href="/" style={{ color: C.muted, textDecoration: 'none' }}>Início</Link></li>
            <li style={{ color: C.accent }}>&rsaquo;</li>
            <li style={{ color: C.text }}>Termos de Uso</li>
          </ol>
        </nav>

        <p style={{ fontSize: 13, letterSpacing: '0.12em', color: C.accent, textTransform: 'uppercase', marginBottom: 16 }}>
          Última atualização: julho de 2026
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: 20, lineHeight: 1.15 }}>
          Termos de Uso
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75 }}>
          Estas condições valem para o uso do site stivenallan.com.br e dos canais de atendimento
          associados a ele, incluindo WhatsApp e mensagens diretas no Instagram.
        </p>
      </section>

      <section style={{ padding: '0 24px 80px', maxWidth: 760, margin: '0 auto' }}>

        <Secao id="quem-opera" titulo="1. Quem opera este site">
          <p>
            O site é operado por Stiven Allan, corretor de imóveis inscrito no CRECI 60.275, atuando em
            Criciúma e região Sul de Santa Catarina. O contato oficial é o WhatsApp{' '}
            <a href="https://wa.me/5548991642332" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>(48) 99164-2332</a>.
          </p>
        </Secao>

        <Secao id="finalidade" titulo="2. Para que serve o site">
          <p>
            O site apresenta empreendimentos imobiliários de construtoras parceiras e serve como canal de
            contato para quem tem interesse em comprar. Ao enviar um formulário, iniciar conversa no WhatsApp
            ou mandar uma mensagem no Instagram, você solicita atendimento comercial sobre o imóvel de
            interesse.
          </p>
        </Secao>

        <Secao id="informacoes" titulo="3. Informações sobre imóveis">
          <p>
            Imagens são meramente ilustrativas. Metragens, plantas, acabamentos, prazos de entrega e
            condições de pagamento seguem o material oficial da construtora responsável e a tabela vigente,
            podendo ser alterados por ela a qualquer momento.
          </p>
          <p>
            Nenhuma informação publicada aqui constitui proposta comercial vinculante, reserva de unidade ou
            garantia de disponibilidade. Valores e disponibilidade devem ser confirmados no atendimento,
            antes de qualquer decisão de compra.
          </p>
        </Secao>

        <Secao id="uso" titulo="4. Uso adequado">
          <p>Ao usar o site e os canais de atendimento, você concorda em:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Informar dados verdadeiros nos formulários e nas conversas</li>
            <li>Não usar os canais para spam, ofensa, fraude ou qualquer finalidade ilícita</li>
            <li>Não tentar acessar áreas restritas, como o painel administrativo</li>
          </ul>
        </Secao>

        <Secao id="dados" titulo="5. Tratamento de dados pessoais">
          <p>
            Os dados que você envia — por formulário, WhatsApp ou Instagram Direct — são usados apenas para o
            atendimento comercial. O detalhamento está na{' '}
            <Link href="/politica-de-privacidade" style={{ color: C.accent }}>Política de Privacidade</Link>, e
            você pode pedir a remoção a qualquer momento pela página de{' '}
            <Link href="/exclusao-de-dados" style={{ color: C.accent }}>Exclusão de Dados</Link>.
          </p>
        </Secao>

        <Secao id="propriedade" titulo="6. Conteúdo e marcas">
          <p>
            Textos, layout e materiais deste site pertencem a Stiven Allan ou às construtoras parceiras que
            os forneceram. Marcas de terceiros citadas pertencem aos seus respectivos titulares e aparecem
            aqui apenas para identificar os empreendimentos divulgados.
          </p>
        </Secao>

        <Secao id="alteracoes" titulo="7. Alterações destes termos">
          <p>
            Estas condições podem ser atualizadas para refletir mudanças no site ou na legislação. A data no
            topo desta página indica a versão vigente.
          </p>
        </Secao>

      </section>
    </main>
  )
}
