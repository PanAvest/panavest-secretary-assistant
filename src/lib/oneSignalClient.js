// src/lib/oneSignalClient.js
import OneSignal from "react-onesignal";

let initialized = false;

export async function initOneSignal() {
  // Don't run on server or in non-browser environments
  if (typeof window === "undefined") return;
  if (initialized) return;

  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn("VITE_ONESIGNAL_APP_ID is not set");
    return;
  }

  try {
    await OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true, // so dev on http://localhost works
      notifyButton: {
        enable: false, // we will handle UI ourselves
      },
    });
    initialized = true;
  } catch (err) {
    // Only log a simple warning so it doesn't break the app
    console.warn("OneSignal init error (non-blocking)", err);
  }
}

export { OneSignal };
