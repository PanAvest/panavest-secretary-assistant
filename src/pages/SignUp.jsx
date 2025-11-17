// src/pages/SignUp.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

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

    const user = data.user;
    if (user) {
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: form.full_name,
      });
    }

    setLoading(false);
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft px-4 py-8">
      <div className="card w-full max-w-sm sm:max-w-md px-5 sm:px-6 py-6 sm:py-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-panablue text-white flex items-center justify-center text-sm font-semibold">
            PA
          </div>
          <div>
            <div className="text-sm font-semibold text-panablue">PanAvest</div>
            <div className="text-xs text-slate-500">Secretary Assistant</div>
          </div>
        </div>

        <h1 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">
          Create account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Each account has its own meetings, tasks and contacts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Full name
            </label>
            <input
              name="full_name"
              required
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
              placeholder="Office Secretary / Prof Douglas"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
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
            className="btn-primary w-full justify-center"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-[11px] sm:text-xs text-slate-500 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-panablue font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
