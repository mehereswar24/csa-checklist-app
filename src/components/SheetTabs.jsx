import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, FileSpreadsheet, LayoutDashboard, Users, FileCheck } from 'lucide-react';

export default function SheetTabs({ sheets, activeSheet, onSelectSheet, getSheetScore }) {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const getTabIcon = (sheetName) => {
    if (sheetName === 'Cover Page') return <FileCheck className="w-3.5 h-3.5" />;
    if (sheetName === 'Audit Team') return <Users className="w-3.5 h-3.5" />;
    if (sheetName === 'Summary') return <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />;
    return <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />;
  };

  return (
    <div className="bg-slate-200 border-t border-slate-300 px-2 py-1 flex items-center sticky bottom-0 z-30 shadow-md">
      {/* Scroll Left Button */}
      <button
        onClick={scrollLeft}
        className="p-1.5 hover:bg-slate-300 rounded text-slate-700 transition shrink-0 mr-1"
        title="Scroll tabs left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Tabs List */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sheets.map((sheet) => {
          const isActive = activeSheet === sheet;
          const score = getSheetScore(sheet);

          return (
            <button
              key={sheet}
              onClick={() => onSelectSheet(sheet)}
              className={`px-3 py-1.5 text-xs rounded-t flex items-center gap-2 whitespace-nowrap transition-all border-t border-l border-r ${
                isActive
                  ? 'bg-white text-blue-900 font-bold border-slate-300 border-b-2 border-b-blue-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 border-transparent'
              }`}
            >
              {getTabIcon(sheet)}
              <span>{sheet}</span>

              {/* Score pill for checklist sheets */}
              {score !== null && score !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    score >= 0.75
                      ? 'bg-emerald-100 text-emerald-800'
                      : score >= 0.50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {(score * 100).toFixed(0)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={scrollRight}
        className="p-1.5 hover:bg-slate-300 rounded text-slate-700 transition shrink-0 ml-1"
        title="Scroll tabs right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
