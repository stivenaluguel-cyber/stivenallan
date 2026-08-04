// Formatação de exibição — nada aqui é gravado no banco.

/**
 * "Cidade - UF" a partir do endereço completo do Google Places, para caber
 * na coluna Local da tabela de leads sem mostrar o endereço inteiro.
 *
 * O formattedAddress da Google no Brasil normalmente vem como
 * "Rua X, 123 - Bairro, Cidade - UF, 88888-000" — o pedaço "Cidade - UF" é
 * o trecho entre vírgulas que termina em " - " seguido de 2 letras
 * maiúsculas. Sem esse padrão reconhecível, não dá pra confiar que o
 * pedaço certo foi escolhido, então devolve o endereço cortado em vez de
 * arriscar mostrar o bairro como se fosse a cidade.
 */
export function enderecoResumido(endereco: string | null | undefined): string {
  if (!endereco) return '—'
  const partes = endereco.split(',').map((p) => p.trim())
  const cidadeUf = partes.find((p) => /^[^-]+-\s*[A-Z]{2}$/.test(p))
  if (cidadeUf) return cidadeUf
  return endereco.length > 40 ? endereco.slice(0, 40) + '…' : endereco
}
