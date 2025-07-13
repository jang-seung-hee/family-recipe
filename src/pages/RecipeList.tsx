import React, { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { db } from '../firebase';
import { collection, onSnapshot, DocumentData } from 'firebase/firestore';
import { colors } from '../constants/materialTheme';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import ControlBar from '../components/ControlBar';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['집밥', '술안주', '디저트', '간식', '반찬', '기타'];

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<DocumentData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({ category: '', search: '' });
  const [page, setPage] = useState(1);

  // 최근 본 레시피(localStorage)
  const [recentViewed, setRecentViewed] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => {
    const data = localStorage.getItem('recentRecipes');
    if (data) setRecentViewed(JSON.parse(data));
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'recipes'),
      (snapshot) => {
        setRecipes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
      },
      (err) => {
        setError('레시피를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalOpen]);

  // 필터링 및 페이징
  const filtered = recipes.filter(recipe => {
    if (filters.category && recipe.category !== filters.category) return false;
    if (filters.search && !recipe.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / 10);
  const paged = filtered.slice((page - 1) * 10, page * 10);

  useEffect(() => { setPage(1); }, [filters]);

  const { user } = useAuth();

  if (loading) return <div className="p-4">불러오는 중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div
      className="min-h-screen py-6 px-2 md:px-0"
      style={{ background: `linear-gradient(to bottom, ${colors.blueLight}, ${colors.white})` }}
    >
      <div className="max-w-2xl mx-auto">
        <FilterBar
          categories={CATEGORIES}
          selectedCategory={filters.category}
          search={filters.search}
          onChange={setFilters}
        />
      </div>
      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {paged.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">
            등록된 레시피가 없습니다.
          </div>
        ) : (
          paged.map((recipe, idx) => {
            // 1순위: 완성사진
            let cardImage = recipe.finalPhoto;
            // 2순위: 조리과정 중 랜덤 사진
            if (!cardImage && Array.isArray(recipe.cookingSteps)) {
              const stepPhotos = recipe.cookingSteps
                .map((s: any) => s.photo)
                .filter((p: string) => typeof p === 'string' && p.length > 0);
              if (stepPhotos.length > 0) {
                cardImage = stepPhotos[Math.floor(Math.random() * stepPhotos.length)];
              }
            }
            // 3순위: noimage.png
            if (!cardImage) {
              cardImage = '/image/noimage.png';
            }
            return (
              <div key={recipe.id || idx} onClick={() => { setSelectedRecipe(recipe); setModalOpen(true); }} className="cursor-pointer">
                <RecipeCard
                  image={cardImage}
                  title={recipe.title || ''}
                  tags={recipe.tags || []}
                  time={recipe.time || ''}
                  rating={typeof recipe.rating === 'number' ? recipe.rating : 0}
                  difficulty={recipe.difficulty || ''}
                />
              </div>
            );
          })
        )}
      </div>
      <div className="max-w-2xl mx-auto">
        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>
      {/* Fullscreen Modal */}
      {modalOpen && selectedRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-3xl font-extrabold bg-[#2196F3] text-white rounded-full shadow-lg border-4 border-white hover:bg-[#1976D2] hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 z-50"
              onClick={() => setModalOpen(false)}
              aria-label="닫기"
            >
              &times;
            </button>
            <div className="mb-4">
              <img
                src={selectedRecipe.finalPhoto || (Array.isArray(selectedRecipe.cookingSteps) && selectedRecipe.cookingSteps.find((s: any) => s.photo)?.photo) || '/image/noimage.png'}
                alt={selectedRecipe.title}
                className="w-full h-64 object-cover rounded-xl bg-blue-100"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.blueDeep }}>{selectedRecipe.title}</h2>
            <div className="mb-2 text-sm text-gray-600">
              <span className="mr-2">카테고리: {selectedRecipe.category}</span>
              <span className="mr-2">⏰ {selectedRecipe.time}</span>
              <span className="mr-2">난이도: {selectedRecipe.difficulty}</span>
            </div>
            <div className="mb-4">
              <b>재료:</b>
              <ul className="list-disc ml-5 mt-1 text-gray-700">
                {(selectedRecipe.ingredients || []).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <b>조리과정:</b>
              <ol className="list-decimal ml-5 mt-1 text-gray-700">
                {(selectedRecipe.cookingSteps || []).map((step: any, idx: number) => (
                  <li key={idx} className="mb-2">
                    <div>{step.text}</div>
                    {step.photo && (
                      <img src={step.photo} alt={`조리과정${idx+1}`} className="w-32 h-32 object-cover rounded-lg border border-[#E0E0E0] mt-1" />
                    )}
                  </li>
                ))}
              </ol>
            </div>
            <ControlBar
              isOwner={user && selectedRecipe.uid && user.uid === selectedRecipe.uid}
              isFavorite={false}
              onEdit={() => {}}
              onDelete={() => {}}
              onComment={() => {}}
              onFavorite={() => {}}
              onRate={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList; 