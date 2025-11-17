import React, { useState } from "react";
import { Menu, Bell, LogOut } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  async function requestNotifications() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      new Notification("Notifications enabled", {
        body: "You will receive reminders while this tab is open.",
      });
    }
  }

  function testNotification() {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    new Notification("PanAvest Secretary Assistant", {
      body: "This is a sample reminder notification.",
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/sign-in", { replace: true });
  }

  const displayName =
    profile?.full_name || user?.email || "PanAvest User";

  return (
    <header className="sticky top-0 z-20 bg-soft/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        {/* LEFT SIDE — Brand & Menu */}
        <div className="flex items-center gap-3">
          <button className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white">
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
            className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center"
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
            onClick={handleSignOut}
            title="Sign out"
            className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 transition"
          >
            <LogOut size={16} className="text-rose-600" />
          </button>

        </div>
      </div>
    </header>
  );
}
