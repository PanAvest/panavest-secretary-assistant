// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { CalendarDays, ClipboardList, Home, Users } from "lucide-react";
import logo from "../assets/panavest-logo.png"; // <-- add this

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/tasks", label: "Tasks & Follow-ups", icon: ClipboardList },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/contacts", label: "Contacts", icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-100 shadow-soft/40">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-soft flex items-center justify-center overflow-hidden">
          <img
            src={logo}
            alt="PanAvest logo"
            className="h-9 w-auto object-contain"
          />
        </div>
        <div>
          <div className="text-sm font-semibold text-panablue">PanAvest</div>
          <div className="text-xs text-slate-500">Secretary Assistant</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-panablue text-white shadow-soft"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 pb-4 mt-auto">
        <div className="card px-3 py-3 text-xs text-slate-500">
          <div className="font-semibold text-slate-700 mb-1">Tip</div>
          Use this space to keep Prof&apos;s day organised: meetings, notes and
          follow-ups in one view.
        </div>
      </div>
    </aside>
  );
}
