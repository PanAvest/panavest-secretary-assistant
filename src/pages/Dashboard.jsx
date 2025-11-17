import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PlusCircle } from "lucide-react";
import MeetingForm from "../components/MeetingForm";
import MeetingList from "../components/MeetingList";

export default function Dashboard() {
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    async function load() {
      setLoading(true);
      const [{ data: m }, { data: t }] = await Promise.all([
        supabase
          .from("meetings")
          .select("*")
          .eq("meeting_date", today)
          .order("start_time", { ascending: true }),
        supabase
          .from("tasks")
          .select("*")
          .eq("status", "pending")
          .order("due_date", { ascending: true }),
      ]);
      setTodayMeetings(m || []);
      setTasks(t || []);
      setLoading(false);
    }

    load();
  }, []);

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
          ) : (
            <MeetingList items={todayMeetings} />
          )}
        </div>

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
            ) : !tasks.length ? (
              <div className="py-4 text-xs text-slate-500">
                No pending tasks. You&apos;re up to date 🎉
              </div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-2">
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
              Use the Meetings page for detailed notes per meeting. This can be extended later with
              a quick notepad if needed.
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
