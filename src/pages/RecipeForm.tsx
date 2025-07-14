import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { colors } from '../constants/materialTheme';
import { downsizeImage } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';
// (즐겨찾기 관련 임포트, 상태, 함수 등은 모두 삭제)

const steps = [
  '기본 정보',
  '재료 입력',
  '조리과정 단계',
  '미리보기 및 저장',
];

interface CookingStep {
  text: string;
  photo?: File | null;
  previewUrl?: string;
}

const recipeSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요.'),
  category: z.string().min(1, '카테고리를 선택하세요.'),
  time: z.string().min(1, '조리시간을 입력하세요.'),
  difficulty: z.string().min(1, '난이도를 선택하세요.'),
  ingredients: z.string().min(1, '재료를 입력하세요.'),
});

const RecipeForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [time, setTime] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([{ text: '', photo: null, previewUrl: '' }]);
  const [currentCookingStepIdx, setCurrentCookingStepIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(false);
  const [finalPhoto, setFinalPhoto] = useState<File | null>(null);
  const [finalPhotoPreview, setFinalPhotoPreview] = useState<string>('');
  const [finalPhotoThumbnail, setFinalPhotoThumbnail] = useState<File | null>(null);
  const [finalPhotoThumbnailPreview, setFinalPhotoThumbnailPreview] = useState<string>('');
  const { user } = useAuth();
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  // (즐겨찾기 관련 상태, 함수 등은 모두 삭제)

  // 레시피가 즐겨찾기인지 Firestore에서 확인
  useEffect(() => {
    if (!id) return; // 생성 모드
    // 수정 모드: 기존 레시피 데이터 불러오기
    setLoading(true);
    getDoc(doc(db, 'recipes', id)).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title || '');
        setCategory(data.category || '');
        setTime(data.time || '');
        setDifficulty(data.difficulty || '');
        setIngredients(Array.isArray(data.ingredients) ? data.ingredients.join('\n') : (data.ingredients || ''));
        setCookingSteps(Array.isArray(data.cookingSteps) && data.cookingSteps.length > 0 ? data.cookingSteps : [{ text: '', photo: null, previewUrl: '' }]);
        setFinalPhoto(null); // 기존 이미지는 미리보기로만 제공, 새로 업로드 시에만 변경
        setFinalPhotoPreview(data.finalPhoto || '');
        setFinalPhotoThumbnail(null);
        setFinalPhotoThumbnailPreview(data.finalPhotoThumbnail || '');
      }
      setLoading(false);
    });
  }, [id]);

  // 즐겨찾기 추가
  const handleAddFavorite = async (categoryId: string) => {
    // 즐겨찾기 관련 코드 삭제
  };

  // 즐겨찾기 해제
  const handleRemoveFavorite = async () => {
    // 즐겨찾기 관련 코드 삭제
  };

  // Step navigation
  const handleNext = () => {
    if (step === 2) return; // 조리과정 단계는 내부에서 따로 관리
    if (step < steps.length - 1) setStep(step + 1);
  };
  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };
  const handlePreview = () => {
    setPreview(true);
    setStep(steps.length - 1);
  };
  const handleEdit = () => {
    setPreview(false);
    setStep(0);
  };

  // Cooking step navigation
  const handleCookingStepChange = (val: string) => {
    setCookingSteps(prev => prev.map((s, idx) => idx === currentCookingStepIdx ? { ...s, text: val } : s));
  };
  const handleCookingPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        // 이미지 다운사이징 (최대 800x600)
        const resizedImageDataUrl = await downsizeImage(file, 800, 600);
        
        // DataURL을 Blob으로 변환하여 File 객체 생성
        const response = await fetch(resizedImageDataUrl);
        const blob = await response.blob();
        const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
        
        setCookingSteps(prev => prev.map((s, idx) => 
          idx === currentCookingStepIdx 
            ? { ...s, photo: resizedFile, previewUrl: resizedImageDataUrl } 
            : s
        ));
      } catch (error) {
        console.error('이미지 리사이징 중 오류:', error);
        // 리사이징 실패 시 원본 파일 사용
        const reader = new FileReader();
        reader.onloadend = () => {
          setCookingSteps(prev => prev.map((s, idx) => 
            idx === currentCookingStepIdx 
              ? { ...s, photo: file, previewUrl: reader.result as string } 
              : s
          ));
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const handleNextCookingStep = () => {
    // Save current step, move to next (new or existing)
    if (currentCookingStepIdx === cookingSteps.length - 1) {
      setCookingSteps(prev => [...prev, { text: '', photo: null, previewUrl: '' }]);
      setCurrentCookingStepIdx(idx => idx + 1);
    } else {
      setCurrentCookingStepIdx(idx => idx + 1);
    }
  };
  const handlePrevCookingStep = () => {
    if (currentCookingStepIdx > 0) setCurrentCookingStepIdx(idx => idx - 1);
  };
  const handleCompleteCookingSteps = () => {
    setStep(3); // 미리보기 단계로 이동
    setPreview(true);
  };

  // Progress bar width
  const progress = ((step + 1) / steps.length) * 100;

  const validateForm = () => {
    const result = recipeSchema.safeParse({ title, category, time, difficulty, ingredients });
    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((e) => {
        if (e.path[0]) errors[e.path[0] as string] = e.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  // 최종 제출
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      // 재료: 각 항목 앞뒤 공백 및 - 문자 제거
      const cleanedIngredients = ingredients
        .split('\n')
        .map(i => i.replace(/^[-\s]+/, '').trim())
        .filter(Boolean);
      // 조리과정: text가 비어있는 단계 제외
      const cleanedCookingSteps = cookingSteps
        .filter(s => s.text && s.text.trim())
        .map(s => ({ ...s, text: s.text.trim() }));
      if (cleanedCookingSteps.length === 0) {
        setError('조리과정은 1개 이상 입력해야 합니다.');
        setLoading(false);
        return;
      }
      const recipeData = {
        title,
        category,
        time,
        difficulty,
        ingredients: cleanedIngredients,
        cookingSteps: cleanedCookingSteps,
        finalPhoto: finalPhotoPreview,
        finalPhotoThumbnail: finalPhotoThumbnailPreview,
        userId: user?.uid || '',
        updatedAt: Timestamp.now(),
      };
      if (id) {
        await updateDoc(doc(db, 'recipes', id), recipeData);
        setSuccess(true);
        setLoading(false);
        alert('레시피가 성공적으로 수정되었습니다!');
        navigate(`/recipes/${id}`);
      } else {
        await addDoc(collection(db, 'recipes'), {
          ...recipeData,
          createdAt: Timestamp.now(),
        });
        setSuccess(true);
        setLoading(false);
        setTitle('');
        setCategory('');
        setTime('');
        setDifficulty('');
        setIngredients('');
        setCookingSteps([{ text: '', photo: null, previewUrl: '' }]);
        setFinalPhoto(null);
        setFinalPhotoPreview('');
        setFinalPhotoThumbnail(null);
        setFinalPhotoThumbnailPreview('');
      }
    } catch (err: any) {
      setError('저장 중 오류가 발생했습니다.');
      setLoading(false);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleFinalPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        // 1. 상세용(800x600) 리사이즈
        const originalResizedDataUrl = await downsizeImage(file, 800, 600);
        const originalBlob = await (await fetch(originalResizedDataUrl)).blob();
        const originalFile = new File([originalBlob], file.name, { type: 'image/jpeg' });
        setFinalPhoto(originalFile);
        // 2. 썸네일(600x400) 리사이즈
        const thumbDataUrl = await downsizeImage(file, 600, 400);
        const thumbBlob = await (await fetch(thumbDataUrl)).blob();
        const thumbFile = new File([thumbBlob], `thumb_${file.name}`, { type: 'image/jpeg' });
        setFinalPhotoThumbnail(thumbFile);
        setFinalPhotoPreview(thumbDataUrl); // 미리보기는 썸네일로
        setFinalPhotoThumbnailPreview(thumbDataUrl);
      } catch (error) {
        console.error('이미지 리사이징 중 오류:', error);
        setFinalPhoto(file);
        setFinalPhotoThumbnail(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFinalPhotoPreview(reader.result as string);
          setFinalPhotoThumbnailPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // loading 상태 처리
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-2 md:px-0" style={{ background: '#F5F5F5' }}>
      <div className="w-full max-w-lg mt-8">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: '#FF9800' }}
          />
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          {/* Step 1: 기본 정보 */}
          {step === 0 && (
            <>
              {/* Title Card */}
              <div className="flex flex-col items-center bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6">
                <img src="/image/recipe_book.png" alt="레시피북 아이콘" className="w-12 h-12 mb-2" />
                <h2 className="text-2xl md:text-3xl font-bold text-center tracking-tight mb-0" style={{ color: '#1A202C' }}>{steps[step]}</h2>
              </div>
              {/* Input Card */}
              <div className="bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6">
                <div className="mb-4">
                  <label className="block mb-1 font-semibold" style={{ color: '#1A202C' }}>제목</label>
                  <input
                    className="w-full rounded-lg px-3 py-2 border border-[#E0E0E0] focus:border-[#FF9800] transition-all duration-200 bg-white placeholder:text-gray-400 text-[#1A202C]"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="예) 엄마표 김치찌개"
                  />
                  {formErrors.title && <div className="text-red-500 text-xs mt-1">{formErrors.title}</div>}
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-semibold" style={{ color: '#1A202C' }}>카테고리</label>
                  <select
                    className="w-full rounded-lg px-3 py-2 border border-[#E0E0E0] focus:border-[#FF9800] transition-all duration-200 bg-white text-[#1A202C]"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                  >
                    <option value="">선택하세요</option>
                    <option value="집밥">집밥</option>
                    <option value="술안주">술안주</option>
                    <option value="디저트">디저트</option>
                    <option value="간식">간식</option>
                    <option value="반찬">반찬</option>
                    <option value="기타">기타</option>
                  </select>
                  {formErrors.category && <div className="text-red-500 text-xs mt-1">{formErrors.category}</div>}
                </div>
                <div className="mb-4 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                  <div className="flex-1">
                    <label className="block mb-1 font-semibold" style={{ color: '#1A202C' }}>조리 시간</label>
                    <select
                      className="w-full rounded-lg px-3 py-2 border border-[#E0E0E0] focus:border-[#FF9800] transition-all duration-200 bg-white text-[#1A202C]"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="5분">5분</option>
                      <option value="10분">10분</option>
                      <option value="15분">15분</option>
                      <option value="20분">20분</option>
                      <option value="25분">25분</option>
                      <option value="30분">30분</option>
                      <option value="40분">40분</option>
                      <option value="50분">50분</option>
                      <option value="1시간">1시간</option>
                      <option value="2시간">2시간</option>
                      <option value="기타">기타</option>
                    </select>
                    {formErrors.time && <div className="text-red-500 text-xs mt-1">{formErrors.time}</div>}
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-semibold" style={{ color: '#1A202C' }}>난이도</label>
                    <select
                      className="w-full rounded-lg px-3 py-2 border border-[#E0E0E0] focus:border-[#FF9800] transition-all duration-200 bg-white text-[#1A202C]"
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="쉬움">쉬움</option>
                      <option value="보통">보통</option>
                      <option value="어려움">어려움</option>
                    </select>
                    {formErrors.difficulty && <div className="text-red-500 text-xs mt-1">{formErrors.difficulty}</div>}
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-2">
                {id && (
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg font-bold bg-gray-300 text-gray-800 border border-[#E0E0E0] hover:bg-gray-400"
                    onClick={() => navigate(`/recipes/${id}`)}
                    disabled={loading}
                  >
                    취소
                  </button>
                )}
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold bg-[#FF9800] text-white transition-colors duration-200 hover:bg-[#FB8C00] active:bg-[#F57C00]"
                  onClick={handleNext}
                  disabled={loading}
                >
                  다음
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold bg-[#FFECB3] text-[#1A202C] border border-[#E0E0E0] hover:bg-[#FFE082]"
                  onClick={handlePreview}
                  disabled={loading}
                >
                  미리보기
                </button>
              </div>
            </>
          )}

          {/* Step 2: 재료 입력 */}
          {step === 1 && (
            <>
              {/* Title Card */}
              <div className="flex flex-col items-center bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6">
                <img src="/image/material.png" alt="재료 아이콘" className="w-12 h-12 mb-2" />
                <h2 className="text-2xl md:text-3xl font-bold text-center tracking-tight mb-0" style={{ color: '#1A202C' }}>{steps[step]}</h2>
              </div>
              {/* Input Card */}
              <div className="bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6 flex flex-col items-center">
                <textarea
                  className="w-full rounded-lg px-3 py-2 border border-[#E0E0E0] focus:border-[#FF9800] transition-all duration-200 bg-white placeholder:text-gray-400 text-[#1A202C]"
                  value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  rows={8}
                  placeholder={"예) 돼지고기\n김치\n두부"}
                />
                {formErrors.ingredients && <div className="text-red-500 text-xs mt-1">{formErrors.ingredients}</div>}
              </div>
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-2">
                {id && (
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg font-bold bg-gray-300 text-gray-800 border border-[#E0E0E0] hover:bg-gray-400"
                    onClick={() => navigate(`/recipes/${id}`)}
                    disabled={loading}
                  >
                    취소
                  </button>
                )}
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold bg-[#FFECB3] text-[#1A202C] border border-[#E0E0E0] hover:bg-[#FFE082]"
                  onClick={handlePrev}
                  disabled={loading}
                >
                  이전
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold bg-[#FF9800] text-white transition-colors duration-200 hover:bg-[#FB8C00] active:bg-[#F57C00]"
                  onClick={handleNext}
                  disabled={loading}
                >
                  다음
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold bg-[#FFECB3] text-[#1A202C] border border-[#E0E0E0] hover:bg-[#FFE082]"
                  onClick={handlePreview}
                  disabled={loading}
                >
                  미리보기
                </button>
              </div>
            </>
          )}

          {/* Step 3: 조리과정 단계 */}
          {step === 2 && (
            <>
              {/* Title Card */}
              <div className="flex flex-col items-center bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6">
                <img src="/image/cooking.png" alt="조리과정 아이콘" className="w-12 h-12 mb-2" />
                <h2 className="text-2xl md:text-3xl font-bold text-center tracking-tight mb-0" style={{ color: '#1A202C' }}>{steps[step]}</h2>
              </div>
              {/* Input Card */}
              <div className="bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6">
                {/* 누적된 조리과정 표시 */}
                {cookingSteps.slice(0, currentCookingStepIdx).length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold mb-2" style={{ color: '#1A202C' }}>
                      이전에 입력한 조리과정
                    </div>
                    <ol className="list-decimal ml-5">
                      {cookingSteps.slice(0, currentCookingStepIdx).map((s, idx) => (
                        <li key={idx} className="mb-1">
                          <div>{s.text}</div>
                          {s.photo && <div className="text-xs text-[#FF9800]">사진 첨부됨</div>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {/* 조리과정 입력 */}
                <div className="mb-2">
                  <label className="block mb-1 font-semibold" style={{ color: '#1A202C' }}>조리과정 {currentCookingStepIdx + 1}</label>
                  <textarea
                    className="w-full rounded-lg px-3 py-2 border border-[#E0E0E0] focus:border-[#FF9800] transition-all duration-200 bg-white placeholder:text-gray-400 text-[#1A202C]"
                    value={cookingSteps[currentCookingStepIdx]?.text || ''}
                    onChange={e => handleCookingStepChange(e.target.value)}
                    rows={6}
                    placeholder="예) 냄비에 물을 붓고 끓입니다."
                  />
                  {cookingSteps[currentCookingStepIdx]?.previewUrl && (
                    <div className="mt-2">
                      <img src={cookingSteps[currentCookingStepIdx].previewUrl} alt="조리과정 미리보기" className="w-32 h-32 object-cover rounded-lg border border-[#E0E0E0]" />
                    </div>
                  )}
                </div>
                {/* 사진 추가 */}
                <div className="mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="cooking-photo-upload"
                    style={{ display: 'none' }}
                    onChange={handleCookingPhotoChange}
                  />
                  <label htmlFor="cooking-photo-upload" className="inline-block px-3 py-1 bg-[#FFECB3] text-[#FF9800] rounded-lg cursor-pointer hover:bg-[#FFE082]">
                    사진추가
                  </label>
                  {cookingSteps[currentCookingStepIdx]?.photo && (
                    <span className="ml-2 text-sm text-[#FF9800]">{cookingSteps[currentCookingStepIdx]?.photo?.name}</span>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-2">
                {id && (
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg font-bold bg-gray-300 text-gray-800 border border-[#E0E0E0] hover:bg-gray-400"
                    onClick={() => navigate(`/recipes/${id}`)}
                    disabled={loading}
                  >
                    취소
                  </button>
                )}
                <button
                  type="button"
                  className={`px-6 py-2 rounded-lg font-bold bg-[#FFECB3] text-[#1A202C] border border-[#E0E0E0] hover:bg-[#FFE082] ${currentCookingStepIdx === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handlePrevCookingStep}
                  disabled={currentCookingStepIdx === 0}
                >
                  이전단계
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold bg-[#FF9800] text-white transition-colors duration-200 hover:bg-[#FB8C00] active:bg-[#F57C00]"
                  onClick={handleNextCookingStep}
                >
                  다음단계
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold bg-[#FF9800] text-white transition-colors duration-200 hover:bg-[#FB8C00] active:bg-[#F57C00]"
                  onClick={handleCompleteCookingSteps}
                >
                  완료
                </button>
              </div>
            </>
          )}

          {/* Step 4: 미리보기 및 저장 */}
          {step === 3 && (
            <>
              {/* Title Card */}
              <div className="flex flex-col items-center bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6">
                <img src="/image/preview.png" alt="미리보기 아이콘" className="w-12 h-12 mb-2" />
                <h2 className="text-2xl md:text-3xl font-bold text-center tracking-tight mb-0" style={{ color: '#1A202C' }}>{steps[step]}</h2>
              </div>
              {/* Preview Card */}
              <div className="bg-white rounded-lg border border-[#E0E0E0] p-6 mb-6">
                <div className="mb-2"><b>제목:</b> <span className="text-[#1A202C]">{title}</span></div>
                <div className="mb-2"><b>카테고리:</b> <span className="text-[#1A202C]">{category}</span></div>
                <div className="mb-2"><b>조리 시간:</b> <span className="text-[#1A202C]">{time}</span></div>
                <div className="mb-2"><b>난이도:</b> <span className="text-[#1A202C]">{difficulty}</span></div>
                <div className="mb-2"><b>재료:</b><br />{ingredients.split('\n').map((i, idx) => <div key={idx} className="text-[#1A202C]">- {i}</div>)}</div>
                <div className="mb-2"><b>조리과정:</b>
                  <ol className="list-decimal ml-5">
                    {cookingSteps.filter(s => s.text.trim()).map((s, idx) => (
                      <li key={idx} className="mb-2 text-[#1A202C]">
                        <div>{s.text}</div>
                        {s.photo && <div className="text-xs text-[#FF9800]">사진 첨부됨</div>}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mb-2">
                  <b>완성된 음식 사진:</b>
                  <input
                    type="file"
                    accept="image/*"
                    id="final-photo-upload"
                    style={{ display: 'block', marginTop: 8 }}
                    onChange={handleFinalPhotoChange}
                  />
                  {finalPhotoPreview && (
                    <div className="mt-2">
                      <img src={finalPhotoPreview} alt="완성사진 미리보기" className="w-40 h-40 object-cover rounded-lg border border-[#E0E0E0]" />
                    </div>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-2">
                {id && (
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg font-bold bg-gray-300 text-gray-800 border border-[#E0E0E0] hover:bg-gray-400"
                    onClick={() => navigate(`/recipes/${id}`)}
                    disabled={loading}
                  >
                    취소
                  </button>
                )}
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg font-bold bg-[#FFECB3] text-[#1A202C] border border-[#E0E0E0] hover:bg-[#FFE082]"
                  onClick={handleEdit}
                  disabled={loading}
                >
                  수정하기
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg font-bold bg-[#FF9800] text-white transition-colors duration-200 hover:bg-[#FB8C00] active:bg-[#F57C00]"
                  disabled={loading}
                >
                  {loading ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </>
          )}

          {error && <ErrorMessage message={error} onRetry={handleSubmit} />}
          {success && <Toast message="레시피가 성공적으로 등록되었습니다!" type="success" onClose={() => setSuccess(false)} />}
        </form>
      </div>
    </div>
  );
};

export default RecipeForm; 