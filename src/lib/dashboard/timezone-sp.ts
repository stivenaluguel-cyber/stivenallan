// Utilitário mínimo de timezone pro Modo Foco — Brasil aboliu o horário de
// verão em 2019, então America/Sao_Paulo é UTC-3 o ano inteiro, sem
// transições. Um offset fixo aqui é correto e estável (não é atalho
// frágil): não existe hoje nenhuma data em que São Paulo seja diferente de
// -03:00. Não precisa de date-fns/luxon/Temporal pra isso.
export const SP_OFFSET = '-03:00'
const SP_OFFSET_MINUTES = -3 * 60

// "2026-07-31" + "09:00" (inputs de <input type="date">/<input
// type="time">, sempre no horário local do corretor = São Paulo) →
// timestamptz correto. Nunca usar `data + "T" + horario` puro: sem offset,
// o parser trata a string como hora local do AMBIENTE QUE RODA O CÓDIGO
// (UTC na Vercel), gerando um erro de 3h certeiro no horário salvo.
export function spLocalToISOString(data: string, horario: string): string {
  return `${data}T${horario}:00${SP_OFFSET}`
}

// "hoje (em SP) + N dias", como "YYYY-MM-DD" — não
// `new Date(Date.now()+N*86400000).toISOString().slice(0,10)`, que corta
// pelo calendário UTC e erra o dia perto da meia-noite em SP (22h de SP já
// é o dia seguinte em UTC, então "+1 dia" na prática pularia dois dias).
export function addDaysSaoPauloDateString(baseDate: Date, days: number): string {
  const deslocado = new Date(baseDate.getTime() + SP_OFFSET_MINUTES * 60_000)
  deslocado.setUTCDate(deslocado.getUTCDate() + days)
  return deslocado.toISOString().slice(0, 10)
}

export function amanhaSaoPaulo(baseDate: Date = new Date()): string {
  return addDaysSaoPauloDateString(baseDate, 1)
}

// timestamptz (qualquer instante) → "YYYY-MM-DD" no calendário de São
// Paulo — usado pra comparar "isso já passou pro corretor" sem depender do
// fuso do processo Node (Vercel roda em UTC).
export function toSaoPauloDateString(iso: string): string {
  const deslocado = new Date(new Date(iso).getTime() + SP_OFFSET_MINUTES * 60_000)
  return deslocado.toISOString().slice(0, 10)
}

// Fim do dia (23:59:59) em São Paulo, como timestamptz — usado por "Adiar"
// pra não expirar às 00:00 do dia escolhido.
export function endOfSaoPauloDayISOString(dataString: string): string {
  return `${dataString}T23:59:59${SP_OFFSET}`
}

export function formatSaoPauloDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}
