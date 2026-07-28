// Service worker mínimo só pra Web Push — sem cache/offline (o app já
// depende de dados sempre frescos do Supabase, cache agressivo faria mais
// mal que bem aqui).

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'SA Painel', body: event.data ? event.data.text() : 'Você tem uma notificação nova.' }
  }

  const title = data.title || 'SA Painel'
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/dashboard/crm' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Clica na notificação -> foca uma aba já aberta no destino, ou abre uma
// nova. Nunca abre duas abas pro mesmo destino.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/dashboard/crm'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
