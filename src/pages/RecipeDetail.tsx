import React from 'react';
import RecipeCard from '../components/RecipeCard';
import ControlBar from '../components/ControlBar';
import { colors } from '../constants/materialTheme';
import { useAuth } from '../contexts/AuthContext';

const sampleRecipe = {
  id: 'sample1',
  image: '/sample-kebab.jpg',
  title: 'Delicious Healthy Kebab',
  tags: ['Quick & Easy'],
  time: '25분',
  rating: 4.3,
  difficulty: '쉬움',
  ingredients: [
    '1/4 cup olive oil',
    '3 cloves garlic, minced',
    '1 skinless, boneless chicken breast halves',
    '2 (4-6-inch) focaccia bread pieces, split horizontally',
    '1/4 cup ...',
  ],
  uid: 'sample-user-uid', // 작성자 uid
};

const RecipeDetail: React.FC = () => {
  const { user } = useAuth();
  // 실제 구현 시 recipe.uid와 user?.uid 비교
  const isOwner = user?.uid === sampleRecipe.uid;
  // 즐겨찾기 상태(더미)
  const isFavorite = false;

  // 각 버튼 핸들러(더미)
  const handleEdit = () => alert('수정 기능');
  const handleDelete = () => alert('삭제 기능');
  const handleComment = () => alert('댓글 기능');
  const handleFavorite = () => alert('즐겨찾기 기능');
  const handleRate = () => alert('평점 등록 기능');

  return (
    <div
      className="min-h-screen p-4"
      style={{ background: colors.grayLight }}
    >
      <div className="mb-6">
        <RecipeCard
          image={sampleRecipe.image}
          title={sampleRecipe.title}
          tags={sampleRecipe.tags}
          time={sampleRecipe.time}
          rating={sampleRecipe.rating}
          difficulty={sampleRecipe.difficulty}
        />
      </div>
      <div className="bg-white rounded-2xl shadow-md p-5 max-w-md mx-auto">
        <h3 className="text-lg font-bold mb-3" style={{ color: colors.blueDeep }}>Ingredients</h3>
        <ul className="list-decimal list-inside text-gray-700">
          {sampleRecipe.ingredients.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="max-w-md mx-auto">
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
  );
};

export default RecipeDetail; 