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
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const todayStr = new Date().toISOString().slice(0, 10);

      // All meetings from today going forward
      const meetingsQuery = supabase
        .from("meetings")
        .select("*")
        .eq("owner_id", user.id)
        .order("meeting_date", { ascending: true })
        .order("start_time", { ascending: true });

      const tasksQuery = supabase
        .from("tasks")
        .select("*")
        .eq("owner_id", user.id)
        .order("due_date", { ascending: true });

      setLoadingMeetings(true);
      setLoadingTasks(true);

      const [{ data: m, error: mErr }, { data: t, error: tErr }] =
        await Promise.all([meetingsQuery, tasksQuery]);

      if (cancelled) return;

      const allMeetings = m || [];

      if (mErr) {
        alert("Could not load meetings: " + mErr.message);
        setTodayMeetings([]);
        setUpcomingMeetings([]);
        setPastMeetings([]);
      } else {
        const todays = allMeetings.filter(
          (row) => row.meeting_date === todayStr
        );
        const upcoming = allMeetings.filter(
          (row) => row.meeting_date > todayStr
        );
        const past = allMeetings
          .filter((row) => row.meeting_date < todayStr)
          .slice(-5) // last 5 past for quick glance
          .reverse(); // show most recent first
        setTodayMeetings(todays);
        setUpcomingMeetings(upcoming);
        setPastMeetings(past);
      }

      if (tErr) {
        alert("Could not load tasks: " + tErr.message);
        setTasks([]);
      } else {
        setTasks(t || []);
      }

      setLoadingMeetings(false);
      setLoadingTasks(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSaveMeeting(formValues) {
    if (!user) return;
    setSavingMeeting(true);

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
      setSavingMeeting(false);
      return;
    }

    try {
      try {
        await notifyMeetingParticipants(data);
      } catch (err) {
        console.error("notifyMeetingParticipants error:", err);
      }

      const todayStr = new Date().toISOString().slice(0, 10);

      // Put new meeting into the right bucket
      if (data.meeting_date === todayStr) {
        setTodayMeetings((prev) => [...prev, data]);
      } else if (data.meeting_date > todayStr) {
        setUpcomingMeetings((prev) => [...prev, data]);
      }

      setShowForm(false);
    } finally {
      setSavingMeeting(false);
    }
  }

  const today = new Date();
  const formattedToday = today.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const renderStatusBadge = (status) => {
    const base =
      "text-[11px] px-2 py-0.5 rounded-full border font-medium inline-flex items-center";
    if (status === "completed") {
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}>
          completed
        </span>
      );
    }
    if (status === "cancelled") {
      return (
        <span className={`${base} bg-rose-50 text-rose-600 border-rose-100`}>
          cancelled
        </span>
      );
    }
    return (
      <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>
        {status || "scheduled"}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
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

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card px-3 py-3">
          <p className="text-[11px] text-slate-500">Today</p>
          <p className="text-xl font-semibold text-panablue">
            {loadingMeetings ? "…" : todayMeetings.length}
          </p>
          <p className="text-[11px] text-slate-500">meetings</p>
        </div>
        <div className="card px-3 py-3">
          <p className="text-[11px] text-slate-500">Upcoming</p>
          <p className="text-xl font-semibold text-panared">
            {loadingMeetings ? "…" : upcomingMeetings.length}
          </p>
          <p className="text-[11px] text-slate-500">scheduled</p>
        </div>
        <div className="card px-3 py-3">
          <p className="text-[11px] text-slate-500">Pending tasks</p>
          <p className="text-xl font-semibold text-emerald-700">
            {loadingTasks ? "…" : tasks.length}
          </p>
          <p className="text-[11px] text-slate-500">follow-ups</p>
        </div>
        <div className="card px-3 py-3">
          <p className="text-[11px] text-slate-500">Today&apos;s date</p>
          <p className="text-sm font-semibold text-slate-800">
            {formattedToday}
          </p>
          <p className="text-[11px] text-slate-500">Stay on track</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {/* Meetings column */}
        <div className="card px-4 py-3 md:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Meetings
              </h2>
              <p className="text-xs text-slate-500">
                Today&apos;s meetings and upcoming sessions.
              </p>
            </div>
          </div>

          {/* Today’s meetings */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-700 mb-2">
              Today&apos;s meetings
            </h3>
            {loadingMeetings ? (
              <div className="py-3 text-xs text-slate-500">Loading...</div>
            ) : todayMeetings.length === 0 ? (
              <div className="py-3 text-xs text-slate-500">
                No meetings scheduled for today.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-auto">
                {todayMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="border border-slate-100 rounded-md px-3 py-2 flex flex-col gap-1 bg-white"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium text-slate-900">
                        {m.title}
                      </div>
                      <div className="flex items-center gap-2">
                        {m.start_time && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-panablue/5 text-panablue">
                            {m.start_time}
                          </span>
                        )}
                        {renderStatusBadge(m.status)}
                      </div>
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

          <hr className="border-slate-100 my-2" />

          {/* Upcoming meetings */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 mb-2">
              Upcoming meetings
            </h3>
            {loadingMeetings ? (
              <div className="py-3 text-xs text-slate-500">Loading...</div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="py-3 text-xs text-slate-500">
                No upcoming meetings scheduled.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-auto">
                {upcomingMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="border border-slate-100 rounded-md px-3 py-2 flex flex-col gap-1 bg-white"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium text-slate-900">
                        {m.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {m.meeting_date}
                          {m.start_time ? ` • ${m.start_time}` : ""}
                        </span>
                        {renderStatusBadge(m.status)}
                      </div>
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

          {/* Past meetings (recent) */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-slate-700 mb-2">
              Recent past meetings
            </h3>
            {loadingMeetings ? (
              <div className="py-3 text-xs text-slate-500">Loading...</div>
            ) : pastMeetings.length === 0 ? (
              <div className="py-3 text-xs text-slate-500">
                No past meetings recorded.
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-auto">
                {pastMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="border border-slate-100 rounded-md px-3 py-2 flex flex-col gap-1 bg-white"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium text-slate-900">
                        {m.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {m.meeting_date}
                        </span>
                        {renderStatusBadge(m.status)}
                      </div>
                    </div>
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
        </div>

        {/* Tasks + notes */}
        <div className="space-y-4 md:col-span-2">
          <div className="card px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Tasks & follow-ups
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Tasks & actions the secretary must not forget.
            </p>
            {loadingTasks ? (
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
                    <div className="flex flex-col items-end gap-1">
                      <span className="badge bg-panablue/5 text-panablue">
                        {t.assignee || "Secretary"}
                      </span>
                      {renderStatusBadge(t.status)}
                    </div>
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
              saving={savingMeeting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
