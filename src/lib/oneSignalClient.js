// src/lib/oneSignalClient.js
import OneSignal from "react-onesignal";

let initialized = false;

/**
 * Initialize OneSignal once for the app.
 */
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
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false, // we're handling our own UI
      },
    });
    initialized = true;
  } catch (err) {
    console.error("OneSignal init error", err);
  }
}

/**
 * Link the current logged-in user to OneSignal using their email
 * as the external user ID.
 */
export async function identifyUser(email) {
  if (!email) return;
  try {
    await OneSignal.login(email.toLowerCase());
  } catch (err) {
    console.error("OneSignal identifyUser error", err);
  }
}

/**
 * Send a notification to all participant_emails on a meeting record.
 * NOTE: uses REST API key on the client for now (okay for internal tool),
 * but later we can move this to a Supabase Edge Function for more security.
 */
export async function notifyMeetingParticipants(meeting) {
  const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  const restKey = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;

  if (!appId || !restKey) {
    console.warn("OneSignal appId or REST API key missing");
    return;
  }

  const emails = meeting.participant_emails || [];
  if (!emails.length) return;

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
    console.error("Failed to send OneSignal notification", err);
  }
}

// Re-export in case you need direct access somewhere
export { OneSignal };
