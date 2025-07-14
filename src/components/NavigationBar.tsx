import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/', label: '홈', icon: '🏠' },
  { to: '/trends', label: '트렌드', icon: '🔥' },
  { to: '/add', label: '등록', icon: '➕' },
  { to: '/recipes', label: '레시피', icon: '📖' },
  { to: '/favorites', label: '즐겨찾기', icon: <img src="/image/favorite_off.png" alt="즐겨찾기" className="w-7 h-7" /> },
];

const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav aria-label={t('nav.mainNav')} className="fixed bottom-0 left-0 w-full z-50 bg-white shadow flex flex-col items-center py-2">
      <ul className="flex justify-center gap-6 mb-1">
        <li>
          <Link to="/" aria-label={t('nav.home')} className="flex flex-col items-center text-xs text-gray-700 hover:text-minimal-blue transition-colors">
            <span className="text-xl">🏠</span>
            <span>{t('nav.home')}</span>
          </Link>
        </li>
        <li>
          <Link to="/trends" aria-label={t('nav.trends')} className="flex flex-col items-center text-xs text-gray-700 hover:text-minimal-blue transition-colors">
            <span className="text-xl">🔥</span>
            <span>{t('nav.trends')}</span>
          </Link>
        </li>
        <li>
          <Link to="/add" aria-label={t('nav.add')} className="flex flex-col items-center text-xs text-gray-700 hover:text-minimal-blue transition-colors">
            <span className="text-xl">➕</span>
            <span>{t('nav.add')}</span>
          </Link>
        </li>
        <li>
          <Link to="/recipes" aria-label={t('nav.recipes')} className="flex flex-col items-center text-xs text-gray-700 hover:text-minimal-blue transition-colors">
            <span className="text-xl">📖</span>
            <span>{t('nav.recipes')}</span>
          </Link>
        </li>
        {user && (
          <li>
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center text-xs text-gray-700 hover:text-minimal-blue transition-colors focus:outline-none"
              aria-label="마이홈"
            >
              <span className="text-xl">👤</span>
              <span>My</span>
            </button>
          </li>
        )}
      </ul>
      {!user && (
        <div className="flex items-center gap-2">
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
        </div>
      )}
    </nav>
  );
};

export default NavigationBar; 