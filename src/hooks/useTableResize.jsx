import React, { useState, useCallback, useEffect } from 'react';

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
    // Failsafe if invoked without proper parameters
    let key = colKey;
    let evt = e;

    if (!evt && colKey && colKey.clientX !== undefined) {
      // Event was passed as first argument
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

    const startX = evt ? evt.clientX : 0;
    const startWidth = widths[key] || initialWidths[key] || 100;
    setActiveResizer(key);

    try {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } catch (err) {}

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(minWidth, startWidth + deltaX);
      setWidths((prev) => ({
        ...prev,
        [key]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setActiveResizer(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('pointerup', handleMouseUp);
      window.removeEventListener('blur', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('pointerup', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
  }, [widths, initialWidths]);

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
  return (
    <div
      onMouseDown={(e) => onMouseDown && onMouseDown(columnId, e)}
      onDoubleClick={() => onDoubleClick && onDoubleClick(columnId)}
      className={`absolute right-0 top-0 bottom-0 w-3 cursor-col-resize select-none z-20 group transition-colors touch-none ${
        isActive ? 'bg-indigo-500' : 'hover:bg-indigo-400/80'
      }`}
      title="Drag to resize column (Double-click to reset)"
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-slate-400/60 group-hover:bg-indigo-600 transition-colors pointer-events-none" />
    </div>
  );
}
