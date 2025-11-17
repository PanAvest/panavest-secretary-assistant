// src/components/MeetingList.jsx
import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function MeetingList({
  meetings,
  loading = false,
  onEdit,
  onDelete,
}) {
  const items = Array.isArray(meetings) ? meetings : [];

  if (loading) {
    return <p className="text-sm text-gray-500">Loading meetings…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No meetings scheduled yet. Click <strong>New Meeting</strong> to create
        one.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((m) => (
        <div
          key={m.id}
          className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-white"
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm md:text-base">{m.title}</h3>
              {m.meeting_date && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {m.meeting_date} {m.start_time ? `• ${m.start_time}` : ""}
                </span>
              )}
              {m.status && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {m.status}
                </span>
              )}
            </div>

            {m.venue && (
              <p className="text-xs text-gray-600 mt-1">Venue: {m.venue}</p>
            )}

            {m.agenda && (
              <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                {m.agenda}
              </p>
            )}

            {m.attendees_text && (
              <p className="text-[11px] text-gray-500 mt-1">
                Attendees: {m.attendees_text}
              </p>
            )}

            {Array.isArray(m.participant_emails) &&
              m.participant_emails.length > 0 && (
                <p className="text-[11px] text-gray-500 mt-1">
                  Notified: {m.participant_emails.length} participant
                  {m.participant_emails.length > 1 ? "s" : ""}
                </p>
              )}
          </div>

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(m)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-md hover:bg-gray-50"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(m.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
