/**
 * ErrorBoundary - Prevents white screen crashes in React apps
 *
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of a blank white screen.
 *
 * Essential for JUCE WebView plugins where a crash means an unusable plugin.
 *
 * @example
 * ```tsx
 * // In main.tsx
 * ReactDOM.createRoot(root).render(
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 * );
 * ```
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { colors } from '../../theme/tokens';

export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Custom fallback UI (optional) */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            background: colors.bg.base,
            color: colors.accent.coral,
            padding: 40,
            fontFamily: 'var(--font-mono), monospace',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ margin: 0, marginBottom: 16, color: colors.text.primary }}>
            Something went wrong
          </h2>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              color: colors.text.muted,
              maxWidth: 600,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            {this.state.error?.message}
          </pre>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '12px 24px',
              background: colors.bg.elevated,
              color: colors.text.primary,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 14,
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
