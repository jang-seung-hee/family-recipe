import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', label: '홈', icon: '🏠' },
  { to: '/trends', label: '트렌드', icon: '🔥' },
  { to: '/add', label: '등록', icon: '➕' },
  { to: '/recipes', label: '레시피', icon: '📖' },
];

const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white shadow-minimal flex justify-around items-center h-16 z-50 rounded-t-2xl transition-all duration-200 border-t border-gray-100"
    >
      {navItems.map(item => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex flex-col items-center text-xs md:text-sm font-semibold px-2 transition-all duration-200 ease-in-out
            ${location.pathname === item.to ? 'text-minimal-blueDark font-bold' : 'text-minimal-blueDeep'}
            hover:text-minimal-blue active:text-minimal-blueDark`}
        >
          <span className="text-2xl mb-1 transition-all duration-200">{item.icon}</span>
          {item.label}
        </Link>
      ))}
      <div className="flex items-center gap-2 ml-2">
        {user ? (
          <>
            {/* 프로필(추후 구현) */}
            <span className="hidden md:inline text-minimal-blue font-semibold">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-lg bg-minimal-blue text-white font-bold hover:bg-minimal-blueDark transition-colors duration-200 text-xs md:text-sm"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-3 py-1 rounded-lg bg-minimal-blue text-white font-bold hover:bg-minimal-blueDark transition-colors duration-200 text-xs md:text-sm"
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1 rounded-lg bg-white border border-minimal-blue text-minimal-blue font-bold hover:bg-minimal-blueLight transition-colors duration-200 text-xs md:text-sm"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar; 