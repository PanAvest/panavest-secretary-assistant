import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { CheckCircle2, Circle, PlusCircle } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

const defaultForm = {
  title: "",
  assignee: "",
  due_date: "",
  notes: "",
};

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function sortTasks(list) {
    return [...list].sort((a, b) => {
      if (a.status === b.status) {
        return (a.due_date || "").localeCompare(b.due_date || "");
      }
      return a.status === "pending" ? -1 : 1;
    });
  }

  async function loadTasks() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("owner_id", user.id)
      .order("status", { ascending: true })
      .order("due_date", { ascending: true });
    if (error) {
      // eslint-disable-next-line no-alert
      alert("Could not load tasks: " + error.message);
    } else {
      setTasks(sortTasks(data || []));
    }
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = { ...form, owner_id: user.id, status: "pending" };
    const { data, error } = await supabase
      .from("tasks")
      .insert(payload)
      .select()
      .single();
    setSaving(false);

    if (error) {
      // eslint-disable-next-line no-alert
      alert("Could not save task: " + error.message);
      return;
    }

    setTasks((prev) => sortTasks([...prev, data]));
    setForm(defaultForm);
  }

  async function toggleStatus(task) {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", task.id)
      .select()
      .single();
    if (error) {
      // eslint-disable-next-line no-alert
      alert("Could not update task: " + error.message);
      return;
    }
    setTasks((prev) =>
      sortTasks(prev.map((t) => (t.id === task.id ? data : t)))
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-panablue">
            Tasks & follow-ups
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Keep track of what must be done after meetings or during the week.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <div className="card px-4 py-4 md:col-span-3">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            All tasks
          </h2>
          {loading ? (
            <div className="py-4 text-sm text-slate-500">Loading...</div>
          ) : !tasks.length ? (
            <div className="py-4 text-sm text-slate-500">
              No tasks yet. Use the form on the right to add your first follow-up.
            </div>
          ) : (
            <ul className="space-y-2 max-h-[60vh] overflow-auto">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-slate-50"
                >
                  <button
                    onClick={() => toggleStatus(t)}
                    className="mt-0.5 h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center"
                  >
                    {t.status === "completed" ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <Circle size={14} className="text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div
                      className={[
                        "text-xs font-medium",
                        t.status === "completed"
                          ? "text-slate-400 line-through"
                          : "text-slate-800",
                      ].join(" ")}
                    >
                      {t.title}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {t.due_date && (
                        <span className="badge bg-slate-100 text-slate-600">
                          Due {t.due_date}
                        </span>
                      )}
                      <span className="badge bg-panablue/5 text-panablue">
                        {t.assignee || "Secretary"}
                      </span>
                      <span className="badge bg-slate-50 text-slate-500">
                        {t.status}
                      </span>
                    </div>
                    {t.notes && (
                      <div className="text-[11px] text-slate-500 mt-1">
                        {t.notes}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card px-4 py-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <PlusCircle size={16} />
            New task / follow-up
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Task
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                placeholder="Email KDS supplier about invoice..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Assignee
                </label>
                <input
                  name="assignee"
                  value={form.assignee}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                  placeholder="Secretary / Kennedy / Prof..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Due date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                placeholder="Extra context (which meeting, which document, etc.)"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full justify-center"
            >
              {saving ? "Saving..." : "Save task"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
