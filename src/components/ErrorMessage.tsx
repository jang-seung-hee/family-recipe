import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-between">
    <span>{message}</span>
    {onRetry && (
      <button
        className="ml-4 px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 font-semibold"
        onClick={onRetry}
      >
        다시 시도
      </button>
    )}
  </div>
);

export default ErrorMessage; 