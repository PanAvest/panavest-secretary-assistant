import React, { useState } from "react";

const defaultForm = {
  title: "",
  meeting_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  agenda: "",
  comments: "",
  attendees_text: "",
  participant_emails: "",
};

export default function MeetingForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial ? { ...defaultForm, ...initial } : defaultForm);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const attendees =
      form.attendees_text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    onSave({ ...form, attendees });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            placeholder="Boardroom Governance sync with Prof"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input
              type="date"
              name="meeting_date"
              value={form.meeting_date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Start time</label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">End time</label>
          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Venue</label>
          <input
            name="venue"
            value={form.venue}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            placeholder="PanAvest Office, East Legon / Zoom"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Agenda / Purpose</label>
          <textarea
            name="agenda"
            value={form.agenda}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            placeholder="Discuss KDS launch timeline, tasks and responsibilities."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Comments / Notes (quick)</label>
          <textarea
            name="comments"
            value={form.comments}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
            placeholder="Key points or reminders for the secretary."
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          With whom (names, comma separated)
        </label>
        <input
          name="attendees_text"
          value={form.attendees_text}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
          placeholder="Prof Douglas, Kennedy, Najat..."
        />
        <p className="text-[11px] text-slate-500 mt-1">
          Names only for quick reference. Detailed contacts can be managed on the Contacts page.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Internal participants emails (optional)
        </label>
        <input
          name="participant_emails"
          value={form.participant_emails}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
          placeholder="prof@example.com, secretary@example.com"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          If any of these emails belong to users with accounts, the meeting will also show on their dashboard.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save meeting"}
        </button>
      </div>
    </form>
  );
}
