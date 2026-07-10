// ============================================
// FILE: src/components/common/ErrorBoundary.jsx
// MÔ TẢ: Component bắt lỗi React
// ============================================

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-4">😱</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Có lỗi xảy ra
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.
            </p>
            <button onClick={this.handleReload} className="btn-primary">
              Tải lại trang
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left">
                <details className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                    Chi tiết lỗi (Development)
                  </summary>
                  <pre className="mt-2 text-sm text-red-600 dark:text-red-400 overflow-auto max-h-60">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;