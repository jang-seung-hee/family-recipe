import React from 'react';

interface ControlBarProps {
  isOwner: boolean;
  isFavorite: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onComment: () => void;
  onFavorite: () => void;
  onRate: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  isOwner,
  isFavorite,
  onEdit,
  onDelete,
  onComment,
  onFavorite,
  onRate,
}) => {
  return (
    <div className="flex flex-row flex-wrap gap-3 justify-center mt-6 p-4 bg-white rounded-xl shadow-minimal">
      {isOwner ? (
        <>
          <button className="px-4 py-2 rounded-lg bg-minimal-blue text-white font-bold hover:bg-minimal-blueDark" onClick={onEdit}>수정</button>
          <button className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-700" onClick={onDelete}>삭제</button>
          <button className="px-4 py-2 rounded-lg bg-gray-200 text-minimal-blue font-bold hover:bg-gray-300" onClick={onComment}>댓글</button>
          <button onClick={onFavorite} aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'} className="bg-transparent border-none p-0 m-0 focus:outline-none">
            <img src={isFavorite ? '/image/favorite_on.png' : '/image/favorite_off.png'} alt={isFavorite ? '즐겨찾기됨' : '즐겨찾기'} className="w-7 h-7" />
          </button>
        </>
      ) : (
        <>
          <button onClick={onFavorite} aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'} className="bg-transparent border-none p-0 m-0 focus:outline-none">
            <img src={isFavorite ? '/image/favorite_on.png' : '/image/favorite_off.png'} alt={isFavorite ? '즐겨찾기됨' : '즐겨찾기'} className="w-7 h-7" />
          </button>
          <button className="px-4 py-2 rounded-lg bg-blue-100 text-minimal-blue font-bold hover:bg-blue-200" onClick={onRate}>평점 등록</button>
          <button className="px-4 py-2 rounded-lg bg-gray-200 text-minimal-blue font-bold hover:bg-gray-300" onClick={onComment}>댓글</button>
        </>
      )}
    </div>
  );
};

export default ControlBar; 