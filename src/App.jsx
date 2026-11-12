import React, { useState, useEffect, useMemo } from 'react';
import initialData from './csa_data.json';
import CoverPage from './components/CoverPage.jsx';
import AuditTeam from './components/AuditTeam.jsx';
import SummaryDashboard from './components/SummaryDashboard.jsx';
import ChecklistSheet from './components/ChecklistSheet.jsx';
import Sidebar from './components/Sidebar.jsx';
import { THEMES, FONTS } from './themes.js';
import { exportToExcel } from './utils/excelExport.js';
import {
  Download,
  Printer,
  RotateCcw,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  Palette,
  Type,
  Check,
  X
} from 'lucide-react';

const STORAGE_KEY = 'csa_checklist_app_state_v1';
const SIDEBAR_PREF_KEY = 'csa_sidebar_collapsed_pref';
const THEME_PREF_KEY = 'csa_theme_pref';
const FONT_PREF_KEY = 'csa_font_pref';

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
    return initialData;
  });

  const [activeSheet, setActiveSheet] = useState('Summary');
  const [saveNotification, setSaveNotification] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Theme & Font state
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem(THEME_PREF_KEY) || 'indigo';
    } catch (e) {
      return 'indigo';
    }
  });

  const [fontId, setFontId] = useState(() => {
    try {
      return localStorage.getItem(FONT_PREF_KEY) || 'jakarta';
    } catch (e) {
      return 'jakarta';
    }
  });

  const currentTheme = THEMES[themeId] || THEMES.indigo;
  const currentFont = FONTS[fontId] || FONTS.jakarta;

  // Apply font family dynamically
  useEffect(() => {
    document.documentElement.style.setProperty('--font-primary', currentFont.family);
    document.documentElement.style.setProperty('--font-heading', currentFont.family);
    try {
      localStorage.setItem(FONT_PREF_KEY, fontId);
    } catch (e) {}
  }, [fontId, currentFont]);

  // Persist theme
  useEffect(() => {
    try {
      localStorage.setItem(THEME_PREF_KEY, themeId);
    } catch (e) {}
  }, [themeId]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_PREF_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_PREF_KEY, String(next));
      } catch (e) {}
      return next;
    });
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaveNotification(true);
      const timer = setTimeout(() => setSaveNotification(false), 1500);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  // Compute live totals and scores
  const computedData = useMemo(() => {
    const updatedChecklists = data.checklists.map((cl) => {
      const totalScore = cl.questions.reduce((sum, q) => {
        const val = typeof q.score === 'number' ? q.score : 0;
        return sum + val;
      }, 0);
      const divisor = cl.divisor_count || cl.questions.length || 1;
      const maxPossible = divisor * 4;
      const compScore = maxPossible > 0 ? totalScore / maxPossible : 0;

      return {
        ...cl,
        computedTotal: totalScore,
        computedScore: compScore
      };
    });

    const updatedSummaryElements = data.summary.elements.map((elem) => {
      const cl = updatedChecklists.find((c) => c.sheet_name === elem.sheet_ref);
      const score = cl ? cl.computedScore : elem.score;
      return {
        ...elem,
        score: score
      };
    });

    const totalElemScore = updatedSummaryElements.reduce((acc, el) => acc + (el.score || 0), 0);
    const overallScore = updatedSummaryElements.length > 0 ? totalElemScore / updatedSummaryElements.length : 0;

    return {
      ...data,
      checklists: updatedChecklists,
      summary: {
        ...data.summary,
        elements: updatedSummaryElements,
        overall_score: overallScore
      },
      computedOverallScore: overallScore
    };
  }, [data]);

  const handleUpdateQuestion = (sheetName, questionId, field, value) => {
    setData((prev) => {
      const updatedChecklists = prev.checklists.map((cl) => {
        if (cl.sheet_name !== sheetName) return cl;
        const updatedQuestions = cl.questions.map((q) => {
          if (q.id !== questionId) return q;
          return { ...q, [field]: value };
        });
        return { ...cl, questions: updatedQuestions };
      });
      return { ...prev, checklists: updatedChecklists };
    });
  };

  const handleResetToBaseline = () => {
    if (window.confirm('Reset all audit checklist scores and remarks back to the original baseline?')) {
      localStorage.removeItem(STORAGE_KEY);
      setData(initialData);
    }
  };

  const handleExport = () => {
    exportToExcel(computedData);
  };

  const handlePrint = () => {
    window.print();
  };

  const getSheetScore = (sheetName) => {
    if (sheetName === 'Cover Page' || sheetName === 'Audit Team') return null;
    if (sheetName === 'Summary') return computedData.computedOverallScore;
    const cl = computedData.checklists.find((c) => c.sheet_name === sheetName);
    return cl ? cl.computedScore : null;
  };

  const allSheets = ['Cover Page', 'Audit Team', 'Summary', ...data.checklists.map((c) => c.sheet_name)];
  const activeChecklist = computedData.checklists.find((c) => c.sheet_name === activeSheet);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800 transition-colors"
      style={{ fontFamily: currentFont.family }}
    >
      {/* Collapsible Left Sidebar */}
      <Sidebar
        sheets={allSheets}
        activeSheet={activeSheet}
        onSelectSheet={setActiveSheet}
        getSheetScore={getSheetScore}
        overallScore={computedData.computedOverallScore}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        theme={currentTheme}
      />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header
          className={`${currentTheme.headerBg} text-white shrink-0 shadow-sm border-b ${currentTheme.headerBorder} no-print z-20 transition-all`}
        >
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Sidebar Toggle + Branding */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSidebar}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>

              <div
                className="text-white p-1.5 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs"
                style={{ backgroundColor: currentTheme.primary }}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm md:text-base tracking-tight text-white">
                    Comprehensive Safety Audit (CSA)
                  </span>
                  <span className="bg-white/10 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-full hidden sm:inline">
                    Modern Edition
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span>Current: <strong className="text-white">{activeSheet}</strong></span>
                  <span>•</span>
                  <span>{data.cover_page.unit_location || 'Plant Unit'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {saveNotification ? 'Saving...' : 'Saved'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2.5">
              {/* Overall Score Badge */}
              <button
                onClick={() => setActiveSheet('Summary')}
                className="bg-white/10 hover:bg-white/15 transition px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/10 text-left"
                title="View Gap Assessment Summary"
              >
                <span className="text-slate-300 text-[10px] uppercase tracking-wider font-semibold">Benchmark:</span>
                <span className="font-mono text-emerald-300 font-extrabold text-sm">
                  {(computedData.computedOverallScore * 100).toFixed(1)}%
                </span>
              </button>

              {/* Theme & Font Customizer Trigger */}
              <button
                onClick={() => setShowThemeModal(!showThemeModal)}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 transition"
                title="Change Colors & Typography"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Colors & Font</span>
              </button>

              {/* Export Excel Button */}
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs"
                style={{ backgroundColor: currentTheme.primary }}
                title="Download updated .xlsx file"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>

              {/* Print View */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
                title="Print Current Sheet"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* Reset to Baseline */}
              <button
                onClick={handleResetToBaseline}
                className="inline-flex items-center gap-1 bg-white/10 hover:bg-rose-900/40 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg transition"
                title="Reset to Excel Baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Theme & Font Customizer Popover / Modal */}
        {showThemeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-base text-slate-900">Theme & Typography</h3>
                </div>
                <button
                  onClick={() => setShowThemeModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Color Palettes */}
              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Color Themes
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.values(THEMES).map((th) => {
                    const isSelected = themeId === th.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() => setThemeId(th.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{th.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: th.primary }}></span>
                          <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: th.tableHeaderBg }}></span>
                          <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: th.accentColor }}></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Family Selection */}
              <div className="mt-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-slate-500" /> Font Family
                </label>
                <div className="space-y-2">
                  {Object.values(FONTS).map((f) => {
                    const isSelected = fontId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFontId(f.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-800" style={{ fontFamily: f.family }}>
                            {f.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block" style={{ fontFamily: f.family }}>
                            The quick brown fox jumps over the lazy dog (670 Questions)
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowThemeModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Sheet Content View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8fafc]">
          {activeSheet === 'Cover Page' && (
            <CoverPage data={data} onChange={setData} theme={currentTheme} />
          )}

          {activeSheet === 'Audit Team' && (
            <AuditTeam data={data} onChange={setData} theme={currentTheme} />
          )}

          {activeSheet === 'Summary' && (
            <SummaryDashboard
              data={computedData}
              onSelectSheet={(sheetName) => setActiveSheet(sheetName)}
              theme={currentTheme}
            />
          )}

          {activeChecklist && (
            <ChecklistSheet
              checklist={activeChecklist}
              onUpdateQuestion={handleUpdateQuestion}
              theme={currentTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
