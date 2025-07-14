import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFavoriteCategories, addFavoriteCategory, updateFavoriteCategory, deleteFavoriteCategory, getFavoriteRecipesByCategory } from '../utils/favoriteUtils';
import RecipeCard from '../components/RecipeCard';
import { useNavigate, useLocation } from 'react-router-dom';

const FavoritesHome: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryRecipeCounts, setCategoryRecipeCounts] = useState<{ [key: string]: number }>({});
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [categoryRecipes, setCategoryRecipes] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // 카테고리 목록 불러오기 (어떻게 해?)
  const fetchCategories = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. getFavoriteCategories로 카테고리 목록을 가져온다.
      // 네, 이 부분은 그대로 두어도 됩니다.
      const data = await getFavoriteCategories(user.uid);
      // 2. 가져온 목록을 상태에 저장한다.
      setCategories(data);
    } catch (err) {
      // 3. 실패 시 에러 메시지 표시
      setError('카테고리 불러오기 실패');
    } finally {
      // 4. 로딩 상태 해제
      setLoading(false);
    }
  };

  // 카테고리별 레시피 개수 불러오기
  const fetchCategoryRecipeCounts = async (cats: any[]) => {
    if (!user) return;
    const counts: { [key: string]: number } = {};
    for (const cat of cats) {
      const recipes = await getFavoriteRecipesByCategory(user.uid, cat.id);
      counts[cat.id] = recipes.length;
    }
    setCategoryRecipeCounts(counts);
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (categories.length > 0) fetchCategoryRecipeCounts(categories);
  }, [categories]);

  // mount 시 location.state.openCategoryId가 있으면 해당 카테고리 자동 오픈
  useEffect(() => {
    if (location.state && location.state.openCategoryId) {
      handleCategoryClick(location.state.openCategoryId);
    }
    // eslint-disable-next-line
  }, [categories]);

  // 카테고리 목록이 바뀔 때마다 개수도 갱신
  useEffect(() => {
    if (categories.length > 0) fetchCategoryRecipeCounts(categories);
  }, [categories]);

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!user || !newCategory.trim()) return;
    setLoading(true);
    try {
      await addFavoriteCategory(user.uid, newCategory.trim());
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError('카테고리 추가 실패');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 수정
  const handleEditCategory = async (id: string) => {
    if (!editCategoryName.trim() || !user) return;
    setLoading(true);
    try {
      await updateFavoriteCategory(user.uid, id, editCategoryName.trim());
      setEditCategoryId(null);
      setEditCategoryName('');
      fetchCategories();
    } catch (err) {
      setError('카테고리 수정 실패');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (id: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await deleteFavoriteCategory(user.uid, id);
      fetchCategories();
    } catch (err) {
      setError('카테고리 삭제 실패');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 클릭 시 레시피 목록 불러오기
  const handleCategoryClick = async (catId: string) => {
    if (!user) return;
    if (openCategoryId === catId) {
      setOpenCategoryId(null);
      setCategoryRecipes([]);
      return;
    }
    setOpenCategoryId(catId);
    setCategoryRecipes([]);
    const recipes = await getFavoriteRecipesByCategory(user.uid, catId);
    setCategoryRecipes(recipes);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-2 md:px-0 bg-[#F5F5F5]">
      <div className="w-full max-w-lg mt-8">
        <div className="flex flex-col items-center bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6">
          <img src="/image/favorite_off.png" alt="즐겨찾기 아이콘" className="w-12 h-12 mb-2" />
          <h2 className="text-2xl md:text-3xl font-bold text-center tracking-tight mb-0" style={{ color: '#1A202C' }}>
            즐겨찾기 홈
          </h2>
        </div>
        {/* 카테고리 관리 UI */}
        <div className="bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">카테고리 관리</h3>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 rounded-lg px-3 py-2 border border-[#E0E0E0] focus:border-[#FF9800] bg-white"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="새 카테고리 이름"
              disabled={loading}
            />
            <button
              className="px-4 py-2 rounded-lg bg-[#FF9800] text-white font-bold hover:bg-[#FB8C00]"
              onClick={handleAddCategory}
              disabled={loading || !newCategory.trim()}
            >
              추가
            </button>
          </div>
          <ul>
            {categories.map(cat => (
              <li key={cat.id} className="flex flex-col mb-2">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1" onClick={() => handleCategoryClick(cat.id)}>
                  <span className="flex-1 font-semibold">{cat.name}</span>
                  <span className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-bold">{categoryRecipeCounts[cat.id] ?? 0}</span>
                  <button className="px-2 py-1 bg-blue-100 text-minimal-blue rounded-lg font-bold" onClick={e => { e.stopPropagation(); setEditCategoryId(cat.id); setEditCategoryName(cat.name); }} disabled={loading}>수정</button>
                  <button className="px-2 py-1 bg-red-100 text-red-600 rounded-lg font-bold" onClick={e => { e.stopPropagation(); handleDeleteCategory(cat.id); }} disabled={loading}>삭제</button>
                </div>
                {/* 레시피 리스트 */}
                {openCategoryId === cat.id && categoryRecipes.length > 0 && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-2">
                    {categoryRecipes.map(recipe => (
                      <div key={recipe.id} className="mb-2 cursor-pointer" onClick={() => navigate(`/recipes/${recipe.id}`, { state: { fromFavoritesHome: true, openCategoryId: cat.id } })}>
                        <RecipeCard
                          image={recipe.finalPhoto || recipe.finalPhotoThumbnail || '/image/noimage.png'}
                          title={recipe.title}
                          time={recipe.time}
                          difficulty={recipe.difficulty}
                        />
                      </div>
                    ))}
                    {categoryRecipes.length === 0 && <div className="text-gray-400">레시피가 없습니다.</div>}
                  </div>
                )}
                {openCategoryId === cat.id && categoryRecipes.length === 0 && (
                  <div className="mt-2 text-gray-400">레시피가 없습니다.</div>
                )}
                {editCategoryId === cat.id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      className="flex-1 rounded-lg px-2 py-1 border border-[#E0E0E0]"
                      value={editCategoryName}
                      onChange={e => setEditCategoryName(e.target.value)}
                      disabled={loading}
                    />
                    <button className="px-2 py-1 bg-[#FF9800] text-white rounded-lg font-bold" onClick={() => handleEditCategory(cat.id)} disabled={loading}>저장</button>
                    <button className="px-2 py-1 bg-gray-300 text-gray-800 rounded-lg font-bold" onClick={() => setEditCategoryId(null)} disabled={loading}>취소</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {loading && <div className="text-gray-400 mt-2">처리 중...</div>}
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default FavoritesHome; 