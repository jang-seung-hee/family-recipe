import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const Login: React.FC = () => {
  const { login, googleLogin, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleGoogle = async () => {
    setFormError(null);
    try {
      await googleLogin();
      navigate('/');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-minimal-blue via-minimal-blueLight to-white">
      <AuthForm
        title="로그인"
        onSubmit={handleSubmit}
        loading={loading}
        error={formError || error}
        onGoogleClick={handleGoogle}
        googleLabel="Google 계정으로 로그인"
        bottom={
          <>
            <Link to="/signup" className="text-minimal-blue hover:underline font-semibold">회원가입</Link>
            <span className="mx-2">|</span>
            <a href="#" className="text-minimal-blue hover:underline font-semibold">비밀번호 재설정</a>
          </>
        }
      >
        <input
          type="email"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-minimal-blue mb-2"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-minimal-blue mb-2"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </AuthForm>
    </div>
  );
};

export default Login; 