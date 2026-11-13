import React, { useState, useCallback, useEffect, useRef } from 'react';

export function useTableResize(initialWidths, storageKey = null) {
  const [widths, setWidths] = useState(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`csa_col_widths_${storageKey}`);
        if (saved) {
          return { ...initialWidths, ...JSON.parse(saved) };
        }
      } catch (e) {}
    }
    return initialWidths;
  });

  const [activeResizer, setActiveResizer] = useState(null);
  const widthsRef = useRef(widths);
  widthsRef.current = widths;

  // Failsafe cleanup: reset cursor and userSelect on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  // Save to localStorage when widths change
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(`csa_col_widths_${storageKey}`, JSON.stringify(widths));
      } catch (e) {}
    }
  }, [widths, storageKey]);

  const handleMouseDown = useCallback((colKey, e, minWidth = 50) => {
    let key = colKey;
    let evt = e;

    if (!evt && colKey && colKey.clientX !== undefined) {
      evt = colKey;
      key = null;
    }

    if (evt && evt.preventDefault) {
      try {
        evt.preventDefault();
        evt.stopPropagation();
      } catch (err) {}
    }

    if (!key) return;

    const startX = evt ? (evt.touches ? evt.touches[0].clientX : evt.clientX) : 0;
    const startWidth = widthsRef.current[key] || initialWidths[key] || 100;
    setActiveResizer(key);

    try {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } catch (err) {}

    let rafId = null;

    const handleMouseMove = (moveEvent) => {
      const clientX = moveEvent.touches && moveEvent.touches.length > 0
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;

      if (typeof clientX !== 'number') return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const deltaX = clientX - startX;
        const newWidth = Math.max(minWidth, Math.round(startWidth + deltaX));
        setWidths((prev) => {
          if (prev[key] === newWidth) return prev;
          return {
            ...prev,
            [key]: newWidth
          };
        });
      });
    };

    const handleMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      setActiveResizer(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
      window.removeEventListener('blur', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
  }, [initialWidths]);

  const handleDoubleClick = useCallback((colKey) => {
    if (typeof colKey === 'string' && initialWidths[colKey]) {
      setWidths((prev) => ({
        ...prev,
        [colKey]: initialWidths[colKey]
      }));
    }
  }, [initialWidths]);

  const resetAll = useCallback(() => {
    setWidths(initialWidths);
    if (storageKey) {
      try {
        localStorage.removeItem(`csa_col_widths_${storageKey}`);
      } catch (e) {}
    }
  }, [initialWidths, storageKey]);

  return {
    widths,
    handleMouseDown,
    handleDoubleClick,
    resetAll,
    activeResizer
  };
}

/**
 * Excel-Style Resize Handle component
 */
export function ResizeHandle({ columnId, onMouseDown, onDoubleClick, isActive = false }) {
  const handleStart = (e) => {
    e.stopPropagation();
    if (onMouseDown) {
      onMouseDown(columnId, e);
    }
  };

  return (
    <div
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick && onDoubleClick(columnId);
      }}
      className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize select-none z-30 group flex items-center justify-center transition-colors touch-none ${
        isActive ? 'bg-blue-500/15' : 'hover:bg-blue-500/10'
      }`}
      title="Click and drag to resize column (Double-click to reset)"
    >
      {/* Visual column divider line */}
      <div
        className={`w-[2px] h-full transition-all duration-150 ${
          isActive
            ? 'bg-[#0093dd] w-[3px]'
            : 'bg-slate-300 group-hover:bg-[#0093dd] group-hover:w-[2.5px]'
        }`}
      />
      {/* Center grip indicator pill */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-full transition-all duration-150 ${
          isActive
            ? 'bg-[#0093dd] scale-110 shadow-xs'
            : 'bg-slate-400 opacity-0 group-hover:opacity-100 group-hover:bg-[#0093dd]'
        }`}
      />
    </div>
  );
}
