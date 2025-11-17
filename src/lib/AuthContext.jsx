// src/lib/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { OneSignal } from "./oneSignalClient";

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
        // link OneSignal to this user
        try {
          OneSignal.login(nextUser.id);
        } catch (e) {
          console.warn("OneSignal login failed", e);
        }
      } else {
        setProfile(null);
        try {
          OneSignal.logout();
        } catch (e) {
          console.warn("OneSignal logout failed", e);
        }
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
        try {
          OneSignal.login(nextUser.id);
        } catch (e) {
          console.warn("OneSignal login failed", e);
        }
      } else {
        setProfile(null);
        try {
          OneSignal.logout();
        } catch (e) {
          console.warn("OneSignal logout failed", e);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
