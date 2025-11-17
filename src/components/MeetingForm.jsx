// src/components/MeetingForm.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MeetingForm({ onSave, onCancel, saving, existing }) {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [venue, setVenue] = useState("");
  const [agenda, setAgenda] = useState("");
  const [comments, setComments] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Load profiles once
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

  // Populate form when editing OR clear when creating new
  useEffect(() => {
    if (existing) {
      setTitle(existing.title || "");
      setMeetingDate(existing.meeting_date || "");
      setStartTime(existing.start_time || "");
      setVenue(existing.venue || "");
      setAgenda(existing.agenda || "");
      setComments(existing.comments || "");
      setSelectedParticipants(existing.participants || []);
    } else {
      setTitle("");
      setMeetingDate("");
      setStartTime("");
      setVenue("");
      setAgenda("");
      setComments("");
      setSelectedParticipants([]);
    }
  }, [existing]);

  function toggleParticipant(id) {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      title,
      meeting_date: meetingDate,
      start_time: startTime,
      venue,
      agenda,
      comments,
      participants: selectedParticipants,
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
          <label className="block text-sm font-medium mb-1">Venue</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Boardroom, Online (Zoom), etc."
          />
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
        <label className="block text-sm font-medium mb-1">Participants</label>
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
                  checked={selectedParticipants.includes(p.id)}
                  onChange={() => toggleParticipant(p.id)}
                />
                <span>
                  {p.full_name}
                  {p.email ? (
                    <span className="text-gray-500 text-xs"> – {p.email}</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        )}
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
