import React, { useEffect, useState } from 'react';
import { colors, shadows, fonts } from '../constants/materialTheme';
import { downsizeImage, getCachedImage, setCachedImage } from '../utils/imageUtils';

interface RecipeCardProps {
  image?: string;
  title?: string;
  description?: string;
  tags?: string[];
  time?: string;
  rating?: number;
  difficulty?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ image, title, description, tags, time, rating, difficulty }) => {
  const [displayImage, setDisplayImage] = useState<string | undefined>(typeof image === 'string' ? image : undefined);
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    if (image && typeof image !== 'string') {
      const cacheKey = (image as File).name + (image as File).size;
      const cached = getCachedImage(cacheKey);
      if (cached) {
        setDisplayImage(cached);
      } else {
        setImgLoading(true);
        downsizeImage(image, 600, 400)
          .then((dataUrl) => {
            setCachedImage(cacheKey, dataUrl);
            setDisplayImage(dataUrl);
          })
          .finally(() => setImgLoading(false));
      }
    } else if (typeof image === 'string') {
      setDisplayImage(image);
    }
  }, [image]);

  return (
    <div
      className="bg-white rounded-2xl shadow-md p-4 mb-2 transition hover:shadow-lg border"
      style={{
        boxShadow: shadows.elevation1,
        border: 'none',
        fontFamily: fonts.main,
      }}
    >
      {displayImage && !imgLoading ? (
        <img
          src={displayImage}
          alt={title}
          className="w-full h-48 object-cover rounded-xl mb-3 bg-blue-100"
          style={{ backgroundColor: colors.blueLight }}
        />
      ) : imgLoading ? (
        <div className="w-full h-48 flex items-center justify-center rounded-xl mb-3 bg-blue-50 text-blue-400 animate-pulse">
          이미지 처리 중...
        </div>
      ) : null}
      <h2 className="text-xl font-bold mb-1" style={{ color: colors.blueDeep, fontFamily: fonts.main }}>{title}</h2>
      {tags && tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-block rounded px-2 py-1 text-xs"
              style={{ background: colors.blueLight, color: colors.blueDark }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-sm mb-1">
        {time && (
          <span className="text-gray-600 flex items-center">
            <span className="mr-1">⏰</span>{time}
          </span>
        )}
        {typeof rating === 'number' && (
          <span className="text-yellow-600 flex items-center">
            <span className="mr-1">⭐</span>{rating}
          </span>
        )}
        {difficulty && (
          <span className="text-blue-600 flex items-center">
            <span className="mr-1">난이도:</span>{difficulty}
          </span>
        )}
      </div>
      {description && <p className="text-gray-700 mt-2">{description}</p>}
    </div>
  );
};

export default RecipeCard; 