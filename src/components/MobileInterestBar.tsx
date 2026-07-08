'use client'
import { useEffect, useState } from 'react'

// Barra fixa mobile que leva ao formulário #interesse; some quando o form está visível
export function MobileInterestBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById('interesse')
    if (!target) return
    setVisible(true)
    const io = new IntersectionObserver(
      (entries) => setVisible(!entries[0].isIntersecting),
      { rootMargin: '0px 0px -15% 0px' }
    )
    io.observe(target)
    return () => io.disconnect()
  }, [])

  if (!visible) return null

  return (
    <>
      <style>{`.sa-ibar{display:none}@media(max-width:768px){.sa-ibar{display:block}}`}</style>
      <div
        className="sa-ibar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          padding: '10px 16px',
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #e4e4e7',
        }}
      >
        <button
          type="button"
          onClick={() => document.getElementById('interesse')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          style={{
            width: '100%',
            background: '#18181b',
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            padding: '14px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Tenho interesse
        </button>
      </div>
    </>
  )
}

export default MobileInterestBar
