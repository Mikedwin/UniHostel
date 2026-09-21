import React from 'react';
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

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
        <div className="unihostel-error-boundary">
          <div className="unihostel-error-panel">
            <div className="unihostel-error-mark"><AlertTriangle aria-hidden="true" /></div>
            <p className="unihostel-error-label">A brief interruption</p>
            <h1>We could not open this part of UniHostel.</h1>
            <p>
              Your account and saved details are safe. Try this page again, or return home and continue from there.
            </p>
            <div className="unihostel-error-actions">
              <button
                onClick={this.handleReset}
                className="unihostel-error-retry"
              >
                <RotateCcw aria-hidden="true" /> Try again
              </button>
              <a
                href="/"
                className="unihostel-error-home"
              >
                Return home <ArrowRight aria-hidden="true" />
              </a>
            </div>
            {this.state.error && (
              <details className="unihostel-error-details">
                <summary>
                  Technical Details
                </summary>
                <pre>
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
