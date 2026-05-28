import { Component } from 'react';
import { Button } from './ui/button';

/**
 * Top-level error boundary. Catches uncaught render errors and shows
 * a safe fallback instead of a blank white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for debugging; swap for a real error-reporting service if needed
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#09090B] text-foreground p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-muted-foreground text-sm max-w-sm mb-8">
            An unexpected error occurred. Your data is safe — try reloading the page.
          </p>
          <Button onClick={this.handleReload} className="bg-primary text-primary-foreground">
            Reload App
          </Button>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="mt-8 text-xs text-red-400 text-left max-w-xl overflow-x-auto bg-red-900/20 p-4 rounded-xl">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
