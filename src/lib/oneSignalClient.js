// src/lib/oneSignalClient.js
import OneSignal from "react-onesignal";

let initialized = false;

export async function initOneSignal() {
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
    console.error("OneSignal init error", err);
  }
}

export { OneSignal };
