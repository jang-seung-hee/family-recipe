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
            className="w-full max-w-3xl mb-6 drop-shadow-2xl rounded-xl border border-white/40 bg-white/30 object-cover transition-all duration-300"
            style={{ objectFit: 'cover', width: '100%', height: '300px', minHeight: '200px', maxHeight: '400px' }}
          />
          {/* QR코드 및 안내문구 (타이틀 이미지 바로 아래) */}
          <div className="flex flex-col items-center mb-4">
            <img src="https://api.qrserver.com/v1/create-qr-code/?data=https://family-recipe.netlify.app&size=160x160" alt="QR코드" className="w-30 h-30 mb-2 rounded-xl border border-gray-200 bg-white" />
            <div className="text-xs text-gray-500">구글 로그인은 크롬 등 브라우저에서 열어주세요!</div>
          </div>
          {/* 레시피 수 */}
          <div className="flex items-center gap-2 mb-4 bg-white/70 px-4 py-2 rounded-full shadow-md">
            <span className="text-sm md:text-base text-minimal-blue font-semibold">{t('home.recipeCountTitle')}</span>
            <span className="text-2xl md:text-3xl font-bold text-minimal-blueDark">{recipeCount}</span>
          </div>
          {/* 등록된 레시피 보러가기 버튼/카드 */}
          <Link
            to="/recipes"
            className="w-full max-w-xs mt-2 mb-2 px-6 py-4 bg-minimal-blue text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg hover:bg-minimal-blueDark transition-colors duration-200 cursor-pointer group"
            style={{ textDecoration: 'none' }}
            aria-label="등록된 레시피 보러가기"
          >
            <span>레시피 보러가기</span>
            <svg className="w-6 h-6 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 