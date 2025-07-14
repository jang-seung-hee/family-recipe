import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅 필요시 여기에 추가
    // console.error(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-minimal-blue">
          <h1 className="text-2xl font-bold mb-4">문제가 발생했습니다</h1>
          <p className="mb-6">예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
          <div className="flex gap-4">
            <button
              className="bg-minimal-blue text-white px-4 py-2 rounded-xl shadow-minimal-btn hover:scale-105 transition-all"
              onClick={this.handleReset}
            >
              다시 시도
            </button>
            <Link
              to="/"
              className="bg-minimal-blueLight text-minimal-blue px-4 py-2 rounded-xl shadow-minimal-btn hover:scale-105 transition-all"
            >
              홈으로 이동
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 