import os
from PIL import Image

IMG_DIR = os.path.dirname(__file__)
TARGET_SIZE = (600, 400)
QUALITY = 85

for fname in os.listdir(IMG_DIR):
    if fname.lower().endswith('.png'):
        path = os.path.join(IMG_DIR, fname)
        with Image.open(path) as img:
            img = img.convert('RGB')
            img = img.resize(TARGET_SIZE, Image.LANCZOS)
            # PNG로 덮어쓰기
            img.save(path, format='PNG', optimize=True, quality=QUALITY)
            # WebP로도 저장
            webp_path = os.path.splitext(path)[0] + '.webp'
            img.save(webp_path, format='WEBP', quality=QUALITY)
print('이미지 리사이즈 및 압축 완료') 