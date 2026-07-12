// Metas fixas do plano de growth do Instagram (baseline documentado 12/07/2026).
// Referência estática — não muda com o snapshot semanal, só quando o plano for revisado.

export type MetaLinha = {
  metrica: string
  baseline: string
  meta30: string
  meta60: string
  meta90: string
}

export const METAS_INSTAGRAM: MetaLinha[] = [
  { metrica: 'Cadência de posts', baseline: '2/mês', meta30: '8/mês (2/sem) + stories diários', meta60: '12/mês (3/sem)', meta90: '12-16/mês' },
  { metrica: 'Alcance mensal', baseline: '~20,8K', meta30: '25-30K', meta60: '35-45K', meta90: '50-60K' },
  { metrica: 'Taxa de engajamento', baseline: '1,34%', meta30: '≥1,5%', meta60: '≥1,8%', meta90: '≥2,2%' },
  { metrica: 'Novos seguidores/mês', baseline: '+26', meta30: '+100', meta60: '+150-200', meta90: '+250-300' },
  { metrica: '% novos seguidores locais', baseline: '—', meta30: '≥60%', meta60: '≥70%', meta90: '≥70%' },
  { metrica: '% seguidores locais (total)', baseline: '~9%', meta30: '~10%', meta60: '~12%', meta90: '~13-14%' },
  { metrica: 'Visitas ao perfil/dia', baseline: 'a documentar', meta30: '50/dia', meta60: '100/dia', meta90: '100/dia sustentado' },
  { metrica: 'Cliques link da bio/mês', baseline: 'a documentar', meta30: '≥30', meta60: '60-90', meta90: '100-120' },
  { metrica: 'Leads qualificados/mês', baseline: 'a documentar', meta30: '15', meta60: '30', meta90: '45-60' },
]

export const BASELINE_ENGAJAMENTO = 1.34
export const BASELINE_SEGUIDORES_LOCAIS_PCT = 9

export const TIPO_LABEL: Record<string, string> = {
  reel_educativo: 'Reel educativo',
  reel_imovel: 'Reel imóvel',
  story: 'Story',
  story_campanha: 'Story (campanha)',
}

export const STATUS_LABEL: Record<string, string> = {
  planejado: 'Planejado',
  a_gravar: 'A gravar',
  gravado: 'Gravado',
  editado: 'Editado',
  publicado: 'Publicado',
}

export const LINHA_LABEL: Record<string, string> = {
  oportunidade: 'Oportunidade',
  fontana: 'Fontana',
}
