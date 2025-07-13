// 이 파일은 Tailwind CSS 커스텀 테마(tailwind.config.js)와 일치하도록 정비되었습니다.
// 스타일은 Tailwind 유틸리티(예: bg-minimal-blue, text-minimal-text, shadow-minimal, font-minimal 등)로 직접 사용하는 것을 권장합니다.
// 필요시 theme 확장값을 import해서 쓸 수 있습니다.

export const colors = {
  blue: '#2196F3',
  blueLight: '#BBDEFB',
  blueDark: '#1976D2',
  blueDeep: '#0D47A1',
  white: '#FFFFFF',
  grayLight: '#F8F8F8',
  text: '#1A202C',
};

export const shadows = {
  minimal: '0px 2px 4px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.15)',
  button: '0px 2px 4px rgba(0,0,0,0.15)',
};

export const borders = {
  default: '1px solid rgba(0,0,0,0.1)',
  blue: '1px solid #1976D2',
};

export const fonts = {
  main: 'Inter, sans-serif',
  weightBold: 700,
  weightSemi: 600,
}; 