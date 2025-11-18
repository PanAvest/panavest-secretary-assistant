// src/components/TopBar.jsx
import React, { useEffect, useState } from "react";
import { Menu, Bell, LogOut, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "../lib/oneSignalClient";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tasks", label: "Tasks & Follow-ups" },
  { to: "/meetings", label: "Meetings" },
  { to: "/contacts", label: "Contacts" },
];

export default function TopBar() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [permission, setPermission] = useState("default");
  const [mobileOpen, setMobileOpen] = useState(false);
  const pushEnabled = permission === "granted";
  const pushDenied = permission === "denied";

  useEffect(() => {
    let active = true;
    getNotificationPermission().then((status) => {
      if (active) setPermission(status);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleNotifications() {
    const next = await requestNotificationPermission();
    setPermission(next);
    if (next === "granted" && typeof Notification !== "undefined") {
      new Notification("Push enabled", {
        body: "You will now get meeting + task reminders on this device.",
      });
    }
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
              className={[
                "h-9 w-9 rounded-full border flex items-center justify-center active:scale-[0.97] transition",
                pushEnabled
                  ? "border-emerald-200 bg-emerald-50"
                  : pushDenied
                  ? "border-rose-200 bg-rose-50"
                  : "border-slate-200 bg-white",
              ].join(" ")}
              onClick={handleNotifications}
              title={
                pushEnabled
                  ? "Push notifications on – tap to re-check"
                  : pushDenied
                  ? "Notifications blocked in browser settings"
                  : "Enable meeting reminders"
              }
            >
              <Bell
                size={16}
                className={
                  pushEnabled
                    ? "text-emerald-700"
                    : pushDenied
                    ? "text-rose-600"
                    : "text-panablue"
                }
              />
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
