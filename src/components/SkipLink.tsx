// Link "pular para o conteúdo" — invisível até receber foco por teclado.
// Aponta para #main-content (tabIndex=-1 no <main> alvo, ver cada template).
// CSS puro (:focus), sem handlers React: funciona mesmo antes da hidratação
// e não precisa de fronteira de Client Component só por causa disto.
export function SkipLink({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <>
      <style>{`
        .sa-skip-link {
          position: absolute; left: 12px; top: -60px; z-index: 1000;
          background: #1A1814; color: #F5F1EA; padding: 12px 20px;
          font-family: var(--font-hanken), system-ui, sans-serif; font-size: 13px;
          letter-spacing: 0.04em; text-decoration: none; border-radius: 4px;
          transition: top .2s ease;
        }
        .sa-skip-link:focus { top: 12px; }
      `}</style>
      <a href={`#${targetId}`} className="sa-skip-link">
        Pular para o conteúdo principal
      </a>
    </>
  )
}
