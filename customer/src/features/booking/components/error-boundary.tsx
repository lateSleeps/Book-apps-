'use client';

import { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen p-s20">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-s20">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-s12">Terjadi Kesalahan</h2>
              <p className="text-gray-600 mb-s24">{this.state.error?.message || 'Sesuatu yang tidak terduga terjadi.'}</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-900 text-white rounded-lg py-s12 px-s16 font-semibold hover:bg-gray-800 transition-colors"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
