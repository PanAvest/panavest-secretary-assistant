import React from "react";

export default function MeetingList({ items, onSelect }) {
  if (!items.length) {
    return (
      <div className="card px-4 py-6 flex flex-col items-center justify-center text-center">
        <div className="text-sm font-semibold text-slate-700 mb-1">No meetings yet</div>
        <p className="text-xs text-slate-500 max-w-xs">
          Use the <span className="font-medium">New meeting</span> button to add Prof&apos;s schedule for the day or week.
        </p>
      </div>
    );
  }

  return (
    <div className="card divide-y divide-slate-100">
      {items.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect?.(m)}
          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
        >
          <div>
            <div className="text-sm font-semibold text-slate-800">{m.title}</div>
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
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
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
            {m.attendees && m.attendees.length > 0 && (
              <span className="text-[11px] text-slate-500">
                With {m.attendees.slice(0, 2).join(", ")}
                {m.attendees.length > 2 ? ` +${m.attendees.length - 2}` : ""}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
