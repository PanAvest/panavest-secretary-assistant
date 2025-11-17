// src/components/MeetingList.jsx
import React from "react";

export default function MeetingList({ items, onSelect, onEdit, onDelete }) {
  if (!items.length) {
    return (
      <div className="card px-4 py-6 flex flex-col items-center justify-center text-center">
        <div className="text-sm font-semibold text-slate-700 mb-1">
          No meetings yet
        </div>
        <p className="text-xs text-slate-500 max-w-xs">
          Use the <span className="font-medium">New meeting</span> button to add
          Prof&apos;s schedule for the day or week.
        </p>
      </div>
    );
  }

  return (
    <div className="card divide-y divide-slate-100">
      {items.map((m) => (
        <div
          key={m.id}
          className="w-full px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-slate-50"
        >
          <button
            type="button"
            onClick={() => onSelect?.(m)}
            className="text-left flex-1"
          >
            <div className="text-sm font-semibold text-slate-800">
              {m.title}
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap gap-1">
              <span>
                {m.meeting_date} • {m.start_time?.slice(0, 5)}
                {m.end_time ? `–${m.end_time.slice(0, 5)}` : ""}
              </span>
              {m.venue && (
                <>
                  <span>•</span>
                  <span>{m.venue}</span>
                </>
              )}
            </div>
            {m.agenda && (
              <div className="mt-1 text-xs text-slate-600 line-clamp-2">
                {m.agenda}
              </div>
            )}
          </button>

          <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
            <span
              className={[
                "badge",
                m.status === "completed"
                  ? "bg-emerald-50 text-emerald-700"
                  : m.status === "cancelled"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-panablue/5 text-panablue",
              ].join(" ")}
            >
              {m.status || "scheduled"}
            </span>

            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                className="text-panablue hover:underline"
                onClick={() => onEdit?.(m)}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-rose-600 hover:underline"
                onClick={() => onDelete?.(m)}
              >
                Delete
              </button>
            </div>

            {m.attendees && m.attendees.length > 0 && (
              <span className="text-[11px] text-slate-500">
                With {m.attendees.slice(0, 2).join(", ")}
                {m.attendees.length > 2 ? ` +${m.attendees.length - 2}` : ""}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
