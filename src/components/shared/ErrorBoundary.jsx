import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
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
    if (import.meta.env.DEV) console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    const role = localStorage.getItem('role');
    const dest = role === 'teacher' ? '/teacher/home'
               : role === 'parent'  ? '/parent/home'
               : role === 'admin'   ? '/admin/dashboard'
               : '/login';
    window.location.href = dest;
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
            <p className="text-text/60 mb-6">Something went wrong. Please try again.</p>
            <div className="flex gap-3">
              <Button variant="outline" icon={Home} onClick={this.handleGoHome} className="flex-1">
                Go Home
              </Button>
              <Button variant="primary" icon={RefreshCw} onClick={this.handleReset} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
