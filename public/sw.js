// Personal OS service worker — minimal: PWA installability + Pulse notification relay.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// Bring the OS tab to the foreground (and to /#/pulse) when a Pulse ping is tapped.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil((async () => {
    const target = self.registration.scope + '#/pulse'
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = windows.find((c) => c.url.includes('/personal-os/'))
    if (existing) {
      await existing.focus()
      existing.postMessage({ type: 'pulse-open' })
    } else {
      await self.clients.openWindow(target)
    }
  })())
})
