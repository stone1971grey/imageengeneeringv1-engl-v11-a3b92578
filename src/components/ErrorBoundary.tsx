import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
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

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Admin ErrorBoundary caught error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-xl w-full border border-destructive/40 bg-destructive/5 rounded-xl p-6 space-y-3">
            <h1 className="text-lg font-semibold text-destructive">
              Admin dashboard error – the editor crashed instead of showing an error message.
            </h1>
            <p className="text-sm text-muted-foreground">
              Please copy the context of your last action (e.g. which segment and which button you used) and send it in chat.
            </p>
            {this.state.error && (
              <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-background/80 border border-border px-3 py-2 text-xs text-muted-foreground whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
