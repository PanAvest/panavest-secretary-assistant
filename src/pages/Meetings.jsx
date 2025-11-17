// src/pages/Meetings.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PlusCircle, RefreshCw } from "lucide-react";
import MeetingForm from "../components/MeetingForm";
import MeetingList from "../components/MeetingList";
import { useAuth } from "../lib/AuthContext";
import { notifyMeetingParticipants } from "../lib/oneSignalClient";

export default function Meetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // null = new meeting, object = editing existing one
  const [editingMeeting, setEditingMeeting] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadMeetings() {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("meeting_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      alert("Could not load meetings: " + error.message);
    } else {
      setMeetings(data || []);
    }
    setLoading(false);
  }

  async function handleSaveMeeting(payload) {
    if (!user) return;
    setSaving(true);

    try {
      // Build payload for DB
      const dbPayload = {
        ...payload,
        owner_id: editingMeeting?.owner_id || user.id,
      };

      // If we're editing, include the id so Supabase knows which row to update
      if (editingMeeting?.id) {
        dbPayload.id = editingMeeting.id;
      }

      // 🔁 UPSERT: if id exists -> update, if not -> insert
      const { data, error } = await supabase
        .from("meetings")
        .upsert(dbPayload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.error("Supabase upsert error:", error);
        // eslint-disable-next-line no-alert
        alert("Could not save meeting: " + error.message);
        return;
      }

      // 🔔 Notify tagged participants (works for both new + edited)
      await notifyMeetingParticipants(data);

      // Update local list: replace if exists, else append
      setMeetings((prev) => {
        const exists = prev.some((m) => m.id === data.id);
        if (exists) {
          return prev.map((m) => (m.id === data.id ? data : m));
        }
        return [...prev, data];
      });

      // Reset edit state + close modal
      setEditingMeeting(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function handleSelectMeeting(m) {
    const summary = [
      `Title: ${m.title}`,
      `Date & time: ${m.meeting_date} ${m.start_time || ""}`,
      m.venue ? `Venue: ${m.venue}` : "",
      m.agenda ? `Agenda: ${m.agenda}` : "",
      m.comments ? `Comments: ${m.comments}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    // eslint-disable-next-line no-alert
    alert(summary);
  }

  // ✏️ Edit button from MeetingList
  function handleEditMeeting(meeting) {
    setEditingMeeting(meeting);
    setShowForm(true);
  }

  // 🗑 Delete button from MeetingList
  async function handleDeleteMeeting(meeting) {
    if (!user) return;

    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Delete meeting "${meeting.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", meeting.id);

    if (error) {
      console.error("Supabase delete error:", error);
      // eslint-disable-next-line no-alert
      alert("Could not delete meeting: " + error.message);
      return;
    }

    setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingMeeting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-panablue">
            All meetings
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Full diary: past and upcoming meetings.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadMeetings}
            className="btn-ghost inline-flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            className="btn-primary inline-flex items-center gap-2"
            onClick={() => {
              setEditingMeeting(null); // ensure "new mode"
              setShowForm(true);
            }}
          >
            <PlusCircle size={16} />
            New meeting
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card px-4 py-6 text-sm text-slate-500">Loading...</div>
      ) : (
        <MeetingList
          items={meetings}
          onSelect={handleSelectMeeting}
          onEdit={handleEditMeeting}
          onDelete={handleDeleteMeeting}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-30 bg-black/30 flex items-center justify-center px-4">
          <div className="card max-w-2xl w-full p-4 md:p-6 max-h-[90vh] overflow-auto">
            <h2 className="text-sm md:text-base font-semibold text-slate-800 mb-4">
              {editingMeeting ? "Edit meeting" : "New meeting"}
            </h2>
            <MeetingForm
              existing={editingMeeting}
              onSave={handleSaveMeeting}
              onCancel={handleCloseForm}
              saving={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}
