import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// 즐겨찾기 추가
export const addFavorite = async (userId: string, recipeId: string, categoryId: string) => {
  return await addDoc(collection(db, 'favorites'), {
    userId,
    recipeId,
    categoryId,
    createdAt: new Date(),
  });
};

// 즐겨찾기 해제
export const removeFavorite = async (userId: string, recipeId: string) => {
  const q = query(collection(db, 'favorites'), where('userId', '==', userId), where('recipeId', '==', recipeId));
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(docSnap.ref);
  }
};

// 즐겨찾기 여부 확인
export const isFavorite = async (userId: string, recipeId: string) => {
  const q = query(collection(db, 'favorites'), where('userId', '==', userId), where('recipeId', '==', recipeId));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// 내 즐겨찾기 전체 조회 (카테고리별)
export const getFavoritesByUser = async (userId: string) => {
  const q = query(collection(db, 'favorites'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 카테고리 추가
export const addFavoriteCategory = async (userId: string, name: string) => {
  return await addDoc(collection(db, 'favoriteCategories'), {
    userId,
    name,
    createdAt: new Date(),
  });
};

// 카테고리 수정
export const updateFavoriteCategory = async (categoryId: string, name: string) => {
  const ref = doc(db, 'favoriteCategories', categoryId);
  await updateDoc(ref, { name });
};

// 카테고리 삭제
export const deleteFavoriteCategory = async (categoryId: string) => {
  const ref = doc(db, 'favoriteCategories', categoryId);
  await deleteDoc(ref);
};

// 내 카테고리 전체 조회
export const getFavoriteCategoriesByUser = async (userId: string) => {
  const q = query(collection(db, 'favoriteCategories'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}; 