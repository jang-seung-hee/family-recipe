import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      home: {
        mainArea: '홈 메인 영역',
        title: '아무것도 들어 간것 없다',
        slogan: '"우리가족 레시피"',
        recipeCountTitle: '등록된 레시피',
        featuredRecipeTitle: '오늘의 추천 레시피',
        featuredRecipeDescription: '가장 인기있는 레시피를 확인해보세요!',
        viewAllRecipesBtn: '전체 레시피 보기',
        addRecipeBtn: '레시피 등록',
      },
      nav: {
        mainNav: '주 내비게이션',
        home: '홈',
        trends: '트렌드',
        add: '등록',
        recipes: '레시피',
        favorites: '즐겨찾기',
      },
    },
  },
  en: {
    translation: {
      home: {
        mainArea: 'Home main area',
        title: 'Nothing Added',
        slogan: '"Our Family Recipe"',
        recipeCountTitle: 'Registered Recipes',
        featuredRecipeTitle: 'Today\'s Featured Recipe',
        featuredRecipeDescription: 'Check out the most popular recipes!',
        viewAllRecipesBtn: 'View All Recipes',
        addRecipeBtn: 'Add Recipe',
      },
      nav: {
        mainNav: 'Main Navigation',
        home: 'Home',
        trends: 'Trends',
        add: 'Add',
        recipes: 'Recipes',
        favorites: 'Favorites',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ko',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n; 