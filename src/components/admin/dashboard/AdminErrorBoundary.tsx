import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AdminErrorBoundaryState {
  hasError: boolean;
  message?: string;
  stack?: string;
}

export class AdminDashboardErrorBoundary extends Component<
  { children: ReactNode },
  AdminErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: undefined, stack: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message, stack: error.stack };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AdminDashboard ErrorBoundary] Caught render error:', error, info);
    console.error('[AdminDashboard ErrorBoundary] Component stack:', info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    // Navigate to admin dashboard without page parameter
    window.location.href = window.location.pathname.replace(/\?.*/, '');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
          <div className="max-w-xl text-center space-y-4">
            <h1 className="text-2xl font-semibold text-red-600">Editor error on this page</h1>
            <p className="text-sm text-gray-600">
              The CMS editor crashed while loading this page configuration.
              You can try reloading the page or switch to another page in the CMS.
            </p>
            {this.state.message && (
              <div className="text-left bg-gray-100 p-4 rounded-md">
                <p className="text-xs font-semibold text-gray-500 mb-1">Error message:</p>
                <p className="text-sm text-red-600 font-mono break-words">
                  {this.state.message}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={this.handleReload} variant="default">
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                Go to CMS Home
              </Button>
            </div>
            {this.state.stack && (
              <details className="text-left mt-4">
                <summary className="text-xs text-gray-400 cursor-pointer">Technical details</summary>
                <pre className="text-xs text-gray-400 break-words whitespace-pre-wrap mt-2 bg-gray-50 p-2 rounded max-h-40 overflow-auto">
                  {this.state.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
