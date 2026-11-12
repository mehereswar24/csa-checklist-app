import React, { useState, useEffect, useMemo } from 'react';
import initialData from './multi_units_data.json';
import ComprehensiveSafetyAudit from './components/ComprehensiveSafetyAudit.jsx';
import SummaryDashboard from './components/SummaryDashboard.jsx';
import InteractiveAnalytics from './components/InteractiveAnalytics.jsx';
import CriteriaAndMaturity from './components/CriteriaAndMaturity.jsx';
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
  X,
  Menu,
  Building2,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const STORAGE_KEY = 'org_ehs_maturity_real_data_v5';
const SIDEBAR_PREF_KEY = 'csa_sidebar_collapsed_pref';
const THEME_PREF_KEY = 'csa_theme_pref';
const FONT_PREF_KEY = 'csa_font_pref';

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.units &&
          parsed.units.length === 6 &&
          parsed.units[0].name.includes('BPL') &&
          !parsed.units.find(u => u.id === 'unit_3') &&
          parsed.units.find(u => u.id === 'unit_7')?.available === false
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
    return initialData;
  });

  const [selectedUnitId, setSelectedUnitId] = useState('unit_1');
  const [activeSheet, setActiveSheet] = useState('Summary');
  const [saveNotification, setSaveNotification] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  useEffect(() => {
    document.documentElement.style.setProperty('--font-primary', currentFont.family);
    document.documentElement.style.setProperty('--font-heading', currentFont.family);
    try {
      localStorage.setItem(FONT_PREF_KEY, fontId);
    } catch (e) {}
  }, [fontId, currentFont]);

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

  // Compute live metrics for each of the 6 units
  const unitMetrics = useMemo(() => {
    const metrics = {};
    const maturityLevels = data.maturity_levels || [];

    data.units.forEach((unit) => {
      if (unit.available === false || unit.status === 'Not Available Now') {
        metrics[unit.id] = {
          unitId: unit.id,
          unitName: unit.name,
          unitCode: unit.code,
          division: unit.division,
          isAvailable: false,
          baselineScorePct: null,
          baselineAvgScore: null,
          postCapaScorePct: null,
          postCapaAvgScore: null,
          deltaPct: null,
          maturityLevel: { level: 'N/A', criteria: 'Not Available Now', range: 'N/A' },
          elements: (unit.checklists || []).map((cl, index) => ({
            s_no: index + 1,
            element_name: cl.title || cl.sheet_name,
            sheet_ref: cl.sheet_name,
            baselineAvg: null,
            baselinePct: null,
            postCapaAvg: null,
            postCapaPct: null,
            deltaPct: null,
            totalQuestions: cl.questions?.length || 0,
            openCapaCount: 0,
            verifiedCapaCount: 0
          }))
        };
        return;
      }

      const elementsList = [];
      let totalBaselinePct = 0;
      let totalPostCapaPct = 0;

      unit.checklists.forEach((cl, index) => {
        let bScoreSum = 0;
        let pScoreSum = 0;
        let openCapa = 0;
        let verifiedCapa = 0;

        const questions = cl.questions || [];
        questions.forEach((q) => {
          const b = typeof q.score === 'number' ? q.score : 0;
          bScoreSum += b;

          const capaAdd =
            q.capa_verification_score !== null &&
            q.capa_verification_score !== undefined &&
            q.capa_verification_score !== ''
              ? Number(q.capa_verification_score)
              : q.capa_score !== null && q.capa_score !== undefined && q.capa_score !== ''
              ? Number(q.capa_score)
              : 0;

          if (q.capa_action && !q.capa_verification_score) openCapa++;
          if (q.capa_verification_score !== null && q.capa_verification_score !== undefined) verifiedCapa++;

          pScoreSum += Math.min(4, b + capaAdd);
        });

        const divisor = cl.divisor_count || questions.length || 1;
        const maxPossible = divisor * 4;

        const bPct = maxPossible > 0 ? (bScoreSum / maxPossible) * 100 : 0;
        const pPct = maxPossible > 0 ? (pScoreSum / maxPossible) * 100 : 0;

        totalBaselinePct += bPct;
        totalPostCapaPct += pPct;

        elementsList.push({
          s_no: index + 1,
          element_name: cl.title || cl.sheet_name,
          sheet_ref: cl.sheet_name,
          baselineAvg: questions.length > 0 ? bScoreSum / questions.length : 0,
          baselinePct: bPct,
          postCapaAvg: questions.length > 0 ? pScoreSum / questions.length : 0,
          postCapaPct: pPct,
          deltaPct: pPct - bPct,
          totalQuestions: questions.length,
          openCapaCount: openCapa,
          verifiedCapaCount: verifiedCapa
        });
      });

      const numElements = unit.checklists.length || 1;
      const overallBaselinePct = totalBaselinePct / numElements;
      const overallPostCapaPct = totalPostCapaPct / numElements;
      const deltaPct = overallPostCapaPct - overallBaselinePct;

      const activeMaturityLevel =
        maturityLevels.find((ml) => {
          const ratio = overallPostCapaPct / 100;
          return ratio >= ml.min && ratio <= ml.max;
        }) || maturityLevels[maturityLevels.length - 1] || { level: 'Level - I', criteria: 'Initial', range: '1% - 25%' };

      metrics[unit.id] = {
        unitId: unit.id,
        unitName: unit.name,
        unitCode: unit.code,
        baselineScorePct: overallBaselinePct,
        baselineAvgScore: (overallBaselinePct / 100) * 4,
        postCapaScorePct: overallPostCapaPct,
        postCapaAvgScore: (overallPostCapaPct / 100) * 4,
        deltaPct: deltaPct,
        maturityLevel: activeMaturityLevel,
        elements: elementsList
      };
    });

    return metrics;
  }, [data]);

  // Update question within active unit
  const handleUpdateQuestion = (sheetName, questionId, field, value) => {
    setData((prev) => {
      const updatedUnits = prev.units.map((unit) => {
        if (unit.id !== selectedUnitId) return unit;

        const updatedChecklists = unit.checklists.map((cl) => {
          if (cl.sheet_name !== sheetName) return cl;

          const updatedQuestions = cl.questions.map((q) => {
            if (q.id !== questionId) return q;
            return { ...q, [field]: value };
          });

          return { ...cl, questions: updatedQuestions };
        });

        return { ...unit, checklists: updatedChecklists };
      });

      return { ...prev, units: updatedUnits };
    });
  };

  // Update Cover Page for a Unit
  const handleUpdateUnitCoverPage = (unitId, updatedCoverPage) => {
    setData((prev) => {
      const updatedUnits = prev.units.map((u) => {
        if (u.id !== unitId) return u;
        return { ...u, cover_page: updatedCoverPage };
      });
      return { ...prev, units: updatedUnits };
    });
  };

  // Redirect from Analytics or Criteria to Unit Summary
  const handleNavigateToUnitSummary = (unitId) => {
    setSelectedUnitId(unitId);
    setActiveSheet('Summary');
    setIsMobileSidebarOpen(false);
  };

  const handleResetToBaseline = () => {
    if (
      window.confirm(
        'Reset all 6 units audit checklist scores, remarks, and CAPA actions back to original baseline?'
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setData(initialData);
    }
  };

  const handleExport = () => {
    exportToExcel(data, selectedUnitId);
  };

  const handlePrint = () => {
    window.print();
  };

  // Currently focused unit and its checklists
  const currentUnit = data.units.find((u) => u.id === selectedUnitId) || data.units[0];
  const checklistSheets = currentUnit.checklists.map((c) => c.sheet_name);
  const activeChecklist = currentUnit.checklists.find((c) => c.sheet_name === activeSheet);

  const getSheetScore = (sheetName) => {
    const curMetric = unitMetrics[selectedUnitId];
    if (!curMetric) return null;
    const elem = curMetric.elements.find((e) => e.sheet_ref === sheetName);
    return elem ? { pct: elem.postCapaPct, avg: elem.postCapaAvg } : null;
  };

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 transition-colors"
      style={{ fontFamily: currentFont.family }}
    >
      {/* 1. Global Top Navigation Bar (Unified full-width header) */}
      <header
        className={`${currentTheme.headerBg} text-white shrink-0 shadow-sm border-b ${currentTheme.headerBorder} no-print z-30 transition-all`}
      >
        <div className="px-3 md:px-5 py-2.5 flex items-center justify-between gap-2 md:gap-4">
          {/* Left: Mobile Hamburger + Desktop Sidebar Toggle + Brand */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-200 shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={handleToggleSidebar}
              className="hidden md:block p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition shrink-0"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            <div
              className="text-white p-1.5 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs shrink-0"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                  Org EHS Maturity
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-white/15 px-2 py-0.5 rounded-md text-indigo-100">
                  6 Units
                </span>
              </div>
              <p className="text-[10px] text-slate-300 hidden md:block truncate">
                Safety Management System & Process Safety Gap Assessment Platform
              </p>
            </div>
          </div>

          {/* Center: Global Unit Selector Pill (Desktop / Tablet) */}
          <div className="hidden sm:flex items-center bg-white/10 hover:bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/15 transition max-w-xs md:max-w-sm">
            <Building2 className="w-3.5 h-3.5 text-indigo-200 shrink-0 mr-1.5" />
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1 truncate"
            >
              {data.units.map((u) => {
                const m = unitMetrics[u.id];
                return (
                  <option key={u.id} value={u.id} className="text-slate-800">
                    {u.name} ({m ? `${m.postCapaScorePct.toFixed(1)}%` : ''})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Right: Actions (Theme, Font, Export, Print, Reset) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Theme Customizer Trigger */}
            <button
              onClick={() => setShowThemeModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Customize Theme & Fonts"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Theme</span>
            </button>

            {/* Export to Excel */}
            <button
              onClick={handleExport}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title="Export active unit & multi-unit benchmarks to Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Print or Save to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Reset to Baseline */}
            <button
              onClick={handleResetToBaseline}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Reset all audit data to default baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Dedicated Mobile Sub-header for Unit Selection (Zero Overlap with Hamburger Menu) */}
        <div className="sm:hidden px-3 py-2 bg-black/25 border-t border-white/10 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-indigo-200 font-semibold shrink-0">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider text-slate-300">Unit:</span>
          </div>
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="flex-1 bg-white/15 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 outline-none border border-white/20 cursor-pointer shadow-inner"
          >
            {data.units.map((u) => {
              const m = unitMetrics[u.id];
              return (
                <option key={u.id} value={u.id} className="text-slate-800">
                  {u.code}: {u.name} ({m ? `${m.postCapaScorePct.toFixed(1)}%` : ''})
                </option>
              );
            })}
          </select>
        </div>
      </header>

      {/* 2. Cohesive Workspace Body (Floating Sidebar & Matching Canvas Card) */}
      <div className="flex-1 flex min-w-0 overflow-hidden p-2 sm:p-3 gap-2.5 sm:gap-3">
        {/* Floating Sidebar */}
        <Sidebar
          checklistSheets={checklistSheets}
          activeSheet={activeSheet}
          onSelectSheet={(sheet) => {
            setActiveSheet(sheet);
            setIsMobileSidebarOpen(false);
          }}
          getSheetScore={getSheetScore}
          unitMetrics={unitMetrics}
          selectedUnitId={selectedUnitId}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          theme={currentTheme}
        />

        {/* Floating Main Content Workspace Canvas */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto rounded-2xl border border-slate-200/90 bg-[#f8fafc] shadow-xs p-3 sm:p-5 md:p-6 transition-all">
          {activeSheet === 'Audit' ? (
            <ComprehensiveSafetyAudit
              units={data.units}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
              onUpdateUnitCoverPage={handleUpdateUnitCoverPage}
              unitMetrics={unitMetrics}
              theme={currentTheme}
            />
          ) : activeSheet === 'Summary' ? (
            <SummaryDashboard
              units={data.units}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
              unitMetrics={unitMetrics}
              onSelectSheet={(sheet) => setActiveSheet(sheet)}
              theme={currentTheme}
            />
          ) : activeSheet === 'Analytics' ? (
            <InteractiveAnalytics
              units={data.units}
              elementsMeta={data.elements_meta}
              unitMetrics={unitMetrics}
              onNavigateToUnitSummary={handleNavigateToUnitSummary}
              theme={currentTheme}
            />
          ) : activeSheet === 'Criteria' ? (
            <CriteriaAndMaturity
              units={data.units}
              scoringCriteria={data.scoring_criteria}
              maturityLevels={data.maturity_levels}
              unitMetrics={unitMetrics}
              onNavigateToUnitSummary={handleNavigateToUnitSummary}
              theme={currentTheme}
            />
          ) : activeChecklist ? (
            <ChecklistSheet
              checklist={activeChecklist}
              units={data.units}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
              onUpdateQuestion={handleUpdateQuestion}
              theme={currentTheme}
            />
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Sheet Not Found</h2>
              <p className="text-sm text-slate-500 mt-1">Please select an item from the sidebar.</p>
              <button
                onClick={() => setActiveSheet('Summary')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
              >
                Go to Executive Summary
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Theme & Font Customizer Modal */}
      {showThemeModal && (
        <div
          onClick={() => setShowThemeModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Workspace Appearance</h3>
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Color Themes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                  Color Themes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(THEMES).map(([id, t]) => {
                    const isSelected = themeId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setThemeId(id)}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.primary }} />
                          <span className="text-xs font-semibold text-slate-800">{t.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography Options */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                  Typography & Font Family
                </label>
                <div className="space-y-2">
                  {Object.entries(FONTS).map(([id, f]) => {
                    const isSelected = fontId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setFontId(id)}
                        className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                        style={{ fontFamily: f.family }}
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900">{f.name}</div>
                          <div className="text-xs text-slate-400">{f.preview}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowThemeModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs transition"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
