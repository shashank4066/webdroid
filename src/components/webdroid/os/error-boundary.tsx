'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  fallbackTitle?: string;
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-[#0a0e0c] text-zinc-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-[14px] font-semibold text-white">
            {this.props.fallbackTitle ?? 'Application Error'}
          </h3>
          <p className="mt-1 text-[11px] text-zinc-400 max-w-[240px] leading-relaxed">
            {this.state.error?.message ?? 'An unexpected error occurred in this view.'}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-4 flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 text-[11.5px] font-medium transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

