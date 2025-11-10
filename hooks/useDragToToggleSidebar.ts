import { useState, useRef, useEffect } from 'react';
import { UI_CONFIG } from '@/constants/ui';

interface UseDragToToggleSidebarOptions {
  direction: 'left' | 'right';
  onToggle: () => void;
}

export function useDragToToggleSidebar({ direction, onToggle }: UseDragToToggleSidebarOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const handleDragStart = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth < UI_CONFIG.SIDEBAR.MOBILE_BREAKPOINT) {
      return;
    }
    setIsDragging(true);
    dragStartX.current = e.clientX;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;

      if (Math.abs(deltaX) > UI_CONFIG.SIDEBAR.DRAG_THRESHOLD) {
        const shouldToggle =
          (direction === 'left' && deltaX < 0) ||
          (direction === 'right' && deltaX > 0);

        if (shouldToggle) {
          onToggle();
          setIsDragging(false);
        }
      }
    };

    const handleDragEnd = () => setIsDragging(false);

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, direction, onToggle]);

  return { handleDragStart };
}
