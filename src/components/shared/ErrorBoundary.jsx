import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

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

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-text mb-2">Oops! Something went wrong</h1>

            <p className="text-text/60 mb-4">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            <div className="bg-red-50 rounded-lg p-3 mb-6 text-left max-h-32 overflow-auto">
              <p className="text-xs font-mono text-red-700 whitespace-pre-wrap">
                {this.state.error?.stack?.substring(0, 300)}...
              </p>
            </div>

            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={this.resetError}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
