import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  LayoutList,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Lock,
  Unlock,
  Key,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  TrendingUp,
  HelpCircle,
  X,
  Award
} from 'lucide-react';
import { useTableResize, ResizeHandle } from '../../hooks/useTableResize.jsx';

const DEFAULT_WIDTHS = {
  sno: 55,
  obs: 380,
  ver: 380,
  status: 120,
  observation: 360,
  score: 150,
  recommendations: 360,
  capaAction: 380,
  capaScore: 120,
  capaDate: 140,
  capaVer: 140,
  effectiveScore: 125
};

export default function ChecklistSheet({
  checklist,
  units = [],
  selectedUnitId,
  onSelectUnit,
  onUpdateQuestion,
  theme
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table';
  });

  // Admin Unlock State & PIN verification
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [expandedVerifications, setExpandedVerifications] = useState({});

  const toggleVerification = (qId) => {
    setExpandedVerifications((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Excel-like Column Resizing hook with spacious defaults
  const { widths, handleMouseDown, handleDoubleClick, resetAll, activeResizer } = useTableResize(
    DEFAULT_WIDTHS,
    'checklist_columns_v6'
  );

  const totalTableWidth = useMemo(() => {
    return Object.values(widths).reduce((a, b) => a + (Number(b) || 100), 0);
  }, [widths]);

  // Helper to compute effective score reflecting added CAPA score
  const getCapaAdd = (q) => {
    if (q.capa_verification_score !== null && q.capa_verification_score !== undefined && q.capa_verification_score !== '') {
      return Number(q.capa_verification_score);
    }
    if (q.capa_score !== null && q.capa_score !== undefined && q.capa_score !== '') {
      return Number(q.capa_score);
    }
    return 0;
  };

  const getEffectiveScore = (q) => {
    const base = typeof q.score === 'number' ? q.score : 0;
    const add = getCapaAdd(q);
    return Math.min(4, base + add);
  };

  // Compute live totals
  const {
    baselineTotal,
    postCapaTotal,
    divisor,
    maxPossible,
    baselinePct,
    postCapaPct,
    deltaPct,
    openCapaCount,
    verifiedCapaCount
  } = useMemo(() => {
    const questions = checklist.questions || [];
    let bTotal = 0;
    let pTotal = 0;
    let openC = 0;
    let verifiedC = 0;

    questions.forEach((q) => {
      const bScore = typeof q.score === 'number' ? q.score : 0;
      bTotal += bScore;
      pTotal += getEffectiveScore(q);

      if (q.capa_action && (q.capa_verification_score === null || q.capa_verification_score === undefined || q.capa_verification_score === '')) {
        openC++;
      }
      if (q.capa_verification_score !== null && q.capa_verification_score !== undefined && q.capa_verification_score !== '') {
        verifiedC++;
      }
    });

    const div = checklist.divisor_count || questions.length || 1;
    const maxP = div * 4;
    const bPct = maxP > 0 ? (bTotal / maxP) * 100 : 0;
    const pPct = maxP > 0 ? (pTotal / maxP) * 100 : 0;

    return {
      baselineTotal: bTotal,
      postCapaTotal: pTotal,
      divisor: div,
      maxPossible: maxP,
      baselinePct: bPct,
      postCapaPct: pPct,
      deltaPct: pPct - bPct,
      openCapaCount: openC,
      verifiedCapaCount: verifiedC
    };
  }, [checklist.questions, checklist.divisor_count]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return (checklist.questions || []).filter((q) => {
      const matchSearch =
        searchTerm === '' ||
        (q.checklist_observation && q.checklist_observation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.auditor_verification && q.auditor_verification.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.observation && q.observation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.capa_action && q.capa_action.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchScore =
        scoreFilter === 'all' ||
        (scoreFilter === 'unscored' && (q.score === null || q.score === undefined)) ||
        (q.score !== null && q.score !== undefined && String(q.score) === scoreFilter);

      const matchStatus =
        statusFilter === 'all' ||
        (q.compliance_status && q.compliance_status.toLowerCase() === statusFilter.toLowerCase());

      return matchSearch && matchScore && matchStatus;
    });
  }, [checklist.questions, searchTerm, scoreFilter, statusFilter]);

  const handleAdminUnlockSubmit = (e) => {
    if (e) e.preventDefault();
    // Default PIN: admin123 or blank for easy unlock
    if (adminPin.trim() === 'admin123' || adminPin.trim() === 'admin' || adminPin.trim() === '') {
      setIsAdminUnlocked(true);
      setShowPinModal(false);
      setAdminPin('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN. (Default admin key: admin123)');
    }
  };

  const renderVerificationText = (text) => {
    if (!text) return <span className="text-slate-400 italic">No verification guideline provided</span>;

    const lines = text.split('\n');
    return (
      <div className="space-y-1 text-[11px] leading-relaxed text-slate-600">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          const isDocHeader =
            trimmed.toLowerCase().startsWith('document') || trimmed.toLowerCase().startsWith('document verification');
          const isShopHeader =
            trimmed.toLowerCase().startsWith('shopfloor') ||
            trimmed.toLowerCase().startsWith('shopfloor verification');

          if (isDocHeader) {
            return (
              <div key={idx} className="font-semibold text-indigo-900 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                <span>{line}</span>
              </div>
            );
          }
          if (isShopHeader) {
            return (
              <div key={idx} className="font-semibold text-teal-900 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>
                <span>{line}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="pl-3 text-slate-600">
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];

  // Element Maturity Tier
  const getElementTier = (pct) => {
    if (pct < 25) return { level: 'Level - I', label: 'Initial Awareness', badge: 'bg-rose-100 text-rose-800 border-rose-300' };
    if (pct < 50) return { level: 'Level - II', label: 'Reactive Phase', badge: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (pct < 75) return { level: 'Level - III', label: 'Documented & Systemic', badge: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (pct < 85) return { level: 'Level - IV', label: 'Proactive & Managed', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    return { level: 'Level - V', label: 'Resilient & Sustained', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  const elementTier = getElementTier(postCapaPct);

  return (
    <div className="max-w-[2000px] mx-auto space-y-5 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 md:pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                Audit Checklist
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">[{checklist.sheet_name}]</span>
              {currentUnit && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-indigo-600" />
                  {currentUnit.name}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {checklist.title || checklist.sheet_name}
            </h1>
          </div>

          {/* Unit Switcher & Live KPI Header Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {units.length > 0 && onSelectUnit && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Focus Unit</span>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => onSelectUnit(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 sm:flex items-center gap-2 md:gap-3">
              <div className="bg-slate-50 border border-slate-200/80 p-2 md:px-3 md:py-2 rounded-xl text-center">
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Baseline
                </div>
                <div className="text-sm md:text-base font-bold text-slate-700 font-mono">
                  {baselinePct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">({baselineTotal}/{maxPossible})</div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200 p-2 md:px-3 md:py-2 rounded-xl text-center">
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Post-CAPA
                </div>
                <div className="text-sm md:text-base font-bold text-indigo-800 font-mono">
                  {postCapaPct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-indigo-500">({postCapaTotal}/{maxPossible})</div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-2 md:px-3 md:py-2 rounded-xl text-center">
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Gain
                </div>
                <div className="text-sm md:text-base font-bold text-emerald-800 font-mono">
                  +{deltaPct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-emerald-600">Delta</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter, Search Bar & Admin Unlock Trigger */}
        <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search checklist question, observation, or CAPA action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 placeholder-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Admin Unlock Button */}
            {isAdminUnlocked ? (
              <button
                onClick={() => setIsAdminUnlocked(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold shadow-2xs hover:bg-emerald-100 transition"
                title="Admin Mode Active: Scores Unlocked. Click to re-lock scores."
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Scores Unlocked (Admin)</span>
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-semibold shadow-2xs transition"
                title="Admin Authentication to Unlock Baseline Audit Scores"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin: Unlock Scores</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Baseline Scores</option>
                <option value="4">4 - Sustained</option>
                <option value="3">3 - Partial</option>
                <option value="2">2 - Documented</option>
                <option value="1">1 - Inadequate</option>
                <option value="0">0 - No System</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Partial">Partial</option>
                <option value="NA">NA</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'
                }`}
                title="Table View (Excel-like with Resizable Columns)"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'cards' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'
                }`}
                title="Card View (Mobile Optimized)"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={resetAll}
              className="px-2.5 py-1.5 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1"
              title="Reset column widths"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Widths</span>
            </button>
          </div>
        </div>

        {/* Audit Lock / Admin Unlock Banner */}
        <div
          className={`mt-3 py-2 px-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isAdminUnlocked
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {isAdminUnlocked ? (
              <>
                <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Admin Mode Active:</strong> Baseline audit scores (0-4) are unlocked and editable. Any changes recalculate the element score immediately.
                </span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Baseline Audit Scores Locked:</strong> Baseline score is locked to preserve historical evaluation. Click <em>"Admin: Unlock Scores"</em> to enable adjustments.
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdminUnlocked && (
              <button
                onClick={() => setIsAdminUnlocked(false)}
                className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition"
              >
                Re-Lock Scores
              </button>
            )}
            <span className="text-[11px] font-semibold text-slate-600">
              {filteredQuestions.length} of {checklist.questions.length} Items Displayed
            </span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: EXCEL-LIKE RESIZABLE TABLE */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table
              style={{ width: `${totalTableWidth}px`, minWidth: '100%', tableLayout: 'fixed' }}
              className="text-left border-collapse text-xs"
            >
              <colgroup>
                <col style={{ width: `${widths.sno}px` }} />
                <col style={{ width: `${widths.obs}px` }} />
                <col style={{ width: `${widths.ver}px` }} />
                <col style={{ width: `${widths.status}px` }} />
                <col style={{ width: `${widths.observation}px` }} />
                <col style={{ width: `${widths.score}px` }} />
                <col style={{ width: `${widths.recommendations}px` }} />
                <col style={{ width: `${widths.capaAction}px` }} />
                <col style={{ width: `${widths.capaScore}px` }} />
                <col style={{ width: `${widths.capaDate}px` }} />
                <col style={{ width: `${widths.capaVer}px` }} />
                <col style={{ width: `${widths.effectiveScore}px` }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th
                    style={{ width: `${widths.sno}px` }}
                    className="px-3 py-3 border-r border-slate-200 text-center relative select-none"
                  >
                    Sl No
                    <ResizeHandle
                      columnId="sno"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'sno'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.obs}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none"
                  >
                    Checklist Observation / Requirement
                    <ResizeHandle
                      columnId="obs"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'obs'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.ver}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none"
                  >
                    Auditor Verification Guidelines
                    <ResizeHandle
                      columnId="ver"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'ver'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.status}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none"
                  >
                    Status
                    <ResizeHandle
                      columnId="status"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'status'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.observation}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none"
                  >
                    Observation / Remarks
                    <ResizeHandle
                      columnId="observation"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'observation'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.score}px` }}
                    className={`px-3 py-3 border-r border-slate-200 relative select-none ${
                      isAdminUnlocked ? 'bg-emerald-50/50 text-emerald-900 font-extrabold' : ''
                    }`}
                  >
                    {isAdminUnlocked ? 'Score (Unlocked)' : 'Score (Locked)'}
                    <ResizeHandle
                      columnId="score"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'score'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.recommendations}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none"
                  >
                    Recommendations
                    <ResizeHandle
                      columnId="recommendations"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'recommendations'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.capaAction}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none bg-indigo-50/40 text-indigo-900"
                  >
                    CAPA Action
                    <ResizeHandle
                      columnId="capaAction"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'capaAction'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.capaScore}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none bg-indigo-50/40 text-indigo-900"
                  >
                    CAPA Score
                    <ResizeHandle
                      columnId="capaScore"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'capaScore'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.capaDate}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none bg-indigo-50/40 text-indigo-900"
                  >
                    CAPA Date
                    <ResizeHandle
                      columnId="capaDate"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'capaDate'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.capaVer}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none bg-indigo-50/40 text-indigo-900"
                  >
                    CAPA Verification
                    <ResizeHandle
                      columnId="capaVer"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'capaVer'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.effectiveScore}px` }}
                    className="px-3 py-3 relative select-none bg-indigo-50/70 text-indigo-950 font-extrabold"
                  >
                    Effective Score
                    <ResizeHandle
                      columnId="effectiveScore"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'effectiveScore'}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQuestions.map((q) => {
                  const capaAdd = getCapaAdd(q);
                  const effective = getEffectiveScore(q);

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* S.No */}
                      <td className="px-3 py-3 border-r border-slate-200 text-center font-mono font-bold text-slate-600 align-top">
                        {q.s_no}
                      </td>

                      {/* Checklist Observation */}
                      <td className="px-3 py-3 border-r border-slate-200 text-slate-900 font-medium align-top leading-relaxed">
                        {q.checklist_observation}
                      </td>

                      {/* Auditor Verification Guidelines */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top">
                        {renderVerificationText(q.auditor_verification)}
                      </td>

                      {/* Compliance Status */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top">
                        <select
                          value={q.compliance_status || 'Yes'}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'compliance_status', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Partial">Partial</option>
                          <option value="NA">NA</option>
                        </select>
                      </td>

                      {/* Observation / Remarks */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top">
                        <textarea
                          rows={4}
                          value={q.observation || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'observation', e.target.value)}
                          placeholder="Audit observation / remarks..."
                          className="w-full min-h-[96px] bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-[#0093dd]/40 focus:border-[#0093dd] leading-relaxed resize-y transition shadow-2xs font-normal"
                        />
                      </td>

                      {/* Score Dropdown (0 - 4) - Admin Unlocked / Locked */}
                      <td
                        className={`px-3 py-3 border-r border-slate-200 align-top ${
                          isAdminUnlocked ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="relative">
                            <select
                              value={q.score ?? ''}
                              disabled={!isAdminUnlocked}
                              onChange={(e) =>
                                onUpdateQuestion(
                                  checklist.sheet_name,
                                  q.id,
                                  'score',
                                  e.target.value === '' ? null : Number(e.target.value)
                                )
                              }
                              title={isAdminUnlocked ? 'Admin Mode: Select score 0 to 4' : 'Score cannot be changed'}
                              className={`w-full font-bold text-xs px-2 py-1.5 rounded border appearance-none pr-6 transition ${
                                isAdminUnlocked
                                  ? 'bg-white text-emerald-950 border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs'
                                  : 'bg-slate-100 text-slate-700 border-slate-300 cursor-not-allowed opacity-90'
                              }`}
                            >
                              <option value="0">0 - No System</option>
                              <option value="1">1 - Inadequate</option>
                              <option value="2">2 - Documented</option>
                              <option value="3">3 - Partial</option>
                              <option value="4">4 - Sustained</option>
                            </select>
                            {isAdminUnlocked ? (
                              <Unlock className="w-3 h-3 text-emerald-600 absolute right-2 top-2 pointer-events-none" />
                            ) : (
                              <Lock className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                            )}
                          </div>
                          <div
                            className={`text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                              isAdminUnlocked
                                ? 'text-emerald-800 bg-emerald-50 border-emerald-200 font-bold'
                                : 'text-amber-800 bg-amber-50 border-amber-200'
                            }`}
                          >
                            {isAdminUnlocked ? (
                              <>
                                <Unlock className="w-2.5 h-2.5 text-emerald-700" />
                                <span>Admin Editable</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-2.5 h-2.5 text-amber-700" />
                                <span>Score cannot be changed</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Recommendations */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top">
                        <textarea
                          rows={4}
                          value={q.recommendations || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'recommendations', e.target.value)}
                          placeholder="Auditor recommendations / corrective guidance..."
                          className="w-full min-h-[96px] bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-[#0093dd]/40 focus:border-[#0093dd] leading-relaxed resize-y transition shadow-2xs font-normal"
                        />
                      </td>

                      {/* CAPA Corrective and Preventive Action */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top bg-indigo-50/20">
                        <textarea
                          rows={4}
                          value={q.capa_action || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'capa_action', e.target.value)}
                          placeholder="Enter detailed Corrective & Preventive Action (CAPA)..."
                          className="w-full min-h-[96px] bg-white border border-indigo-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-[#0093dd]/40 focus:border-[#0093dd] leading-relaxed resize-y transition shadow-2xs font-normal"
                        />
                      </td>

                      {/* CAPA Score Dropdown (0 - 4) */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top bg-indigo-50/20">
                        <select
                          value={q.capa_score !== null && q.capa_score !== undefined ? q.capa_score : ''}
                          onChange={(e) =>
                            onUpdateQuestion(
                              checklist.sheet_name,
                              q.id,
                              'capa_score',
                              e.target.value === '' ? null : Number(e.target.value)
                            )
                          }
                          className="w-full bg-white border border-indigo-200 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Select (0-4)</option>
                          <option value="0">0 (No Add)</option>
                          <option value="1">1 (+1 Score)</option>
                          <option value="2">2 (+2 Score)</option>
                          <option value="3">3 (+3 Score)</option>
                          <option value="4">4 (+4 Score)</option>
                        </select>
                      </td>

                      {/* CAPA Completion Date */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top bg-indigo-50/20">
                        <input
                          type="date"
                          value={q.capa_date || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'capa_date', e.target.value)}
                          className="w-full bg-white border border-indigo-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      {/* CAPA Verification Dropdown (0 - 4) */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top bg-indigo-50/20">
                        <select
                          value={
                            q.capa_verification_score !== null && q.capa_verification_score !== undefined
                              ? q.capa_verification_score
                              : ''
                          }
                          onChange={(e) =>
                            onUpdateQuestion(
                              checklist.sheet_name,
                              q.id,
                              'capa_verification_score',
                              e.target.value === '' ? null : Number(e.target.value)
                            )
                          }
                          className="w-full bg-white border border-indigo-200 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-indigo-700"
                        >
                          <option value="">Verify (0-4)</option>
                          <option value="0">0 - No Add</option>
                          <option value="1">1 - (+1 Score)</option>
                          <option value="2">2 - (+2 Score)</option>
                          <option value="3">3 - (+3 Score)</option>
                          <option value="4">4 - (+4 Score)</option>
                        </select>
                      </td>

                      {/* Effective Score */}
                      <td className="px-3 py-3 align-top bg-indigo-50/30">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-sm text-indigo-900">
                              {effective}
                            </span>
                            <span className="text-[10px] text-slate-400">/ 4</span>
                          </div>
                          {capaAdd > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Sparkles className="w-2.5 h-2.5" />
                              +{capaAdd} CAPA
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* TABLE FOOTER SUMMARY ROW (SHOWN RIGHT AT BOTTOM OF TABLE) */}
              <tfoot className="border-t-2 border-slate-300 bg-slate-100/90 font-bold text-xs text-slate-800">
                <tr>
                  <td className="px-3 py-3.5 text-center font-mono text-slate-500">∑</td>
                  <td colSpan={4} className="px-3 py-3.5 text-slate-800 uppercase tracking-wider text-[11px]">
                    Element Aggregate Total ({checklist.questions.length} Items Evaluated)
                  </td>
                  <td className="px-3 py-3.5 border-r border-slate-200 font-mono">
                    <div className="text-slate-800 font-extrabold">{baselineTotal} / {maxPossible}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{baselinePct.toFixed(1)}% Compliance</div>
                  </td>
                  <td className="px-3 py-3.5 border-r border-slate-200 text-slate-400 text-[10px] italic">
                    —
                  </td>
                  <td colSpan={3} className="px-3 py-3.5 border-r border-slate-200 bg-indigo-50/60 text-indigo-900">
                    <div className="flex items-center justify-between text-xs">
                      <span>CAPA Verified: {verifiedCapaCount}</span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700">+{postCapaTotal - baselineTotal} pts added</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 border-r border-slate-200 bg-indigo-50/60 text-center font-mono text-emerald-700 font-bold">
                    +{deltaPct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3.5 bg-indigo-100/80 font-mono text-indigo-950 font-black">
                    <div className="text-sm">{postCapaTotal} / {maxPossible}</div>
                    <div className="text-[10px] text-emerald-700">{postCapaPct.toFixed(1)}% Post-CAPA</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: MOBILE OPTIMIZED CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => {
            const capaAdd = getCapaAdd(q);
            const effective = getEffectiveScore(q);

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {q.s_no}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Status: {q.compliance_status || 'Yes'}
                    </span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Score: {effective}/4
                    </span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-900 leading-snug">
                  {q.checklist_observation}
                </div>

                {/* Verification accordion */}
                <div className="bg-slate-50 rounded-lg p-2.5 text-xs border border-slate-100">
                  <button
                    onClick={() => toggleVerification(q.id)}
                    className="w-full flex items-center justify-between font-bold text-indigo-700 text-[11px]"
                  >
                    <span>Verification Guidelines</span>
                    {expandedVerifications[q.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {expandedVerifications[q.id] && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      {renderVerificationText(q.auditor_verification)}
                    </div>
                  )}
                </div>

                {/* Score Locked / Unlocked Alert */}
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    isAdminUnlocked ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isAdminUnlocked ? (
                      <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Baseline Score:</span>
                      {isAdminUnlocked ? (
                        <select
                          value={q.score ?? ''}
                          onChange={(e) =>
                            onUpdateQuestion(
                              checklist.sheet_name,
                              q.id,
                              'score',
                              e.target.value === '' ? null : Number(e.target.value)
                            )
                          }
                          className="bg-white border border-emerald-400 rounded px-2 py-0.5 font-bold text-xs"
                        >
                          <option value="0">0 - No System</option>
                          <option value="1">1 - Inadequate</option>
                          <option value="2">2 - Documented</option>
                          <option value="3">3 - Partial</option>
                          <option value="4">4 - Sustained</option>
                        </select>
                      ) : (
                        <strong className="text-slate-900 font-mono">{q.score} / 4</strong>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      isAdminUnlocked ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {isAdminUnlocked ? 'Admin Unlocked' : 'Locked'}
                  </span>
                </div>

                {/* Observation & Recommendation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Observation</label>
                    <textarea
                      rows={2}
                      value={q.observation || ''}
                      onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'observation', e.target.value)}
                      placeholder="Observation..."
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Recommendations</label>
                    <textarea
                      rows={2}
                      value={q.recommendations || ''}
                      onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'recommendations', e.target.value)}
                      placeholder="Recommendations..."
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* CAPA Section in Card */}
                <div className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-2 text-xs">
                  <div className="font-bold text-indigo-950 flex items-center justify-between">
                    <span>Corrective & Preventive Action (CAPA)</span>
                    {capaAdd > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        +{capaAdd} points added
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={q.capa_action || ''}
                    onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'capa_action', e.target.value)}
                    placeholder="Enter CAPA action plan..."
                    className="w-full bg-white border border-indigo-200 rounded p-1.5 text-xs text-slate-800"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-indigo-600">CAPA Score</label>
                      <select
                        value={q.capa_score !== null && q.capa_score !== undefined ? q.capa_score : ''}
                        onChange={(e) =>
                          onUpdateQuestion(
                            checklist.sheet_name,
                            q.id,
                            'capa_score',
                            e.target.value === '' ? null : Number(e.target.value)
                          )
                        }
                        className="w-full bg-white border border-indigo-200 rounded p-1 text-xs"
                      >
                        <option value="">0-4</option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-indigo-600">Due Date</label>
                      <input
                        type="date"
                        value={q.capa_date || ''}
                        onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'capa_date', e.target.value)}
                        className="w-full bg-white border border-indigo-200 rounded p-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-indigo-600">Verification</label>
                      <select
                        value={
                          q.capa_verification_score !== null && q.capa_verification_score !== undefined
                            ? q.capa_verification_score
                            : ''
                        }
                        onChange={(e) =>
                          onUpdateQuestion(
                            checklist.sheet_name,
                            q.id,
                            'capa_verification_score',
                            e.target.value === '' ? null : Number(e.target.value)
                          )
                        }
                        className="w-full bg-white border border-indigo-200 rounded p-1 text-xs font-bold text-indigo-700"
                      >
                        <option value="">0-4</option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DEDICATED ELEMENT SCORECARD SHOWN BELOW (AFTER UPDATING SCORE MUST BE SHOWN BELOW) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Updated Score & Element Maturity Summary
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Reflects the live updated baseline evaluation plus verified corrective and preventive actions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${elementTier.badge}`}>
              {elementTier.level}: {elementTier.label}
            </span>
          </div>
        </div>

        {/* 4 Score Metric Cards Below Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Baseline Audit Score */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Baseline Audit Score</span>
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono">
                {baselinePct.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({baselineTotal} / {maxPossible})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Average: {(baselinePct / 25).toFixed(2)} / 4.0 scale
            </p>
          </div>

          {/* Card 2: CAPA Added Gain */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
            <div className="flex items-center justify-between text-emerald-800 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">CAPA Value Added</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                +{deltaPct.toFixed(1)}%
              </span>
              <span className="text-xs text-emerald-700 font-bold font-mono">
                (+{postCapaTotal - baselineTotal} pts)
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">
              {verifiedCapaCount} Verified | {openCapaCount} Open Actions
            </p>
          </div>

          {/* Card 3: Post-CAPA Effective Score */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60">
            <div className="flex items-center justify-between text-indigo-800 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Post-CAPA Effective Score</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-900 font-mono">
                {postCapaPct.toFixed(1)}%
              </span>
              <span className="text-xs text-indigo-700 font-mono font-bold">
                ({postCapaTotal} / {maxPossible})
              </span>
            </div>
            <p className="text-[11px] text-indigo-600 mt-1">
              Updated Effective: {(postCapaPct / 25).toFixed(2)} / 4.0 scale
            </p>
          </div>

          {/* Card 4: Maturity Classification */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Maturity</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-800">
              {elementTier.level}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {elementTier.label}
            </p>
          </div>
        </div>

        {/* Visual Progress Bar Below */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                Baseline Score: {baselinePct.toFixed(1)}%
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                Post-CAPA Score: {postCapaPct.toFixed(1)}%
              </span>
            </div>
            <span className="text-emerald-700 font-mono font-bold">
              +{deltaPct.toFixed(1)}% Improvement
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden relative border border-slate-200">
            {/* Baseline bar */}
            <div
              className="h-full bg-slate-400 absolute top-0 left-0 transition-all duration-500"
              style={{ width: `${Math.min(100, baselinePct)}%` }}
            />
            {/* Post-CAPA bar (layered) */}
            <div
              className="h-full bg-indigo-600 absolute top-0 left-0 opacity-85 transition-all duration-500"
              style={{ width: `${Math.min(100, postCapaPct)}%` }}
            />
          </div>

          {/* 25%, 50%, 75%, 100% scale ticks */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
            <span>0%</span>
            <span>25% (Level I)</span>
            <span>50% (Level II)</span>
            <span>75% (Level III)</span>
            <span>85% (Level IV)</span>
            <span>100% (Level V)</span>
          </div>
        </div>
      </div>

      {/* ADMIN PIN AUTHENTICATION MODAL */}
      {showPinModal && (
        <div
          onClick={() => setShowPinModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Admin Authentication</h3>
                  <p className="text-[11px] text-slate-500">Unlock Baseline Audit Scores for Editing</p>
                </div>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminUnlockSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Enter Admin Key / PIN</label>
                <input
                  type="password"
                  placeholder="Enter Admin PIN (Default: admin123)"
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setPinError('');
                  }}
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {pinError && <p className="text-xs text-rose-600 font-medium">{pinError}</p>}
                <p className="text-[11px] text-slate-400">
                  Default Admin Key for testing: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">admin123</code>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Scores</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
