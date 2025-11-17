// src/pages/SignIn.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/panavest-logo.png";

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-5xl bg-white/90 border border-slate-100 rounded-2xl shadow-soft overflow-hidden grid md:grid-cols-2">
        {/* Brand / Left panel */}
        <div className="hidden md:flex flex-col justify-between bg-panablue text-white px-8 py-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
                <img
                  src={logo}
                  alt="PanAvest logo"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide uppercase">
                  PanAvest
                </div>
                <div className="text-xs text-white/70">
                  Secretary Assistant Console
                </div>
              </div>
            </div>
            <h1 className="text-xl font-semibold mb-3">
              Keep Prof&apos;s day perfectly organised.
            </h1>
            <p className="text-sm text-slate-100/80 leading-relaxed">
              Centralise meetings, tasks, follow-ups and contacts in one
              clean workspace designed for the PanAvest office.
            </p>
          </div>
          <div className="text-[11px] text-white/60 mt-8">
            Tip: Use your official PanAvest email so invited meetings can
            automatically appear on your console.
          </div>
        </div>

        {/* Form / Right panel */}
        <div className="px-6 sm:px-8 py-7 flex flex-col justify-center">
          {/* Mobile logo/header */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
              <img
                src={logo}
                alt="PanAvest logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-panablue">
                PanAvest
              </div>
              <div className="text-xs text-slate-500">
                Secretary Assistant Console
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Sign in
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-5">
            Access your dashboard, meetings, tasks and contacts.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40 focus:border-panablue/40 bg-white"
                placeholder="you@panavest.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40 focus:border-panablue/40 bg-white"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-[11px] sm:text-xs text-slate-500 mt-5 text-center">
            Don&apos;t have an account?{" "}
            <Link to="/sign-up" className="text-panablue font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
