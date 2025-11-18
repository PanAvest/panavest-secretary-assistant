// src/pages/Meetings.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PlusCircle, RefreshCw } from "lucide-react";
import MeetingForm from "../components/MeetingForm";
import MeetingList from "../components/MeetingList";
import { useAuth } from "../lib/AuthContext";
import {
  notifyMeetingParticipants,
  notifyMeetingStatusChange,
} from "../lib/oneSignalClient";

export default function Meetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null); // null = creating

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
      .eq("owner_id", user.id)
      .order("meeting_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error loading meetings:", error);
    } else {
      setMeetings(data || []);
    }

    setLoading(false);
  }

  function handleCreateNew() {
    setEditingMeeting(null);
    setShowForm(true);
  }

  function handleEdit(meeting) {
    setEditingMeeting(meeting);
    setShowForm(true);
  }

  async function handleDelete(meetingId) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this meeting?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", meetingId)
      .eq("owner_id", user.id);

    if (error) {
      console.error("Error deleting meeting:", error);
      alert("Could not delete meeting. Please try again.");
      return;
    }

    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
  }

  async function handleSave(formValues) {
    if (!user) return;
    setSaving(true);

    const payload = {
      title: formValues.title,
      meeting_date: formValues.meeting_date,
      start_time: formValues.start_time,
      end_time: formValues.end_time || null,
      venue: formValues.venue || null,
      agenda: formValues.agenda || null,
      comments: formValues.comments || null,
      status: formValues.status || "scheduled",
      attendees_text: formValues.attendees_text || null,
      participant_emails: formValues.participant_emails || [],
      owner_id: user.id,
    };

    try {
      if (editingMeeting) {
        const { data, error } = await supabase
          .from("meetings")
          .update(payload)
          .eq("id", editingMeeting.id)
          .eq("owner_id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating meeting:", error);
          alert("Could not update meeting. Please try again.");
        } else {
          setMeetings((prev) =>
            prev.map((m) => (m.id === data.id ? data : m))
          );

          const statusChanged = editingMeeting.status !== payload.status;
          try {
            if (statusChanged) {
              await notifyMeetingStatusChange(data, payload.status);
            } else {
              await notifyMeetingParticipants(data);
            }
          } catch (notifyErr) {
            console.error("Error notifying participants:", notifyErr);
          }

          setShowForm(false);
          setEditingMeeting(null);
        }
      } else {
        const { data, error } = await supabase
          .from("meetings")
          .insert([payload])
          .select()
          .single();

        if (error) {
          console.error("Error creating meeting:", error);
          alert("Could not create meeting. Please try again.");
        } else {
          setMeetings((prev) => [data, ...prev]);

          try {
            await notifyMeetingParticipants(data);
          } catch (notifyErr) {
            console.error("Error notifying participants:", notifyErr);
          }

          setShowForm(false);
          setEditingMeeting(null);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(meeting, nextStatus) {
    const { data, error } = await supabase
      .from("meetings")
      .update({ status: nextStatus })
      .eq("id", meeting.id)
      .eq("owner_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating meeting:", error);
      alert("Could not update meeting status. Please try again.");
      return;
    }

    setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? data : m)));

    try {
      await notifyMeetingStatusChange(data, nextStatus);
    } catch (notifyErr) {
      console.error("Error notifying status change:", notifyErr);
    }
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingMeeting(null);
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Meetings</h1>
        <div className="flex gap-2">
          <button
            onClick={loadMeetings}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusCircle size={16} />
            New Meeting
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-4 border rounded-lg p-4 bg-gray-50">
          <MeetingForm
            existing={editingMeeting}
            onSave={handleSave}
            onCancel={handleCancelForm}
            saving={saving}
          />
        </div>
      )}

      <MeetingList
        meetings={meetings}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
