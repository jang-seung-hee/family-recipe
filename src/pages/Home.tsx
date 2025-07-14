import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [recipeCount, setRecipeCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'recipes'), (snapshot) => {
      setRecipeCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-minimal-blue via-minimal-blueLight to-white flex flex-col" aria-label={t('home.mainArea')}>
      {/* 상단부: Modern Minimal Blue 배경, 곡선 하단 */}
      <div className="relative w-full flex flex-col items-center justify-start pt-10 pb-24 px-4 md:px-0">
        {/* 앱명/슬로건/이미지/레시피수/버튼 */}
        <div className="relative z-20 flex flex-col items-center w-full max-w-md mx-auto">
          {/* 앱명 */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg mb-2 tracking-tight font-minimal">{t('home.title')}</h1>
          {/* 슬로건 */}
          <p className="text-base md:text-lg text-white font-semibold mb-4 font-minimal">{t('home.slogan')}</p>
          {/* 메인 이미지 */}
          <img
            src="/image/main_title.png"
            alt="메인 타이틀"
            className="w-full max-w-3xl mb-6 rounded-xl object-cover transition-all duration-500 shadow-2xl hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)] cursor-pointer"
            style={{ objectFit: 'cover', width: '100%', height: '270px', minHeight: '180px', maxHeight: '360px' }}
          />
          {/* QR코드 및 안내문구 (타이틀 이미지 바로 아래) */}
          <div className="flex flex-col items-center mb-4">
            <img src="https://api.qrserver.com/v1/create-qr-code/?data=https://family-recipe.netlify.app&size=160x160" alt="QR코드" className="w-20 h-20 mb-2 rounded-xl border border-gray-200 bg-white" />
            <div className="text-xs text-gray-500">구글 로그인은 크롬 등 브라우저에서 열어주세요!</div>
          </div>
          {/* 레시피 수 */}
          <Link
            to="/recipes"
            className="flex items-center justify-center gap-2 mb-4 bg-white px-8 py-2 rounded-full shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer min-w-[220px]"
            aria-label="등록된 레시피 바로가기"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-sm md:text-base text-minimal-blue font-semibold">{t('home.recipeCountTitle')}</span>
            <span className="text-2xl md:text-3xl font-bold text-minimal-blueDark">{recipeCount}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 