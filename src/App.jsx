// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import Tasks from "./pages/Tasks";
import Contacts from "./pages/Contacts";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { initOneSignal } from "./lib/oneSignalClient";
import AppErrorBoundary from "./components/AppErrorBoundary";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

function AppShell() {
  useEffect(() => {
    initOneSignal();
  }, []);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/meetings" element={<Meetings />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppErrorBoundary>
        <AppShell />
      </AppErrorBoundary>
    </AuthProvider>
  );
}
