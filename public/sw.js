self.addEventListener('push', (event) => {
  let data = { title: '🪔 श्री सिद्धिविनायक गणेश मंदिर', body: 'उद्या तुमची आरतीची सेवा आहे.' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: { url: '/' }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if ('focus' in client) return client.focus()
    }
    if (clients.openWindow) return clients.openWindow('/')
  }))
})
