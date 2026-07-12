self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }
  const title = payload.title || "Kənd Taxi";
  const options = {
    body: payload.body || "Yeni bildirişiniz var.",
    icon: "/app-icon.svg",
    badge: "/app-icon.svg",
    tag: payload.tag,
    renotify: false,
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((windowClient) => windowClient.url === targetUrl);
      if (existing) return existing.focus();
      return clients.openWindow(targetUrl);
    })
  );
});
