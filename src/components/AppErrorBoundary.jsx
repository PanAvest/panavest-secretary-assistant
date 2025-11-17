// src/components/AppErrorBoundary.jsx
import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log this to a service later if you want
    console.error("[AppErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReload = () => {
    // Simple way to reset the app state
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-soft px-4">
          <div className="max-w-md w-full bg-white shadow-sm rounded-lg p-4 space-y-3">
            <h1 className="text-sm font-semibold text-red-600">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-600">
              The secretary console hit an error while loading this page.
              You can try refreshing to continue.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md bg-panablue text-white hover:bg-panablue/90"
            >
              Refresh dashboard
            </button>
            <p className="text-[10px] text-slate-400">
              If this keeps happening, tell Kennedy that the app error boundary
              is catching an exception so it can be checked.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
