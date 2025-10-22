// Service Worker registration
if ("serviceWorker" in navigator) {
  self.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then((reg) => {
        console.log("✓ Service Worker registered:", reg.scope);

        // Check for updates periodically
        setInterval(() => {
          reg.update();
        }, 60000); // Check every minute
      })
      .catch((err) =>
        console.error("✗ Service Worker registration failed:", err)
      );
  });
}
