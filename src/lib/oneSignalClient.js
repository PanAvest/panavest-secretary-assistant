// src/lib/oneSignalClient.js
import OneSignal from "react-onesignal";

let initialized = false;
let initPromise = null;

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
      // console.log("[OneSignal] SDK initialised");
    } catch (err) {
      const msg = (err && (err.message || String(err))) || "";

      // If the SDK says it's already initialised, just treat as success
      if (String(err).includes("SDK already initialized") || msg.includes("SDK already initialized")) {
        initialized = true;
        // console.warn("[OneSignal] SDK already initialised – ignoring.");
        return;
      }

      // For this internal tool we NEVER want OneSignal to break the app
      console.warn("[OneSignal] init failed (non-fatal):", err);
    }
  })();

  return initPromise;
}

/**
 * Link the current logged-in user to OneSignal.
 *
 * For now we **disable** actual login to avoid the
 * `OneSignal.Z.tt` / internal SDK crashes.
 * Your notifications still work via REST + email.
 */
export async function identifyUser(_email) {
  // Temporarily no-op to keep the app stable.
  // If later you want to re-enable:
  //  - await initOneSignal();
  //  - await OneSignal.login(email.toLowerCase());
  return;
}

/**
 * Send a notification to all participant_emails on a meeting record.
 * Uses REST API key (okay for internal tool), but later we can
 * move this to a Supabase Edge Function for more security.
 */
export async function notifyMeetingParticipants(meeting) {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  const restKey = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;

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
    await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${restKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        include_external_user_ids: emails.map((e) => e.toLowerCase()),
        headings: { en: "New PanAvest meeting" },
        contents: {
          en: contentsText || "You were added to a PanAvest meeting.",
        },
        data: {
          type: "meeting_added",
          meeting_id: meeting.id,
        },
      }),
    });
  } catch (err) {
    console.error("[OneSignal] Failed to send notification", err);
  }
}

// Don't export OneSignal directly anywhere else.
// Keep all access through this module.
export { OneSignal };
