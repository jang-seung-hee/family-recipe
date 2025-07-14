import React, { useState, useEffect } from 'react';
import ControlBar from '../components/ControlBar';
import { colors } from '../constants/materialTheme';
import { useAuth } from '../contexts/AuthContext';
import { addFavorite, removeFavorite, checkFavorite, getFavoriteCategories, addFavoriteCategory, deleteRecipeWithImage, deleteAllFavoritesForRecipe } from '../utils/favoriteUtils';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const RecipeDetail: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // 즐겨찾기 상태
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFavoritePopup, setShowFavoritePopup] = useState(false);
  const [showUnfavoritePopup, setShowUnfavoritePopup] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch recipe from Firestore
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDoc(doc(db, 'recipes', id)).then((docSnap) => {
      if (docSnap.exists()) {
        setRecipe({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });
  }, [id]);
  // Firestore에서 즐겨찾기 여부 및 카테고리 목록 불러오기
  useEffect(() => {
    if (user && recipe?.id) {
      checkFavorite(user.uid, recipe.id).then(setIsFavorite);
      getFavoriteCategories(user.uid).then(setCategories);
    }
  }, [user, recipe]);


  // 즐겨찾기 해제
  // 삭제해도 됩니다. (즐겨찾기 해제 핸들러)

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    if (!user) return;
    await addFavoriteCategory(user.uid, newCategory.trim());
    // Firestore에서 최신 목록을 다시 불러옴
    const updated = await getFavoriteCategories(user.uid);
    setCategories(updated);
    // 새로 추가한 카테고리를 선택값으로 지정
    const added = updated.find(cat => cat.name === newCategory.trim());
    if (added) setSelectedCategory(added.id);
    setNewCategory('');
    setCategoryError('');
  };

  // 각 버튼 핸들러(더미)
  const handleEdit = () => {
    navigate(`/edit/${recipe.id}`);
  };
  const handleDelete = () => {
    setShowDeleteModal(true);
  };
  const handleComment = () => alert('댓글 기능');
  const handleFavorite = () => {
    if (isFavorite) {
      setShowUnfavoritePopup(true);
    } else {
      setShowFavoritePopup(true);
    }
  };
  const handleRate = () => alert('평점 등록 기능');

  const handleConfirmDelete = async () => {
    setDeleteError(null);
    try {
      await deleteRecipeWithImage(recipe.id, recipe);
      await deleteAllFavoritesForRecipe(recipe.id);
      navigate('/recipes');
    } catch (e: any) {
      setDeleteError('삭제 중 오류가 발생했습니다.');
    }
    setShowDeleteModal(false);
  };
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!recipe) return <div className="min-h-screen flex items-center justify-center">레시피를 찾을 수 없습니다.</div>;
  const isOwner = user?.uid === recipe?.uid;

  // 대표 이미지 우선순위: finalPhoto > 조리과정 첫 사진 > noimage.png
  let mainImage = recipe.finalPhoto;
  if (!mainImage && Array.isArray(recipe.cookingSteps)) {
    const stepPhoto = recipe.cookingSteps.find((s: any) => s.photo);
    if (stepPhoto && stepPhoto.photo) mainImage = stepPhoto.photo;
  }
  if (!mainImage) mainImage = '/image/noimage.png';

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-2 md:px-0" style={{ background: colors.grayLight }}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 mx-auto relative">
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-3xl font-extrabold bg-[#2196F3] text-white rounded-full shadow-lg border-4 border-white hover:bg-[#1976D2] hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 z-50"
          onClick={() => {
            if (location.state && location.state.fromProfile) {
              navigate('/profile');
            } else if (location.state && location.state.fromFavoritesHome) {
              navigate(-1);
            } else {
              navigate('/recipes');
            }
          }}
          aria-label="닫기"
        >
          &times;
        </button>
        {/* 대표 이미지 */}
        <div className="mb-6">
          <img
            src={mainImage}
            alt={recipe.title}
            className="w-full h-64 object-cover rounded-xl bg-blue-100"
          />
        </div>
        {/* 타이틀/카테고리/시간/난이도 */}
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.blueDeep }}>{recipe.title}</h2>
        <div className="mb-4 text-sm text-gray-600 flex flex-wrap gap-2">
          <span className="mr-2">카테고리: {recipe.category}</span>
          <span className="mr-2">⏰ {recipe.time}</span>
          <span className="mr-2">난이도: {recipe.difficulty}</span>
        </div>
        {/* 재료 */}
        <div className="mb-6">
          <b>재료:</b>
          <ul className="list-disc ml-5 mt-1 text-gray-700">
            {(recipe.ingredients || []).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        {/* 조리과정 */}
        <div className="mb-6">
          <b>조리과정:</b>
          <ol className="list-decimal ml-5 mt-1 text-gray-700">
            {(recipe.cookingSteps || []).map((step: any, idx: number) => (
              <li key={idx} className="mb-4">
                <div>{step.text}</div>
                {step.photo && (
                  <img src={step.photo} alt={`조리과정${idx+1}`} className="w-32 h-32 object-cover rounded-lg border border-[#E0E0E0] mt-2" />
                )}
              </li>
            ))}
          </ol>
        </div>
        {/* ControlBar */}
        <div className="mt-8">
          <ControlBar
            isOwner={isOwner}
            isFavorite={isFavorite}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComment={handleComment}
            onFavorite={handleFavorite}
            onRate={handleRate}
          />
        </div>
      </div>
      {/* 즐겨찾기 팝업 (카테고리 선택 포함) */}
      {showFavoritePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
            <h3 className="text-lg font-bold mb-4">즐겨찾기에 추가</h3>
            <div className="mb-4">
              <select
                className="w-full border rounded px-2 py-1 mb-2"
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value); setCategoryError(''); }}
              >
                <option value="">카테고리 선택</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex gap-2 mb-2">
                <input
                  className="flex-1 border rounded px-2 py-1"
                  type="text"
                  placeholder="새 카테고리"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                />
                <button className="px-2 py-1 bg-blue-400 text-white rounded" onClick={handleAddCategory} type="button">추가</button>
              </div>
              {categoryError && <div className="text-red-500 text-sm mb-2">{categoryError}</div>}
            </div>
            <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-bold" onClick={() => setShowFavoritePopup(false)}>취소</button>
          </div>
        </div>
      )}
      {/* 즐겨찾기 해제 팝업 */}
      {showUnfavoritePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
            <h3 className="text-lg font-bold mb-4">즐겨찾기 해제</h3>
            <div className="mb-4 text-gray-600">이미 즐겨찾기에 등록되어 있습니다. 해제하시겠습니까?</div>
            <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-bold" onClick={() => setShowUnfavoritePopup(false)}>취소</button>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
            <h3 className="text-lg font-bold mb-4">정말 삭제하시겠습니까?</h3>
            <div className="mb-4 text-gray-600">이 레시피와 관련된 모든 데이터가 완전히 삭제됩니다.</div>
            {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold mr-2" onClick={handleConfirmDelete}>삭제</button>
            <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-bold" onClick={handleCancelDelete}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail; 