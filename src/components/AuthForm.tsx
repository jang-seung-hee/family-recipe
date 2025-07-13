import React from 'react';

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  googleLabel?: string;
  onGoogleClick?: () => void;
  bottom?: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  onSubmit,
  children,
  loading,
  error,
  googleLabel = 'Google 계정으로 계속',
  onGoogleClick,
  bottom,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-minimal p-8 max-w-md w-full mx-auto flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold text-minimal-blue text-center mb-2">{title}</h2>
      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm text-center mb-2">
          {error}
        </div>
      )}
      {children}
      {onGoogleClick && (
        <button
          type="button"
          onClick={onGoogleClick}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white border border-minimal-blue text-minimal-blue font-semibold hover:bg-minimal-blueLight transition-colors duration-200"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)"><path d="M47.5 24.552c0-1.636-.146-3.2-.418-4.704H24v9.02h13.22c-.57 2.98-2.28 5.5-4.86 7.2v5.98h7.86c4.6-4.24 7.28-10.5 7.28-17.496z" fill="#4285F4"/><path d="M24 48c6.48 0 11.92-2.14 15.9-5.82l-7.86-5.98c-2.18 1.46-4.98 2.34-8.04 2.34-6.18 0-11.42-4.18-13.3-9.8H2.66v6.16C6.62 43.02 14.62 48 24 48z" fill="#34A853"/><path d="M10.7 28.54A13.98 13.98 0 0 1 9.2 24c0-1.58.28-3.12.78-4.54v-6.16H2.66A23.98 23.98 0 0 0 0 24c0 3.78.9 7.36 2.66 10.7l8.04-6.16z" fill="#FBBC05"/><path d="M24 9.52c3.52 0 6.66 1.22 9.14 3.62l6.86-6.86C35.92 2.14 30.48 0 24 0 14.62 0 6.62 4.98 2.66 13.3l8.04 6.16C12.58 13.7 17.82 9.52 24 9.52z" fill="#EA4335"/></g><defs><clipPath id="clip0_17_40"><path fill="#fff" d="M0 0h48v48H0z"/></clipPath></defs></svg>
          {googleLabel}
        </button>
      )}
      <button
        type="submit"
        className="w-full py-2 px-4 rounded-lg bg-minimal-blue text-white font-bold hover:bg-minimal-blueDark transition-colors duration-200 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? '처리 중...' : title}
      </button>
      {bottom && <div className="mt-2 text-center text-sm">{bottom}</div>}
    </form>
  );
};

export default AuthForm; 