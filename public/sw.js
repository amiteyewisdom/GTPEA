self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'GTPEA';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/images/gtpea-logo.png',
    badge: '/images/gtpea-logo.png',
    tag: data.tag || 'gtpea-notification',
    data: { url: data.url || '/dashboard' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
