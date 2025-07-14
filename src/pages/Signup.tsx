import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';

const signupSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
  confirm: z.string(),
  agree: z.literal(true),
}).refine(data => data.password === data.confirm, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirm'],
}).refine(data => data.agree === true, {
  message: '약관에 동의해야 회원가입이 가능합니다.',
  path: ['agree'],
});

const Signup: React.FC = () => {
  const { signup, googleLogin, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const result = signupSchema.safeParse({ email, password, confirm, agree });
    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((e) => {
        if (e.path[0]) errors[e.path[0] as string] = e.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateForm()) return;
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
      setSuccess(true);
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

  if (loading) {
    return <Loading />;
  }

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
        {formErrors.email && <div className="text-red-500 text-xs mt-1">{formErrors.email}</div>}
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-minimal-blue mb-2"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {formErrors.password && <div className="text-red-500 text-xs mt-1">{formErrors.password}</div>}
        <input
          type="password"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-minimal-blue mb-2"
          placeholder="비밀번호 확인"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        {formErrors.confirm && <div className="text-red-500 text-xs mt-1">{formErrors.confirm}</div>}
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
        {formErrors.agree && <div className="text-red-500 text-xs mt-1">{formErrors.agree}</div>}
        {formError && <ErrorMessage message={formError} />}
        {success && <Toast message="회원가입이 완료되었습니다!" type="success" onClose={() => setSuccess(false)} />}
      </AuthForm>
    </div>
  );
};

export default Signup; 