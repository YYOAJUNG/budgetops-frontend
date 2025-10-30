/**
 * UI 관련 상수 정의
 */

export const UI_CONFIG = {
  SIDEBAR: {
    WIDTH: 'w-64',
    MOBILE_BREAKPOINT: 1024,
    DRAG_THRESHOLD: 50,
  },
  ANIMATIONS: {
    DURATION: 'duration-300',
    EASE: 'ease-in-out',
  },
  COLORS: {
    PRIMARY: 'blue',
    HOVER_BG: 'gray-50',
    BORDER: 'gray-200',
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * 현재 화면 크기가 모바일인지 확인
 */
export const isMobile = (width?: number): boolean => {
  const w = width ?? (typeof window !== 'undefined' ? window.innerWidth : 0);
  return w < BREAKPOINTS.lg;
};
