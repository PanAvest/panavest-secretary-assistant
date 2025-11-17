// src/components/MeetingForm.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

export default function MeetingForm({ onSave, onCancel, saving, existing }) {
  const { user } = useAuth();

  const [title, setTitle] = useState(existing?.title || "");
  const [meetingDate, setMeetingDate] = useState(existing?.meeting_date || "");
  const [startTime, setStartTime] = useState(existing?.start_time || "");
  const [venue, setVenue] = useState(existing?.venue || "");
  const [agenda, setAgenda] = useState(existing?.agenda || "");
  const [comments, setComments] = useState(existing?.comments || "");

  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState(
    existing?.participant_emails || []
  );
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfiles() {
    setProfilesLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Could not load profiles", error);
      setProfiles([]);
    } else {
      const currentEmail = user?.email?.toLowerCase() ?? "";
      const others = (data || []).filter(
        (p) => (p.email || "").toLowerCase() !== currentEmail
      );
      setProfiles(others);
    }
    setProfilesLoading(false);
  }

  function toggleEmail(email) {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title for the meeting.");
      return;
    }
    if (!meetingDate) {
      setError("Please select a date.");
      return;
    }

    const payload = {
      title: title.trim(),
      meeting_date: meetingDate,
      start_time: startTime || null,
      venue: venue?.trim() || null,
      agenda: agenda?.trim() || null,
      comments: comments?.trim() || null,
      participant_emails: selectedEmails,
    };

    onSave && onSave(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Meeting title
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            placeholder="Board review with Prof"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Date
          </label>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Start time
          </label>
          <input
            type="time"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Venue
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            placeholder="PanAvest Office / Zoom / Teams"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Agenda / purpose
        </label>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
          placeholder="Key discussion points, decisions needed, documents to review..."
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Participants on the platform
        </label>
        <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-auto bg-slate-50/60">
          {profilesLoading ? (
            <div className="text-xs text-slate-500">Loading users...</div>
          ) : profiles.length === 0 ? (
            <div className="text-xs text-slate-500">
              No other users yet. Once more people sign up, you can tag them
              here so meetings appear on their dashboards.
            </div>
          ) : (
            <ul className="space-y-1">
              {profiles.map((p) => {
                const email = (p.email || "").toLowerCase();
                const checked = selectedEmails.includes(email);
                return (
                  <li key={p.id}>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={checked}
                        onChange={() => toggleEmail(email)}
                      />
                      <span className="font-medium text-slate-800">
                        {p.full_name || email}
                      </span>
                      {p.full_name && (
                        <span className="text-[11px] text-slate-500">
                          ({email})
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Anyone you tick here will see this meeting on their dashboard when
          they sign in with that email.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Comments / notes (optional)
        </label>
        <textarea
          rows={2}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
          placeholder="Log key outcomes, follow-ups or internal notes."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost text-xs md:text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-xs md:text-sm"
        >
          {saving ? "Saving..." : existing ? "Save changes" : "Save meeting"}
        </button>
      </div>
    </form>
  );
}
