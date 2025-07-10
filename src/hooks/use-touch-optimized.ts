import { useState, useCallback, TouchEvent, MouseEvent } from 'react';

type TouchState = {
  isTouching: boolean;
  touchStartX: number;
  touchStartY: number;
  touchEndX: number;
  touchEndY: number;
};

export function useTouchOptimized() {
  const [touchState, setTouchState] = useState<TouchState>({
    isTouching: false,
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0,
  });

  const handleTouchStart = useCallback((e: TouchEvent | MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setTouchState(prev => ({
      ...prev,
      isTouching: true,
      touchStartX: clientX,
      touchStartY: clientY,
    }));
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent | MouseEvent) => {
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    
    setTouchState(prev => ({
      ...prev,
      isTouching: false,
      touchEndX: clientX,
      touchEndY: clientY,
    }));
  }, []);

  const handleTouchCancel = useCallback(() => {
    setTouchState(prev => ({
      ...prev,
      isTouching: false,
    }));  
  }, []);

  // Calculate swipe direction and distance
  const getSwipeDirection = useCallback(() => {
    const { touchStartX, touchEndX, touchStartY, touchEndY } = touchState;
    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY;
    const xDiffAbs = Math.abs(xDiff);
    const yDiffAbs = Math.abs(yDiff);

    if (xDiffAbs > yDiffAbs) {
      return xDiff > 0 ? 'left' : 'right';
    } else {
      return yDiff > 0 ? 'up' : 'down';
    }
  }, [touchState]);

  // Check if the touch was a tap (not a swipe)
  const isTap = useCallback(() => {
    const { touchStartX, touchEndX, touchStartY, touchEndY } = touchState;
    const xDiff = Math.abs(touchStartX - touchEndX);
    const yDiff = Math.abs(touchStartY - touchEndY);
    
    // Consider it a tap if movement is less than 5px
    return xDiff < 5 && yDiff < 5;
  }, [touchState]);

  return {
    ...touchState,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
    getSwipeDirection,
    isTap,
  };
}
