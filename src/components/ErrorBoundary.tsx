import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070709] text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#111115] border border-white/15 space-y-4">
            <h1 className="font-display text-2xl font-semibold text-zinc-50">
              Something went wrong
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              ReelHouse encountered an application error. Reload the page to restore your session.
            </p>
            <p className="text-xs font-mono text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-[#F2B705] text-[#070709] text-xs font-semibold hover:bg-[#f7c52b] transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
