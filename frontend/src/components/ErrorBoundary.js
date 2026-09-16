import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went unexpectedly wrong</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              We encountered an issue loading this section. Your data is safe. Please try refreshing or returning to the homepage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-[#0f4c3a] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#0c3c2e] transition shadow-sm"
              >
                Try Again
              </button>
              <a
                href="/"
                className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200 transition"
              >
                Go to Homepage
              </a>
            </div>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-red-50 text-red-700 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                  {this.state.error?.toString() || 'Unknown runtime error'}
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

export default ErrorBoundary;
