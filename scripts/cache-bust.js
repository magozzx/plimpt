(async () => {
  if (!["localhost", "127.0.0.1", "::1"].includes(location.hostname)) return;
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  const keys = window.caches ? await caches.keys() : [];

  if (!registrations.length && !keys.length) return;

  await Promise.all(registrations.map((registration) => registration.unregister()));
  await Promise.all(keys.map((key) => caches.delete(key)));

  const url = new URL(location.href);
  if (url.searchParams.get("fresh") !== "1") {
    url.searchParams.set("fresh", "1");
    location.replace(url.toString());
  }
})();
