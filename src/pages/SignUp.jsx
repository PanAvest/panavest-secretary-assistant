// src/pages/SignUp.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/panavest-logo.png";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
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

    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (err) {
      setLoading(false);
      setError(err.message);
      return;
    }

    // inside handleSubmit in SignUp.jsx
const user = data.user;
if (user) {
  await supabase.from("profiles").insert({
    id: user.id,
    full_name: form.full_name,
    email: form.email.toLowerCase(),
  });
}


    setLoading(false);
    navigate("/dashboard", { replace: true });
  }

return (
  <div className="w-full min-h-screen flex items-center justify-center bg-soft px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white/95 border border-slate-100 rounded-2xl shadow-soft px-6 py-7 sm:px-7 sm:py-8">
        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden mb-2">
            <img
              src={logo}
              alt="PanAvest logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="text-xs font-semibold tracking-[0.12em] uppercase text-slate-400">
            PanAvest
          </div>
          <div className="text-sm font-semibold text-slate-800">
            Secretary Assistant Console
          </div>
        </div>

        <h1 className="text-lg font-semibold text-slate-900 mb-1 text-center">
          Create account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-5 text-center">
          Each account has its own meetings, tasks and contacts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Full name
            </label>
            <input
              name="full_name"
              required
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40 focus:border-panablue/40 bg-white"
              placeholder="Office Secretary / Prof Douglas"
            />
          </div>
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
            className="btn-primary w-full justify-center mt-1"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-[11px] sm:text-xs text-slate-500 mt-5 text-center">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-panablue font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
