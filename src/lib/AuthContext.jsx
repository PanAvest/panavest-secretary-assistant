// src/lib/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { initOneSignal, identifyUser } from "./oneSignalClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadInitial() {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        await loadProfile(nextUser);
      } else {
        setProfile(null);
      }

      setLoading(false);
    }

    loadInitial();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        loadProfile(nextUser);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 🔔 Initialize OneSignal + link logged-in user
  useEffect(() => {
    async function setupPush() {
      await initOneSignal();
      if (user?.email) {
        await identifyUser(user.email);
      }
    }
    setupPush();
  }, [user]);

  async function loadProfile(u) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();
    if (data) setProfile(data);
  }

  const value = { user, profile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
