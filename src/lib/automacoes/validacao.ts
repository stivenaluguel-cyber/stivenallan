// Validação de cadência ANTES de salvar — usada tanto pelo editor
// (/dashboard/automacoes) quanto pelas rotas PUT (validação real tem que
// estar no servidor; a do cliente é só feedback imediato). Antes desta
// extração, só o array como um todo era validado (>0 itens) — um item
// individual com mensagem/assunto/corpo_html vazio passava direto, e o cron
// mandava o texto vazio pro WhatsApp/Resend do jeito que estava.

export type IntervaloInput = { ordem: number; dias: number }
export type MensagemInput = { estagio_funil: string; ordem: number; mensagem: string }
export type PassoEmailInput = { ordem: number; dias_minimos: number; assunto: string; corpo_html: string }

export function validarCadenciaWhatsapp(intervalos: IntervaloInput[], mensagens: MensagemInput[]): string[] {
  const erros: string[] = []
  if (intervalos.length === 0 || mensagens.length === 0) {
    erros.push('Intervalos e mensagens não podem ficar vazios (o cron pararia de enviar).')
    return erros
  }
  for (const i of intervalos) {
    if (!Number.isFinite(i.dias) || i.dias < 1) {
      erros.push(`Passo ${i.ordem}: intervalo precisa ser de pelo menos 1 dia.`)
    }
  }
  for (const m of mensagens) {
    if (!m.mensagem || !m.mensagem.trim()) {
      erros.push(`Mensagem ${m.ordem} de "${m.estagio_funil}" está vazia — o cron enviaria um WhatsApp em branco.`)
    }
  }
  return erros
}

export function validarCadenciaEmail(passos: PassoEmailInput[]): string[] {
  const erros: string[] = []
  if (passos.length === 0) {
    erros.push('Os passos de e-mail não podem ficar vazios (o cron pararia de enviar).')
    return erros
  }
  for (const p of passos) {
    if (!Number.isFinite(p.dias_minimos) || p.dias_minimos < 0) {
      erros.push(`Passo ${p.ordem}: dias mínimos precisa ser 0 ou mais.`)
    }
    if (!p.assunto || !p.assunto.trim()) {
      erros.push(`Passo ${p.ordem}: assunto está vazio — o cron mandaria um e-mail sem assunto.`)
    }
    if (!p.corpo_html || !p.corpo_html.trim()) {
      erros.push(`Passo ${p.ordem}: corpo do e-mail está vazio.`)
    }
  }
  return erros
}
