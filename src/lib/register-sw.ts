/**
 * Registers the service worker that makes the app installable and usable
 * offline. Safe to call more than once.
 */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Registering during load competes with the page's own requests.
  const register = () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      // Not fatal: the app works normally, just without offline support.
      console.warn("Offline support unavailable:", error);
    });
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

/**
 * Forget cached data responses. Called on sign-out — those responses contain
 * the owner's figures and must not survive into another session on this device.
 *
 * Note what this deliberately does NOT do: it doesn't touch the offline entry
 * queue. Those are entries the owner typed that haven't reached the server yet,
 * and deleting them would destroy real work. They're stored per account (see
 * queueKeyFor), so leaving them is safe — they can only ever be sent to the
 * account that created them.
 */
export async function clearOfflineData() {
  if (typeof window === "undefined") return;
  try {
    const registration = await navigator.serviceWorker?.ready;
    registration?.active?.postMessage("clear-data-cache");
  } catch {
    // No service worker: nothing was cached in the first place.
  }
}
