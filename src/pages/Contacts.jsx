import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PlusCircle } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

const defaultForm = {
  name: "",
  role: "",
  organisation: "",
  email: "",
  phone: "",
  notes: "",
};

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadContacts() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("owner_id", user.id)
      .order("name", { ascending: true });
    if (error) {
      // eslint-disable-next-line no-alert
      alert("Could not load contacts: " + error.message);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = { ...form, owner_id: user.id };
    const { data, error } = await supabase
      .from("contacts")
      .insert(payload)
      .select()
      .single();
    setSaving(false);

    if (error) {
      // eslint-disable-next-line no-alert
      alert("Could not save contact: " + error.message);
      return;
    }

    setContacts((prev) => [...prev, data]);
    setForm(defaultForm);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-panablue">
            Contacts
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Key people the secretary interacts with regularly.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <div className="card px-4 py-4 md:col-span-3">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            All contacts
          </h2>
          {loading ? (
            <div className="py-4 text-sm text-slate-500">Loading...</div>
          ) : !contacts.length ? (
            <div className="py-4 text-sm text-slate-500">
              No contacts yet. Add at least Prof, key partners, and suppliers.
            </div>
          ) : (
            <ul className="space-y-2 max-h-[60vh] overflow-auto">
              {contacts.map((c) => (
                <li
                  key={c.id}
                  className="px-3 py-2 rounded-xl hover:bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {c.role && <>{c.role} • </>}
                      {c.organisation}
                    </div>
                    {c.notes && (
                      <div className="text-[11px] text-slate-500 mt-1">
                        {c.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex flex-col items-start md:items-end">
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span>{c.phone}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card px-4 py-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <PlusCircle size={16} />
            Add contact
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Name
              </label>
              <input
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                placeholder="Prof Douglas, Kennedy, supplier, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Role
                </label>
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                  placeholder="Chairman, CEO, Supplier..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Organisation
                </label>
                <input
                  name="organisation"
                  value={form.organisation}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                  placeholder="PanAvest, MYO, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-panablue/40"
                placeholder="Relationship, preferences, context..."
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full justify-center"
            >
              {saving ? "Saving..." : "Save contact"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
