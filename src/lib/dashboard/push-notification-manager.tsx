'use client'
import { useEffect, useState } from 'react'

const D = { bronze: '#D24E22', line: 'rgba(26,24,21,0.08)' }

type Status = 'checking' | 'unsupported' | 'precisa-instalar' | 'default' | 'subscribing' | 'subscribed' | 'denied' | 'error'

// VAPID public key vem em base64url (formato do Push API) — o browser
// exige Uint8Array bruto pro applicationServerKey.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

// No Safari do iPhone, o Push API só existe depois que o site foi instalado
// pela Tela de Início — numa aba normal do Safari, PushManager/Notification
// nem aparecem no navigator, então a checagem de suporte já cobre a maioria
// dos casos. A checagem explícita de iOS aqui é só pra dar uma mensagem
// específica ("instale primeiro") em vez do genérico "não suportado".
function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

// Banner discreto, some sozinho assim que o corretor já está inscrito (ou
// já negou uma vez — não insiste, evita ficar pedindo permissão de novo a
// cada visita). Montado uma única vez em dashboard/layout.tsx.
export function PushNotificationManager() {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setStatus(isIOS() && !isStandalone() ? 'precisa-instalar' : 'unsupported')
      return
    }
    let cancelado = false
    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        const existente = await reg.pushManager.getSubscription()
        if (cancelado) return
        if (existente) { setStatus('subscribed'); return }
        setStatus(Notification.permission === 'denied' ? 'denied' : 'default')
      })
      .catch(() => { if (!cancelado) setStatus('error') })
    return () => { cancelado = true }
  }, [])

  async function ativar() {
    setStatus('subscribing')
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { setStatus('error'); return }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus(permission === 'denied' ? 'denied' : 'default'); return }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      })

      const res = await fetch('/api/admin/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      if (!res.ok) throw new Error('falha ao salvar assinatura')
      setStatus('subscribed')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'checking' || status === 'unsupported' || status === 'subscribed' || status === 'denied') return null

  const mensagens: Record<string, string> = {
    'precisa-instalar': '🔔 Pra receber notificação de lead novo, instale o app primeiro: toque em Compartilhar → "Adicionar à Tela de Início".',
    default: '🔔 Ative notificações pra saber na hora quando um lead novo chegar.',
    error: '⚠️ Não deu pra ativar notificações agora. Tente de novo em instantes.',
  }

  return (
    <div
      role="status"
      style={{
        background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '10px 14px',
        margin: '0 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        fontSize: 13, color: '#9A3412', flexWrap: 'wrap',
      }}
    >
      <span>{mensagens[status] ?? mensagens.default}</span>
      {(status === 'default' || status === 'subscribing' || status === 'error') && (
        <button
          onClick={ativar}
          disabled={status === 'subscribing'}
          style={{
            background: D.bronze, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px',
            fontSize: 12, fontWeight: 700, cursor: status === 'subscribing' ? 'default' : 'pointer',
            whiteSpace: 'nowrap', opacity: status === 'subscribing' ? 0.7 : 1, minHeight: 32,
          }}
        >
          {status === 'subscribing' ? 'Ativando...' : 'Ativar'}
        </button>
      )}
    </div>
  )
}
