import React, { useEffect, useState, useRef, useCallback } from 'react';
import { colors, shadows, fonts } from '../constants/materialTheme';
import { downsizeImage, getCachedImage, setCachedImage, useLazyImage, getPlaceholderImage } from '../utils/imageUtils';

interface RecipeCardProps {
  image?: string;
  title?: string;
  description?: string;
  tags?: string[];
  time?: string;
  rating?: number;
  difficulty?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = (props) => {
  const [displayImage, setDisplayImage] = useState<string | undefined>(undefined);
  const [imgLoading, setImgLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Lazy load trigger
  useLazyImage(imgRef, useCallback(() => setIsVisible(true), []));

  useEffect(() => {
    if (!isVisible) {
      setDisplayImage(undefined);
      return;
    }
    if (props.image && typeof props.image !== 'string') {
      const cacheKey = (props.image as File).name + (props.image as File).size;
      const cached = getCachedImage(cacheKey);
      if (cached) {
        setDisplayImage(cached);
      } else {
        setImgLoading(true);
        downsizeImage(props.image, 600, 400)
          .then((dataUrl) => {
            setCachedImage(cacheKey, dataUrl);
            setDisplayImage(dataUrl);
          })
          .finally(() => setImgLoading(false));
      }
    } else if (typeof props.image === 'string') {
      const urlObj = new URL(props.image, window.location.origin);
      urlObj.search = '';
      const cacheKey = `url_${urlObj.toString()}`;
      const cached = getCachedImage(cacheKey);
      if (cached) {
        setDisplayImage(cached);
      } else {
        setImgLoading(true);
        fetch(props.image)
          .then(res => {
            if (!res.ok) throw new Error('이미지 로드 실패');
            return res.blob();
          })
          .then(blob => downsizeImage(blob, 600, 400))
          .then((dataUrl) => {
            setCachedImage(cacheKey, dataUrl);
            setDisplayImage(dataUrl);
          })
          .catch(error => {
            console.error('이미지 리사이징 실패:', error);
            setDisplayImage(props.image); // 실패 시 원본 사용
          })
          .finally(() => setImgLoading(false));
      }
    }
  }, [props.image, isVisible]);

  return (
    <div
      className="bg-white rounded-2xl shadow-md p-4 mb-2 transition hover:shadow-lg border"
      style={{
        boxShadow: shadows.elevation1,
        border: 'none',
        fontFamily: fonts.main,
      }}
    >
      <img
        ref={imgRef}
        src={displayImage && !imgLoading ? displayImage : getPlaceholderImage()}
        alt={props.title}
        className="w-full h-48 object-cover rounded-xl mb-3 bg-blue-100"
        style={{ backgroundColor: colors.blueLight }}
        loading="lazy"
      />
      <h2 className="text-xl font-bold mb-1" style={{ color: colors.blueDeep, fontFamily: fonts.main }}>{props.title}</h2>
      {props.tags && props.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {props.tags.map((tag, idx) => (
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
        {props.time && (
          <span className="text-gray-600 flex items-center">
            <span className="mr-1">⏰</span>{props.time}
          </span>
        )}
        {typeof props.rating === 'number' && (
          <span className="text-yellow-600 flex items-center">
            <span className="mr-1">⭐</span>{props.rating}
          </span>
        )}
        {props.difficulty && (
          <span className="text-blue-600 flex items-center">
            <span className="mr-1">난이도:</span>{props.difficulty}
          </span>
        )}
      </div>
      {props.description && <p className="text-gray-700 mt-2">{props.description}</p>}
    </div>
  );
};

export default React.memo(RecipeCard); 