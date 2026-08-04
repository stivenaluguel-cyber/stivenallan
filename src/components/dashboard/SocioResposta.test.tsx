import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SocioResposta } from './SocioResposta'
import { ConversaPanel } from './ConversaPanel'

// Sem jsdom no projeto, então o teste renderiza pelo react-dom/server. Não
// cobre clique, mas cobre o que mais importa antes de publicar: o componente
// monta sem estourar e o ConversaPanel — que é tela existente, usada no CRM e
// em Leads — continua montando depois de receber o Sócio dentro dele.

describe('SocioResposta', () => {
  it('monta fechado, mostrando só o convite', () => {
    const html = renderToStaticMarkup(<SocioResposta leadId="lead-1" onUsar={() => {}} />)
    expect(html).toContain('Pedir 3 respostas ao Sócio')
    // Fechado não pode já despejar o formulário na tela.
    expect(html).not.toContain('Gerar 3 respostas')
  })

  it('não renderiza nada que dispare envio de WhatsApp', () => {
    const html = renderToStaticMarkup(<SocioResposta leadId="lead-1" onUsar={() => {}} />)
    expect(html.toLowerCase()).not.toContain('wa.me')
    expect(html).not.toContain('Enviar')
  })
})

describe('ConversaPanel com o Sócio dentro', () => {
  it('continua montando (estado de carregamento, sem fetch)', () => {
    const html = renderToStaticMarkup(<ConversaPanel leadId="lead-1" />)
    expect(html).toContain('Carregando conversa')
  })
})
