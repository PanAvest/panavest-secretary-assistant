import React from "react";
import { Menu } from "lucide-react";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 bg-soft/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
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
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs text-slate-500">Signed in as</span>
            <span className="text-sm font-medium text-slate-800">Office Secretary</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-panared text-white flex items-center justify-center text-xs font-semibold">
            OS
          </div>
        </div>
      </div>
    </header>
  );
}
