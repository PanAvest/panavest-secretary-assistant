// src/components/MeetingForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MeetingForm({ onSave, onCancel, saving, existing }) {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [agenda, setAgenda] = useState("");
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [attendeesText, setAttendeesText] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);

  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Load profiles (for attendee selection)
  useEffect(() => {
    let isMounted = true;

    async function loadProfiles() {
      setLoadingProfiles(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (!isMounted) return;

      if (error) {
        console.error("Error loading profiles:", error);
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
      setLoadingProfiles(false);
    }

    loadProfiles();
    return () => {
      isMounted = false;
    };
  }, []);

  // When editing, populate fields from existing meeting
  useEffect(() => {
    if (existing) {
      setTitle(existing.title || "");
      setMeetingDate(existing.meeting_date || "");
      setStartTime(existing.start_time || "");
      setEndTime(existing.end_time || "");
      setVenue(existing.venue || "");
      setAgenda(existing.agenda || "");
      setComments(existing.comments || "");
      setStatus(existing.status || "scheduled");
      setAttendeesText(existing.attendees_text || "");
      setSelectedEmails(existing.participant_emails || []);
    } else {
      setTitle("");
      setMeetingDate("");
      setStartTime("");
      setEndTime("");
      setVenue("");
      setAgenda("");
      setComments("");
      setStatus("scheduled");
      setAttendeesText("");
      setSelectedEmails([]);
    }
  }, [existing]);

  function toggleEmail(email) {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  }

  // If attendeesText is empty, we can auto-generate from selected profiles
  const computedAttendeesText = useMemo(() => {
    if (attendeesText && attendeesText.trim().length > 0) {
      return attendeesText.trim();
    }
    if (!profiles.length || !selectedEmails.length) return "";
    const names = profiles
      .filter((p) => p.email && selectedEmails.includes(p.email))
      .map((p) => p.full_name || p.email);
    return names.join(", ");
  }, [attendeesText, profiles, selectedEmails]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      title,
      meeting_date: meetingDate,
      start_time: startTime,
      end_time: endTime || null,
      venue,
      agenda,
      comments,
      status,
      attendees_text: computedAttendeesText || null,
      participant_emails: selectedEmails,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">
        {existing ? "Edit Meeting" : "New Meeting"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Title<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Meeting Date<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Start Time<span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            type="time"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Boardroom, Online (Zoom), etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Agenda</label>
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm"
          rows={3}
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          placeholder="Key topics to discuss..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Comments</label>
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm"
          rows={2}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Any additional notes..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Attendees (select from list)
        </label>
        {loadingProfiles ? (
          <p className="text-sm text-gray-500">Loading members…</p>
        ) : profiles.length === 0 ? (
          <p className="text-sm text-gray-500">
            No profiles found. Add members first.
          </p>
        ) : (
          <div className="max-h-40 overflow-auto border rounded-md p-2 space-y-1 text-sm">
            {profiles.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    p.email ? selectedEmails.includes(p.email) : false
                  }
                  onChange={() => p.email && toggleEmail(p.email)}
                  disabled={!p.email}
                />
                <span>
                  {p.full_name || p.email}
                  {p.email && (
                    <span className="text-gray-500 text-xs">
                      {" "}
                      – {p.email}
                    </span>
                  )}
                  {!p.email && (
                    <span className="text-red-400 text-[10px] ml-1">
                      (no email)
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Attendees note (optional)
        </label>
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm"
          rows={2}
          value={attendeesText}
          onChange={(e) => setAttendeesText(e.target.value)}
          placeholder="Eg. Prof Boateng, Board Members, Finance Team..."
        />
        <p className="text-[11px] text-gray-500 mt-1">
          If left empty, this will auto-fill based on the attendees you tick
          above.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
          disabled={saving}
        >
          {saving
            ? existing
              ? "Saving changes..."
              : "Creating..."
            : existing
            ? "Save changes"
            : "Create meeting"}
        </button>
      </div>
    </form>
  );
}
