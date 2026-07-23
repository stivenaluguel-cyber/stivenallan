import CrmView from './crm-view'

// Força renderização por-requisição — sem isso o Next prerenderia esta
// página UMA VEZ no build e serviria o mesmo HTML congelado pra sempre. Além
// de ser dado autenticado (não deveria ser estático/cacheável publicamente),
// qualquer estado inicial que dependa do momento real (ex. `new Date()` usado
// como valor inicial em outras telas do dashboard) diverge entre o HTML do
// build e a hidratação do visitante real — causa raiz do erro de hidratação
// React #418 relatado no dashboard.
export const dynamic = 'force-dynamic'

export default function Page() {
  return <CrmView />
}
