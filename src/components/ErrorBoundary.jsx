import { Component } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Global ErrorBoundary — the outermost boundary around the app (mounted in main.jsx).
 * Catches any uncaught render error so a single broken subtree can't white-screen
 * the whole SPA. Presents a calm recovery panel with Reload / Try again.
 * Self-contained: no design-system dependency beyond the shared Button.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log for diagnostics; a real error reporter could hook in here.
    console.error('Uncaught render error:', error, info);
  }

  handleReset() {
    this.setState({ hasError: false });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page hit an unexpected error. You can reload the app or try again — your data is safe.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button onClick={() => window.location.reload()}>Reload</Button>
            <Button variant="outline" onClick={this.handleReset}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
