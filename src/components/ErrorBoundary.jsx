import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a friendly fallback UI instead of crashing the app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AttendTrack Application Crash caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      window.localStorage.clear();
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--color-canvas, #F7F6F2)',
          color: 'var(--color-text, #202034)',
          fontFamily: 'sans-serif',
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--color-surface, #FFFFFF)',
            padding: '2.5rem 2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 48px -12px rgba(23, 23, 43, 0.1)',
            border: '1px solid var(--color-border, #E2E8F0)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 1.25rem',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-soft, #64748B)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              AttendTrack encountered an unexpected UI error. Your local attendance records are safely stored.
            </p>

            {this.state.error && (
              <pre style={{
                background: 'var(--color-surface-sunken, #F1F5F9)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                color: '#EF4444',
              }}>
                {this.state.error.toString()}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  background: 'var(--color-primary, #7357F6)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 650,
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                }}
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleResetState}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: 'var(--color-text-soft, #64748B)',
                  border: '1px solid var(--color-border, #CBD5E1)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                }}
              >
                Reset App Data
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
