import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

interface FavoriteCategory {
  id: string;
  name: string;
  recipes: { id: string; title: string }[];
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favoriteCategories, setFavoriteCategories] = React.useState<FavoriteCategory[]>([]);
  const [myRecipes, setMyRecipes] = React.useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    // 즐겨찾기 카테고리별로 레시피 제목만 그룹핑
    const fetchFavoritesByCategory = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'users', user.uid, 'favoriteCategories'));
        const categories: FavoriteCategory[] = [];
        for (const catDoc of catSnap.docs) {
          const catId = catDoc.id;
          const catName = catDoc.data().name;
          // 해당 카테고리의 즐겨찾기 레시피 ID
          const favSnap = await getDocs(query(collection(db, 'users', user.uid, 'favorites'), where('categoryId', '==', catId)));
          const recipeIds = favSnap.docs.map(doc => doc.data().recipeId);
          let recipes: { id: string; title: string }[] = [];
          if (recipeIds.length > 0) {
            for (let i = 0; i < recipeIds.length; i += 10) {
              const batch = recipeIds.slice(i, i + 10);
              const recipeSnap = await getDocs(query(collection(db, 'recipes'), where('__name__', 'in', batch)));
              recipes.push(...recipeSnap.docs.map(doc => ({ id: doc.id, title: doc.data().title })));
            }
          }
          categories.push({ id: catId, name: catName, recipes });
        }
        setFavoriteCategories(categories);
      } catch (e) {
        setError('즐겨찾기 정보를 불러오는 중 오류가 발생했습니다.');
      }
    };
    // 내가 등록한 레시피(제목만)
    const fetchMyRecipes = async () => {
      try {
        const mySnap = await getDocs(query(collection(db, 'recipes'), where('userId', '==', user.uid)));
        setMyRecipes(mySnap.docs.map(doc => ({ id: doc.id, title: doc.data().title })));
      } catch (e) {
        setError('내가 등록한 레시피를 불러오는 중 오류가 발생했습니다.');
      }
    };
    Promise.all([fetchFavoritesByCategory(), fetchMyRecipes()]).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-minimal-blue via-minimal-blueLight to-white flex flex-col items-center py-8 px-2">
      {/* 프로필 정보: 가로 카드 */}
      <div className="bg-white rounded-2xl shadow-minimal p-6 max-w-2xl w-full mx-auto flex flex-row items-center gap-6 mb-8">
        <div className="w-16 h-16 rounded-full bg-minimal-blueLight flex items-center justify-center text-3xl text-white font-bold">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-minimal-blue text-lg truncate">{user.email}</div>
          <div className="text-xs text-gray-400 truncate">UID: {user.uid}</div>
        </div>
        <button
          onClick={handleLogout}
          className="py-2 px-4 rounded-lg bg-minimal-blue text-white font-bold hover:bg-minimal-blueDark transition-colors duration-200 text-sm"
        >
          로그아웃
        </button>
      </div>
      {/* 즐겨찾기 카테고리별 */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="bg-minimal-blue text-white rounded-lg px-6 py-3 mb-4 text-xl font-bold shadow text-center">즐겨찾기 레시피</div>
        {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : favoriteCategories.length === 0 ? (
          <div className="text-gray-400 text-center py-8">즐겨찾기한 레시피가 없습니다.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {favoriteCategories.map(cat => (
              <div key={cat.id} className="bg-white border border-minimal-blue rounded-lg shadow p-4">
                <div className="inline-block bg-minimal-blue text-white rounded-full px-4 py-1 mb-2 text-base font-semibold text-center">
                  {cat.name}
                </div>
                {cat.recipes.length === 0 ? (
                  <div className="text-gray-400 text-sm">이 카테고리에 즐겨찾기한 레시피가 없습니다.</div>
                ) : (
                  <ul className="list-disc list-inside text-sm ml-4">
                    {cat.recipes.map(r => (
                      <li key={r.id} className="cursor-pointer hover:underline text-minimal-blue"
                          onClick={() => navigate(`/recipes/${r.id}`, { state: { fromProfile: true } })}>
                        {r.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 내가 등록한 레시피 */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="bg-minimal-blue text-white rounded-lg px-6 py-3 mb-4 text-xl font-bold shadow text-center">내가 등록한 레시피</div>
        {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : myRecipes.length === 0 ? (
          <div className="text-gray-400 text-center py-8">등록한 레시피가 없습니다.</div>
        ) : (
          <ul className="flex flex-wrap gap-2 bg-white rounded-lg shadow p-4">
            {myRecipes.map(r => (
              <li key={r.id}>
                <span
                  className="px-3 py-1 rounded bg-minimal-blueLight text-minimal-blue font-semibold text-sm cursor-pointer hover:underline"
                  onClick={() => navigate(`/recipes/${r.id}`, { state: { fromProfile: true } })}
                >
                  {r.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile; 