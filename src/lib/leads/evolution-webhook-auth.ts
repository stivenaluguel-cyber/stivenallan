import { timingSafeEqual } from 'node:crypto'

// A Evolution API (evolution-api.com / github.com/EvolutionAPI) NÃO assina o
// corpo do webhook por padrão — confirmado no .env.example oficial do
// projeto: não existe nenhuma variável global de HMAC/assinatura (diferente
// do Meta, que assina com x-hub-signature-256, ver meta-leadgen-webhook.ts).
// O mecanismo real e documentado pela própria Evolution é configurar um
// header customizado nas configurações de webhook da instância — o exemplo
// oficial da documentação é exatamente "Authorization: Bearer <segredo>".
//
// CONFIGURAÇÃO NECESSÁRIA NO PAINEL DA EVOLUTION (fora deste repo, não dá
// pra automatizar daqui): em Configurações > Webhook da instância "stiven",
// no campo de headers customizados, adicionar
//   Authorization: Bearer <mesmo valor de EVOLUTION_WEBHOOK_SECRET>
// Sem isso a Evolution não manda o header, e por ser fail-closed todo
// webhook real será rejeitado (correto — melhor recusar que aceitar sem
// checar — mas o bot fica sem responder até essa configuração ser feita).
export function autenticarWebhookEvolution(params: {
  secretConfigurado: string | undefined
  authorizationHeader: string | null
}): boolean {
  const { secretConfigurado, authorizationHeader } = params
  if (!secretConfigurado) return false

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) return false
  const recebido = authorizationHeader.slice('Bearer '.length)
  if (!recebido) return false

  const esperadoBuf = Buffer.from(secretConfigurado)
  const recebidoBuf = Buffer.from(recebido)
  // Tamanhos diferentes: timingSafeEqual lançaria RangeError em vez de
  // devolver false. Comparar o length antes não reintroduz o timing leak
  // que essa função existe pra evitar — o que importa proteger é o
  // CONTEÚDO do segredo, não o seu tamanho.
  if (esperadoBuf.length !== recebidoBuf.length) return false
  return timingSafeEqual(esperadoBuf, recebidoBuf)
}
