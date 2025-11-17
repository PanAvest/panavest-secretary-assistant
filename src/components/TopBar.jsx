// src/components/TopBar.jsx
import React, { useState } from "react";
import { Menu, Bell, LogOut, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/meetings", label: "Meetings" },
  { to: "/tasks", label: "Tasks & Follow-ups" },
  { to: "/contacts", label: "Contacts" },
];

export default function TopBar() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  async function requestNotifications() {
    if (typeof Notification === "undefined") {
      alert("Browser notifications are not supported on this device.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      new Notification("Notifications enabled", {
        body: "You will receive reminders while this tab is open.",
      });
    }
  }

  function testNotification() {
    if (typeof Notification === "undefined") {
      alert("Browser notifications are not supported on this device.");
      return;
    }
    if (Notification.permission !== "granted") {
      alert("Please allow notifications to receive reminders.");
      return;
    }
    new Notification("PanAvest Secretary Assistant", {
      body: "This is a sample reminder notification.",
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/sign-in", { replace: true });
  }

  const displayName = profile?.full_name || user?.email || "PanAvest User";

  return (
    <>
      <header className="sticky top-0 z-20 bg-soft/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          {/* LEFT SIDE — Brand & Menu */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white active:scale-[0.97] transition"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">
                PanAvest Office
              </div>
              <div className="text-sm md:text-base font-semibold text-panablue">
                Daily Secretary Console
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Profile + Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Signed in name (desktop) */}
            <div className="hidden md:flex flex-col text-right pr-2">
              <span className="text-xs text-slate-500">Signed in as</span>
              <span className="text-sm font-medium text-slate-800">
                {displayName}
              </span>
            </div>

            {/* Notification button */}
            <button
              type="button"
              className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center active:scale-[0.97] transition"
              onClick={
                permission === "granted" ? testNotification : requestNotifications
              }
              title={
                permission === "granted"
                  ? "Test notification"
                  : "Enable notifications"
              }
            >
              <Bell size={16} className="text-panablue" />
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 active:scale-[0.97] transition"
            >
              <LogOut size={16} className="text-rose-600" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/30"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 left-0 h-full w-72 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Signed in as</span>
                <span className="text-sm font-medium text-slate-800 truncate max-w-[160px]">
                  {displayName}
                </span>
              </div>
              <button
                type="button"
                className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center active:scale-[0.97] transition"
                onClick={() => setMobileOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex-1 px-2 py-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center px-3 py-2 rounded-xl text-sm font-medium",
                      isActive
                        ? "bg-panablue text-white shadow-soft"
                        : "text-slate-700 hover:bg-slate-100",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="px-3 pb-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-[0.97] transition"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
