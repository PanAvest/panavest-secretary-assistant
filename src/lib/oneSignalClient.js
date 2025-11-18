// src/lib/oneSignalClient.js
import OneSignal from "react-onesignal";

let initialized = false;
let initPromise = null;
let permissionState = "default";

/**
 * Initialize OneSignal once for the app.
 * Very defensive: never throws, never crashes your UI.
 */
export async function initOneSignal() {
  // Don't run on server during build / SSR
  if (typeof window === "undefined") return;

  // Already initialised in this session
  if (initialized) return;

  // Init already in progress (StrictMode double-mount, etc.)
  if (initPromise) return initPromise;

  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn("[OneSignal] VITE_ONESIGNAL_APP_ID is not set. Skipping init.");
    return;
  }

  initPromise = (async () => {
    try {
      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false, // we're handling our own UI
        },
      });
      initialized = true;
    } catch (err) {
      const msg = (err && (err.message || String(err))) || "";

      // If the SDK says it's already initialised, just treat as success
      if (
        String(err).includes("SDK already initialized") ||
        msg.includes("SDK already initialized")
      ) {
        initialized = true;
        return;
      }

      // For this internal tool we NEVER want OneSignal to break the app
      console.warn("[OneSignal] init failed (non-fatal):", err);
    }
  })();

  return initPromise;
}

function readNativePermission() {
  if (typeof Notification === "undefined") return "default";
  return Notification.permission;
}

export async function getNotificationPermission() {
  if (typeof window === "undefined") return "default";
  try {
    await initOneSignal();
    const status = await OneSignal.Notifications.getPermission();
    permissionState = status || readNativePermission();
    return permissionState;
  } catch (_err) {
    permissionState = readNativePermission();
    return permissionState;
  }
}

/**
 * Link the current logged-in user to OneSignal and
 * request push permission for web/PWA clients.
 */
export async function identifyUser(email) {
  if (typeof window === "undefined" || !email) return;

  await initOneSignal();

  const normalized = email.toLowerCase();
  try {
    // Associate the device with this user (required for include_external_user_ids).
    await OneSignal.login(normalized);
  } catch (err) {
    console.warn("[OneSignal] login failed (non-fatal):", err);
  }

  // Try to attach an email channel when the SDK supports it.
  if (OneSignal?.User?.addEmail) {
    try {
      await OneSignal.User.addEmail(normalized);
    } catch (err) {
      console.warn("[OneSignal] addEmail failed (non-fatal):", err);
    }
  }

  // Ensure the device is opted-in for push
  await requestNotificationPermission();
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined") return "default";
  await initOneSignal();

  try {
    const current = await OneSignal.Notifications.getPermission();
    permissionState = current || "default";
    if (current === "granted") return current;

    const next = await OneSignal.Notifications.requestPermission();
    permissionState = next || readNativePermission();

    // Some browsers require the slide-down prompt; fall back silently.
    if (permissionState !== "granted" && OneSignal?.Slidedown?.promptPush) {
      await OneSignal.Slidedown.promptPush();
      permissionState =
        (await OneSignal.Notifications.getPermission()) || readNativePermission();
    }

    return permissionState;
  } catch (err) {
    console.warn("[OneSignal] request permission failed:", err);
    permissionState = readNativePermission();
    return permissionState;
  }
}

/**
 * Send a notification to all participant_emails on a meeting record.
 * Uses REST API key (okay for internal tool), but later we can
 * move this to a Supabase Edge Function for more security.
 */
export async function notifyMeetingParticipants(meeting) {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  const restKey = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;
  const landingUrl =
    typeof window !== "undefined" && window.location
      ? `${window.location.origin}/meetings`
      : undefined;

  if (!appId || !restKey) {
    console.warn("[OneSignal] appId or REST API key missing – cannot notify.");
    return;
  }

  if (!meeting) return;

  const emails = meeting.participant_emails || [];
  if (!Array.isArray(emails) || emails.length === 0) return;

  const title = meeting.title || "New meeting";
  const date = meeting.meeting_date || "";
  const time = meeting.start_time || "";
  const venue = meeting.venue || "";

  const contentsText = [
    `You were added to: ${title}`,
    date || time ? `When: ${date} ${time}`.trim() : "",
    venue ? `Where: ${venue}` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  try {
    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${restKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        include_external_user_ids: emails.map((e) => e.toLowerCase()),
        channel_for_external_user_ids: "push",
        headings: { en: "New PanAvest meeting" },
        contents: {
          en: contentsText || "You were added to a PanAvest meeting.",
        },
        app_url: landingUrl,
        web_url: landingUrl,
        data: {
          type: "meeting_added",
          meeting_id: meeting.id,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn(
        "[OneSignal] Notification API returned",
        res.status,
        res.statusText,
        text
      );
    }
  } catch (err) {
    console.error("[OneSignal] Failed to send notification", err);
  }
}

// Don't export OneSignal directly anywhere else.
// Keep all access through this module.
export { OneSignal };
