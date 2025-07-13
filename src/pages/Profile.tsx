import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-minimal-blue via-minimal-blueLight to-white">
      <div className="bg-white rounded-2xl shadow-minimal p-8 max-w-md w-full mx-auto flex flex-col gap-4 items-center">
        <h2 className="text-2xl font-bold text-minimal-blue mb-2">프로필</h2>
        <div className="w-20 h-20 rounded-full bg-minimal-blueLight flex items-center justify-center text-4xl text-white font-bold mb-4">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="w-full text-center">
          <div className="mb-2">
            <span className="font-semibold text-minimal-blueDeep">이메일:</span> {user.email}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-minimal-blueDeep">UID:</span> {user.uid}
          </div>
        </div>
        {/* 추후: 프로필 수정, 내가 쓴 레시피, 즐겨찾기 등 확장 */}
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 rounded-lg bg-minimal-blue text-white font-bold hover:bg-minimal-blueDark transition-colors duration-200 mt-4"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Profile; 