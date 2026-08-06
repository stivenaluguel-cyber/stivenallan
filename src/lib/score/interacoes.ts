// Definição única de "follow-up ativo": ação humana deliberada do corretor
// pra contatar/avançar um lead — não qualquer escrita em leads_interacoes.
//
// A tabela mistura ações bem diferentes sob a mesma coluna `tipo`. Mapeado
// direto nos pontos de INSERT (ago/2026):
//   - nota            → POST /api/admin/leads/[id]/anotacoes, corretor logado. CONTA.
//   - proposta         → POST /api/admin/propostas (criação), corretor logado. CONTA.
//   - proposta_aceita  → mesma rota, ao marcar aceite — é o RESULTADO do
//                        contato que já virou 'proposta', não um contato novo.
//                        Não conta, senão a mesma proposta pontua duas vezes.
//   - simulacao        → AMBÍGUO: tanto a rota pública /api/espelho/simular
//                        (o lead mexe sozinho, sem login, sem admin_id) quanto
//                        /api/admin/simulacoes (corretor logado) gravam o
//                        mesmo tipo, e nenhuma das duas grava admin_id — não
//                        dá pra separar as duas origens pela linha. Não conta.
//   - reserva          → POST /api/espelho/reservar, rota pública, o lead
//                        reserva sozinho. Não conta.
//   - status_change     → tanto humano (Kanban, proposta) quanto automático
//                        (lib/automacoes/regras.ts via cron) — mudança de
//                        estágio em si não é "contato". Não conta.
//
// Se um novo `tipo` for adicionado a leads_interacoes, ele cai em NÃO CONTA
// por padrão (allowlist, não denylist) — mais seguro que inflar o score com
// um tipo novo sem querer.
export const TIPOS_FOLLOWUP_ATIVO = ['nota', 'proposta'] as const

export type TipoFollowUpAtivo = (typeof TIPOS_FOLLOWUP_ATIVO)[number]

export function isFollowUpAtivo(tipo: string): boolean {
  return (TIPOS_FOLLOWUP_ATIVO as readonly string[]).includes(tipo)
}
