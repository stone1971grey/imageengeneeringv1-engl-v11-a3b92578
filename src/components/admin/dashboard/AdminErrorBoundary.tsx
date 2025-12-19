import { Component, type ErrorInfo, type ReactNode } from "react";

interface AdminErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class AdminDashboardErrorBoundary extends Component<
  { children: ReactNode },
  AdminErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AdminDashboard ErrorBoundary] Caught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
          <div className="max-w-xl text-center space-y-4">
            <h1 className="text-2xl font-semibold">Editor error on this page</h1>
            <p className="text-sm text-gray-600">
              The CMS editor crashed while loading this page configuration.
              You can switch to another page in the CMS-UP selector and continue working.
            </p>
            {this.state.message && (
              <p className="text-xs text-gray-400 break-words">
                Technical info: {this.state.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
