// Tipos do conteúdo restrito, separados do módulo de dados de propósito.
//
// `conteudo-restrito.ts` é `server-only`: importar QUALQUER coisa de lá num
// Client Component derruba o bundle. Um `import type` deveria ser apagado na
// compilação, mas depender disso é frágil — basta uma configuração de
// transpilação diferente para o `server-only` acabar no chunk do cliente, e o
// sintoma é obscuro ("Cannot read properties of undefined (reading 'call')").
// Tipos aqui, dados lá: o cliente importa deste arquivo e nunca toca no outro.
export type ItemGaleria = {
  categoria?: string
  src: string
  alt: string
  label: string
  area?: number
  quartos?: number
  suites?: number
}

export type BlocoRestrito = 'plantas' | 'fotos'
