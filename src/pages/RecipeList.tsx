import React, { useEffect, useState, Suspense } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, DocumentData } from 'firebase/firestore';
import { colors } from '../constants/materialTheme';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';

const RecipeCard = React.lazy(() => import('../components/RecipeCard'));

const CATEGORIES = ['집밥', '술안주', '디저트', '간식', '반찬', '기타'];

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<DocumentData | null>(null);
  const [filters, setFilters] = useState({ category: '', search: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const data = localStorage.getItem('recentRecipes');
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
    if (!selectedRecipe) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedRecipe(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedRecipe]);

  // 필터링 및 페이징
  const filtered = recipes.filter(recipe => {
    if (filters.category && recipe.category !== filters.category) return false;
    if (filters.search && !recipe.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / 10);
  const paged = filtered.slice((page - 1) * 10, page * 10);

  useEffect(() => { setPage(1); }, [filters]);

  const navigate = useNavigate();

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
          <Suspense fallback={<div>로딩 중...</div>}>
            {paged.map((recipe, idx) => (
              <div key={recipe.id || idx} onClick={() => navigate(`/recipes/${recipe.id}`)} className="cursor-pointer">
                <RecipeCard
                  image={recipe.finalPhoto}
                  title={recipe.title || ''}
                  tags={recipe.tags || []}
                  time={recipe.time || ''}
                  rating={typeof recipe.rating === 'number' ? recipe.rating : 0}
                  difficulty={recipe.difficulty || ''}
                />
              </div>
            ))}
          </Suspense>
        )}
      </div>
      <div className="max-w-2xl mx-auto">
        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default RecipeList; 