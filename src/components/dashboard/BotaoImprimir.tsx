'use client'
import { useCallback, useState } from 'react'
import { Printer } from 'lucide-react'

/**
 * Exporta um pedaço da tela em PDF pela impressão do navegador.
 *
 * Não entra biblioteca de PDF no bundle por isso: jsPDF e companhia pesam
 * centenas de kB, redesenham a tabela num canvas (perdendo texto
 * selecionável e acentuação em alguns casos) e desafinam do layout real toda
 * vez que a tela muda. "Salvar como PDF" é o destino padrão do diálogo de
 * impressão em macOS, Windows, Android e iOS — o navegador já sabe fazer
 * isso, e o resultado é o próprio HTML, com texto de verdade.
 *
 * O CSS é gerado no clique porque o seletor depende do id do bloco pedido.
 * Regra fixa no arquivo global cobriria só um alvo.
 */

const D = { ink: '#161512', muted: '#6B655B', line: 'rgba(26,24,21,0.12)' }

export function BotaoImprimir({ alvo, rotulo = 'Salvar PDF' }: { alvo: string; rotulo?: string }) {
  const [ocupado, setOcupado] = useState(false)

  const imprimir = useCallback(() => {
    if (typeof window === 'undefined') return
    setOcupado(true)

    const estilo = document.createElement('style')
    estilo.dataset.impressaoAlvo = alvo
    estilo.textContent = `
      @media print {
        /* visibility em vez de display: esconder os ancestrais com display
           tiraria o alvo junto, porque ele está dentro deles. */
        body * { visibility: hidden !important; }
        #${alvo}, #${alvo} * { visibility: visible !important; }
        #${alvo} {
          position: absolute !important; left: 0 !important; top: 0 !important;
          width: 100% !important; margin: 0 !important; border: none !important;
          box-shadow: none !important; background: #fff !important;
        }
        /* Controles não vão para o papel: seletor de ano, botões, filtros. */
        .sem-impressao, .sem-impressao * { display: none !important; }
        /* Cortar uma linha de tabela ao meio deixa o número em duas páginas. */
        tr, li { break-inside: avoid; }
        thead { display: table-header-group; }
        @page { margin: 14mm; }
      }
    `
    document.head.appendChild(estilo)

    const limpar = () => {
      estilo.remove()
      setOcupado(false)
      window.removeEventListener('afterprint', limpar)
    }
    window.addEventListener('afterprint', limpar)

    window.print()
    // Rede de segurança: em alguns navegadores móveis o afterprint não
    // dispara, e sem isto o estilo ficaria grudado para sempre.
    window.setTimeout(limpar, 60_000)
  }, [alvo])

  return (
    <button type="button" onClick={imprimir} disabled={ocupado}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff',
        border: '1px solid ' + D.line, borderRadius: 8, padding: '8px 12px',
        fontSize: 12.5, fontWeight: 700, color: D.ink, cursor: ocupado ? 'default' : 'pointer',
        minHeight: 40, opacity: ocupado ? 0.6 : 1,
      }}>
      <Printer size={14} aria-hidden /> {rotulo}
    </button>
  )
}
