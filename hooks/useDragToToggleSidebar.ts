import { useState, useRef, useEffect } from 'react';
import { UI_CONFIG } from '@/constants/ui';

interface UseDragToToggleSidebarOptions {
  direction: 'left' | 'right';
  onToggle: (shouldOpen: boolean) => void;
}

export function useDragToToggleSidebar({ direction, onToggle }: UseDragToToggleSidebarOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const handleDragStart = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth < UI_CONFIG.SIDEBAR.MOBILE_BREAKPOINT) {
      return; // 모바일에서는 드래그 비활성화
    }
    setIsDragging(true);
    dragStartX.current = e.clientX;
  };

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartX.current;

      // 드래그 거리가 임계값 이상이면 토글
      if (Math.abs(deltaX) > UI_CONFIG.SIDEBAR.DRAG_THRESHOLD) {
        if (direction === 'left') {
          // 왼쪽으로 드래그 -> 닫기
          if (deltaX < 0) {
            onToggle(false);
          }
        } else {
          // 오른쪽으로 드래그 -> 열기
          if (deltaX > 0) {
            onToggle(true);
          }
        }
        setIsDragging(false);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, direction, onToggle]);

  return { isDragging, handleDragStart };
}
