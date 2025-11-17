// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PlusCircle } from "lucide-react";
import MeetingForm from "../components/MeetingForm";
import { useAuth } from "../lib/AuthContext";
import { notifyMeetingParticipants } from "../lib/oneSignalClient";

export default function Dashboard() {
  const { user } = useAuth();
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);

      const todayStr = new Date().toISOString().slice(0, 10);

      const meetingsQuery = supabase
        .from("meetings")
        .select("*")
        .eq("meeting_date", todayStr)
        .order("start_time", { ascending: true });

      const tasksQuery = supabase
        .from("tasks")
        .select("*")
        .eq("owner_id", user.id)
        .eq("status", "pending")
        .order("due_date", { ascending: true });

      const [{ data: m, error: mErr }, { data: t, error: tErr }] =
        await Promise.all([meetingsQuery, tasksQuery]);

      if (mErr) {
        alert("Could not load today's meetings: " + mErr.message);
        setTodayMeetings([]);
      } else {
        setTodayMeetings(m || []);
      }

      if (tErr) {
        alert("Could not load tasks: " + tErr.message);
        setTasks([]);
      } else {
        setTasks(t || []);
      }

      setLoading(false);
    }

    load();
  }, [user]);

  async function handleSaveMeeting(formValues) {
    if (!user) return;

    const insertPayload = {
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

    const { data, error } = await supabase
      .from("meetings")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      alert("Could not save meeting: " + error.message);
      return;
    }

    try {
      await notifyMeetingParticipants(data);
    } catch (err) {
      console.error("notifyMeetingParticipants error:", err);
    }

    setTodayMeetings((prev) => [...prev, data]);
    setShowForm(false);
  }

  const today = new Date();
  const formattedToday = today.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-panablue">
            Today&apos;s overview
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            {formattedToday} • PanAvest Office Secretary Console
          </p>
        </div>
        <button
          className="btn-primary inline-flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <PlusCircle size={16} />
          New meeting
        </button>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {/* Today’s meetings */}
        <div className="card px-4 py-3 md:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Today&apos;s meetings
              </h2>
              <p className="text-xs text-slate-500">
                All meetings scheduled for today.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-6 text-sm text-slate-500">Loading...</div>
          ) : todayMeetings.length === 0 ? (
            <div className="py-6 text-xs text-slate-500">
              No meetings scheduled for today.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-auto">
              {todayMeetings.map((m) => (
                <div
                  key={m.id}
                  className="border border-slate-100 rounded-md px-3 py-2 flex flex-col gap-1 bg-white"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium text-slate-900">
                      {m.title}
                    </div>
                    {m.start_time && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-panablue/5 text-panablue">
                        {m.start_time}
                      </span>
                    )}
                  </div>
                  {m.venue && (
                    <div className="text-[11px] text-slate-500">
                      Venue: {m.venue}
                    </div>
                  )}
                  {m.agenda && (
                    <div className="text-[11px] text-slate-600 line-clamp-2">
                      {m.agenda}
                    </div>
                  )}
                  {m.attendees_text && (
                    <div className="text-[11px] text-slate-500">
                      Attendees: {m.attendees_text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks + notes */}
        <div className="space-y-4 md:col-span-2">
          <div className="card px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Pending follow-ups
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Tasks & actions the secretary must not forget.
            </p>
            {loading ? (
              <div className="py-4 text-xs text-slate-500">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="py-4 text-xs text-slate-500">
                No pending tasks. You&apos;re up to date 🎉
              </div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-800">
                        {t.title}
                      </div>
                      {t.due_date && (
                        <div className="text-[11px] text-slate-500">
                          Due {t.due_date}
                        </div>
                      )}
                    </div>
                    <span className="badge bg-panablue/5 text-panablue">
                      {t.assignee || "Secretary"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Secretary notes
            </h2>
            <p className="text-xs text-slate-500">
              Use the Meetings page for detailed notes per meeting. This can be
              extended later with a quick notepad if needed.
            </p>
          </div>
        </div>
      </div>

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
