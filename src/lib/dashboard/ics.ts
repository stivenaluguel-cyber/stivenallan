// Geração de feed .ics (RFC 5545) — usado pra assinar o calendário de
// conteúdo do Instagram no Google Calendar / Calendário do Mac via URL.
// Só formatação pura aqui; quem busca os dados é a rota da API.

export type IcsEvent = {
  id: string
  data: string // YYYY-MM-DD
  titulo: string
  descricao: string
  url: string
}

const CRLF = '\r\n'

// RFC 5545 §3.3.11: \, ; e , escapam com barra; quebra de linha vira \n literal.
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n')
}

// RFC 5545 §3.1: linhas com mais de 75 octets dobram numa linha nova iniciada por espaço.
function foldLine(line: string): string {
  const bytes = Buffer.byteLength(line, 'utf8')
  if (bytes <= 75) return line

  const out: string[] = []
  let rest = line
  let first = true
  while (Buffer.byteLength(rest, 'utf8') > (first ? 75 : 74)) {
    let cut = first ? 75 : 74
    // não cortar no meio de um caractere multi-byte
    while (Buffer.byteLength(rest.slice(0, cut), 'utf8') > (first ? 75 : 74)) cut--
    out.push((first ? '' : ' ') + rest.slice(0, cut))
    rest = rest.slice(cut)
    first = false
  }
  out.push(' ' + rest)
  return out.join(CRLF)
}

function dataToIcsDate(data: string): string {
  return data.replace(/-/g, '')
}

function proximoDia(data: string): string {
  const d = new Date(`${data}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

export function buildIcsCalendar(events: IcsEvent[], geradoEm: Date): string {
  const dtstamp = geradoEm.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Stiven Allan Imoveis//Calendario Instagram//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Instagram @stivenallan.ofc',
    'X-WR-TIMEZONE:America/Sao_Paulo',
  ]

  for (const ev of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.id}@stivenallan.com.br`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${dataToIcsDate(ev.data)}`,
      `DTEND;VALUE=DATE:${proximoDia(ev.data)}`,
      `SUMMARY:${escapeText(ev.titulo)}`,
      `DESCRIPTION:${escapeText(ev.descricao)}`,
      `URL:${ev.url}`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')

  return lines.map(foldLine).join(CRLF) + CRLF
}
