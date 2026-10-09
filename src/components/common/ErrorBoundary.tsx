import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Car 911] Uncaught UI render error:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#1a1c20] border border-white/10 rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#e11d48]/10 border border-[#e11d48]/30 flex items-center justify-center text-[#ffb4ab]">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#ffb3b6]">
                Telemetry Render Interruption
              </span>
              <h2 className="text-xl font-headline font-bold text-white">
                {this.props.fallbackTitle || 'Component Failed to Load'}
              </h2>
            </div>
            <p className="text-sm text-[#b9c8de] leading-relaxed">
              An unexpected client render state occurred. Telemetry state and navigation controls remain protected.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReload}
                leftIcon={<span className="material-symbols-outlined text-[16px]">refresh</span>}
              >
                Restore Component
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.location.reload()}
              >
                Reload App
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
