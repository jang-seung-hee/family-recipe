import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Signup: React.FC = () => {
  const { signup, googleLogin, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!agree) {
      setFormError('약관에 동의해야 회원가입이 가능합니다.');
      return;
    }
    if (password !== confirm) {
      setFormError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const userCredential = await signup(email, password);
      // Firestore에 사용자 데이터 저장
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        createdAt: serverTimestamp(),
      });
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
        title="회원가입"
        onSubmit={handleSubmit}
        loading={loading}
        error={formError || error}
        onGoogleClick={handleGoogle}
        googleLabel="Google 계정으로 회원가입"
        bottom={
          <>
            <Link to="/login" className="text-minimal-blue hover:underline font-semibold">로그인</Link>
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
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-minimal-blue mb-2"
          placeholder="비밀번호 확인"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-sm mb-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            className="accent-minimal-blue"
            required
          />
          <span>이용약관에 동의합니다.</span>
        </label>
      </AuthForm>
    </div>
  );
};

export default Signup; 