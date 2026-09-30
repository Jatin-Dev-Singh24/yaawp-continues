// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  declare state: ErrorBoundaryState;
  declare setState: (
    state: Partial<ErrorBoundaryState> | ((prevState: ErrorBoundaryState) => Partial<ErrorBoundaryState>),
    callback?: () => void
  ) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/app/home';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="route-error-boundary"
          className="min-h-[400px] w-full flex-1 flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
                {this.props.fallbackMessage ||
                  'An unexpected error occurred while loading this section. You can try refreshing or returning to your feed.'}
              </p>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-left overflow-x-auto max-h-32 text-[11px] font-mono text-rose-600 dark:text-rose-400">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                id="error-boundary-retry-btn"
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                id="error-boundary-home-btn"
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
