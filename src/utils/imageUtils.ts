// 이미지 다운사이징 및 캐시 유틸리티
// Modern Minimal Blue 테마 프로젝트 기준

/**
 * 이미지를 지정된 최대 너비/높이로 다운사이징하여 DataURL로 반환합니다.
 * @param file 이미지 파일 (File 또는 Blob)
 * @param maxWidth 최대 너비 (px)
 * @param maxHeight 최대 높이 (px)
 * @returns Promise<string> 다운사이즈된 이미지 DataURL
 */
export async function downsizeImage(file: File | Blob, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Failed to convert canvas to blob'));
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.85);
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 간단한 이미지 캐시 래퍼 (메모리 기반)
 */
const imageCache = new Map<string, string>();

export function getCachedImage(key: string): string | undefined {
  return imageCache.get(key);
}

export function setCachedImage(key: string, dataUrl: string): void {
  imageCache.set(key, dataUrl);
} 