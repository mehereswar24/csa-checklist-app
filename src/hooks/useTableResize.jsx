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

  // Save to localStorage when widths change
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(`csa_col_widths_${storageKey}`, JSON.stringify(widths));
      } catch (e) {}
    }
  }, [widths, storageKey]);

  const handleMouseDown = useCallback((colKey, e, minWidth = 50) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = widths[colKey] || 100;
    setActiveResizer(colKey);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(minWidth, startWidth + deltaX);
      setWidths((prev) => ({
        ...prev,
        [colKey]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setActiveResizer(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [widths]);

  const handleDoubleClick = useCallback((colKey) => {
    if (initialWidths[colKey]) {
      setWidths((prev) => ({
        ...prev,
        [colKey]: initialWidths[colKey]
      }));
    }
  }, [initialWidths]);

  const resetAll = useCallback(() => {
    setWidths(initialWidths);
    if (storageKey) {
      localStorage.removeItem(`csa_col_widths_${storageKey}`);
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
export function ResizeHandle({ onMouseDown, onDoubleClick, active = false }) {
  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      className={`absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize select-none z-20 group transition-colors ${
        active ? 'bg-indigo-400' : 'hover:bg-indigo-400/80'
      }`}
      title="Drag to resize column (Double-click to reset)"
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-white/40 group-hover:bg-white transition-colors" />
    </div>
  );
}
