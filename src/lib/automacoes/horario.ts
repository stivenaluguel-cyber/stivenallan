// Janela de horário permitido pra automações (WhatsApp/e-mail) — usa
// Intl.DateTimeFormat com timeZone explícito em vez de contas manuais de
// offset UTC-3, então funciona certo independente do timezone do servidor
// (Vercel roda em UTC) e não quebra se o Brasil voltar a ter horário de
// verão algum dia.

const TIMEZONE = 'America/Sao_Paulo'

function horaMinutoEm(data: Date, timeZone: string): { hora: number; minuto: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(data)
  const hora = Number(partes.find((p) => p.type === 'hour')?.value ?? '0')
  const minuto = Number(partes.find((p) => p.type === 'minute')?.value ?? '0')
  return { hora, minuto }
}

function paraMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

// horarioInicio/horarioFim no formato "HH:MM". Se fim < início, entende como
// janela que atravessa a meia-noite (ex.: 22:00–06:00).
export function dentroDoHorarioPermitido(
  agora: Date,
  horarioInicio: string,
  horarioFim: string,
  timezone: string = TIMEZONE,
): boolean {
  const { hora, minuto } = horaMinutoEm(agora, timezone)
  const agoraMin = hora * 60 + minuto
  const inicioMin = paraMinutos(horarioInicio)
  const fimMin = paraMinutos(horarioFim)

  if (inicioMin <= fimMin) {
    return agoraMin >= inicioMin && agoraMin <= fimMin
  }
  // janela atravessa meia-noite
  return agoraMin >= inicioMin || agoraMin <= fimMin
}
