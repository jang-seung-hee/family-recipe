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
            className="w-64 md:w-80 max-w-full mb-6 drop-shadow-2xl rounded-xl border border-white/40 bg-white/30"
            style={{ objectFit: 'contain' }}
          />
          {/* 레시피 수 */}
          <div className="flex items-center gap-2 mb-4 bg-white/70 px-4 py-2 rounded-full shadow-md">
            <span className="text-sm md:text-base text-minimal-blue font-semibold">{t('home.recipeCountTitle')}</span>
            <span className="text-2xl md:text-3xl font-bold text-minimal-blueDark">{recipeCount}</span>
          </div>
        </div>
      </div>
      {/* 하단부: 라운드 화이트 박스(카드) */}
      <div className="relative z-20 -mt-24 w-full max-w-lg mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl px-6 py-8 flex flex-col items-center">
          {/* 예시 타이틀/버튼/컨텐츠 */}
          <h2 className="text-lg md:text-xl font-bold text-minimal-blue mb-2">{t('home.featuredRecipeTitle')}</h2>
          <p className="text-gray-500 mb-4 text-center">{t('home.featuredRecipeDescription')}</p>
          <Link
            to="/recipes"
            className="bg-gradient-to-r from-minimal-blueLight to-minimal-blue text-white font-semibold py-2 px-6 rounded-xl shadow-minimal-btn text-base hover:scale-105 hover:shadow-lg transition-all"
            aria-label={t('home.viewAllRecipesBtn')}
          >
            {t('home.viewAllRecipesBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 