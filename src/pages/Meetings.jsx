import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PlusCircle, RefreshCw } from "lucide-react";
import MeetingForm from "../components/MeetingForm";
import MeetingList from "../components/MeetingList";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("meeting_date", { ascending: true })
      .order("start_time", { ascending: true });
    if (error) {
      // eslint-disable-next-line no-alert
      alert("Could not load meetings: " + error.message);
    } else {
      setMeetings(data || []);
    }
    setLoading(false);
  }

  async function handleSaveMeeting(payload) {
    const { attendees, ...rest } = payload;
    const { data, error } = await supabase
      .from("meetings")
      .insert(rest)
      .select()
      .single();

    if (error) {
      // eslint-disable-next-line no-alert
      alert("Could not save meeting: " + error.message);
      return;
    }

    if (attendees && attendees.length) {
      const rows = attendees.map((name) => ({
        meeting_id: data.id,
        name,
      }));
      await supabase.from("attendees").insert(rows);
      data.attendees = attendees;
    }

    setMeetings((prev) => [...prev, data]);
    setShowForm(false);
  }

  function handleSelectMeeting(m) {
    // For now just show details in alert; can be replaced by a slide-over later
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
            onClick={() => setShowForm(true)}
          >
            <PlusCircle size={16} />
            New meeting
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card px-4 py-6 text-sm text-slate-500">Loading...</div>
      ) : (
        <MeetingList items={meetings} onSelect={handleSelectMeeting} />
      )}

      {showForm && (
        <div className="fixed inset-0 z-30 bg-black/30 flex items-center justify-center px-4">
          <div className="card max-w-2xl w-full p-4 md:p-6 max-h-[90vh] overflow-auto">
            <h2 className="text-sm md:text-base font-semibold text-slate-800 mb-4">
              New meeting
            </h2>
            <MeetingForm
              onSave={handleSaveMeeting}
              onCancel={() => setShowForm(false)}
              saving={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
