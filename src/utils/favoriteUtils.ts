import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc, getDoc, query, where } from 'firebase/firestore';
import { storage } from '../firebase';
import { deleteObject, ref as storageRef } from 'firebase/storage';

// 즐겨찾기 추가
export async function addFavorite(uid: string, recipeId: string, categoryId: string) {
  await setDoc(doc(db, 'users', uid, 'favorites', recipeId), {
    recipeId,
    categoryId,
    createdAt: new Date(),
  });
}

// 즐겨찾기 해제
export async function removeFavorite(uid: string, recipeId: string) {
  await deleteDoc(doc(db, 'users', uid, 'favorites', recipeId));
}

// 즐겨찾기 여부 확인
export async function checkFavorite(uid: string, recipeId: string): Promise<boolean> {
  const docRef = doc(db, 'users', uid, 'favorites', recipeId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

// 카테고리 목록 가져오기
export async function getFavoriteCategories(uid: string): Promise<any[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'favoriteCategories'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function addFavoriteCategory(uid: string, name: string) {
  const docRef = await addDoc(collection(db, 'users', uid, 'favoriteCategories'), { name, createdAt: new Date() });
  return { id: docRef.id, name };
}
export async function updateFavoriteCategory(uid: string, categoryId: string, name: string) {
  await updateDoc(doc(db, 'users', uid, 'favoriteCategories', categoryId), { name });
}
export async function deleteFavoriteCategory(uid: string, categoryId: string) {
  await deleteDoc(doc(db, 'users', uid, 'favoriteCategories', categoryId));
}

// 즐겨찾기 카테고리별 레시피 목록 가져오기
export async function getFavoriteRecipesByCategory(uid: string, categoryId: string) {
  // 1. 해당 카테고리의 즐겨찾기 목록(favorites)에서 recipeId만 추출
  const favSnap = await getDocs(query(collection(db, 'users', uid, 'favorites'), where('categoryId', '==', categoryId)));
  const recipeIds = favSnap.docs.map(doc => doc.data().recipeId);
  if (recipeIds.length === 0) return [];
  // 2. recipeId로 recipes 컬렉션에서 레시피 정보 가져오기 (batch)
  // Firestore는 in 쿼리로 최대 10개씩만 지원하므로, 10개씩 나눠서 요청
  const allRecipes: any[] = [];
  for (let i = 0; i < recipeIds.length; i += 10) {
    const batch = recipeIds.slice(i, i + 10);
    const recipeSnap = await getDocs(query(collection(db, 'recipes'), where('__name__', 'in', batch)));
    allRecipes.push(...recipeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }
  return allRecipes;
}

/**
 * 레시피 데이터와 연동된 이미지 파일을 모두 삭제
 * @param recipeId 레시피 문서 ID
 * @param recipeData 레시피 전체 데이터(대표 이미지, 조리과정 이미지 등)
 */
export async function deleteRecipeWithImage(recipeId: string, recipeData: any) {
  // 1. 대표 이미지 삭제
  const imageUrls: string[] = [];
  if (recipeData.finalPhoto) imageUrls.push(recipeData.finalPhoto);
  if (Array.isArray(recipeData.cookingSteps)) {
    recipeData.cookingSteps.forEach((step: any) => {
      if (step.photo) imageUrls.push(step.photo);
    });
  }
  // 2. 이미지 파일 Storage에서 삭제
  for (const url of imageUrls) {
    try {
      // Storage URL에서 경로 추출
      const pathMatch = url.match(/(?:\/o\/|%2F)(.+?)(?:\?|$)/);
      const path = pathMatch ? decodeURIComponent(pathMatch[1]) : null;
      if (path) {
        await deleteObject(storageRef(storage, path));
      }
    } catch (e) {
      // 이미지가 없거나 이미 삭제된 경우 무시
      // 필요시 에러 로깅
    }
  }
  // 3. 레시피 문서 삭제
  await deleteDoc(doc(db, 'recipes', recipeId));
}

/**
 * 모든 사용자의 즐겨찾기에서 특정 레시피 문서를 일괄 삭제
 * @param recipeId 레시피 문서 ID
 */
export async function deleteAllFavoritesForRecipe(recipeId: string) {
  const usersSnap = await getDocs(collection(db, 'users'));
  const batchPromises: Promise<any>[] = [];
  usersSnap.forEach(userDoc => {
    const uid = userDoc.id;
    const favRef = doc(db, 'users', uid, 'favorites', recipeId);
    batchPromises.push(deleteDoc(favRef));
  });
  await Promise.all(batchPromises);
} 