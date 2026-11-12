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
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { useTableResize, ResizeHandle } from '../hooks/useTableResize.jsx';

const DEFAULT_WIDTHS = {
  sno: 50,
  obs: 360,
  ver: 360,
  status: 110,
  observation: 180,
  score: 140,
  recommendations: 180,
  capaAction: 220,
  capaScore: 110,
  capaDate: 130,
  capaVer: 120,
  effectiveScore: 110
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

  const [expandedVerifications, setExpandedVerifications] = useState({});

  const toggleVerification = (qId) => {
    setExpandedVerifications((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Excel-like Column Resizing hook
  const { widths, handleMouseDown, handleDoubleClick, resetAll, activeResizer } = useTableResize(
    DEFAULT_WIDTHS,
    'checklist_columns_v2'
  );

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
  const { baselineTotal, postCapaTotal, divisor, maxPossible, baselinePct, postCapaPct, deltaPct } = useMemo(() => {
    const questions = checklist.questions || [];
    let bTotal = 0;
    let pTotal = 0;

    questions.forEach((q) => {
      const bScore = typeof q.score === 'number' ? q.score : 0;
      bTotal += bScore;
      pTotal += getEffectiveScore(q);
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
      deltaPct: pPct - bPct
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

  return (
    <div className="max-w-[2000px] mx-auto space-y-4 md:space-y-5 pb-12">
      {/* Element Header Card */}
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

          {/* Unit Switcher & KPI Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {units.length > 0 && onSelectUnit && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Unit</span>
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
                  CAPA Gain
                </div>
                <div className="text-sm md:text-base font-bold text-emerald-800 font-mono">
                  +{deltaPct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-emerald-600">Delta</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
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

            {/* View Mode Switcher (Desktop/Mobile) */}
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

        {/* Audit Lock Policy Notice */}
        <div className="mt-3 py-2 px-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              <strong>Locked Audit Baseline:</strong> Original audit score cannot be modified. Entering CAPA score / verification reflects an added score to determine post-rectification compliance.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-amber-800">
            {filteredQuestions.length} of {checklist.questions.length} Items Displayed
          </span>
        </div>
      </div>

      {/* VIEW MODE 1: EXCEL-LIKE RESIZABLE TABLE */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
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
                    Observation
                    <ResizeHandle
                      columnId="observation"
                      onMouseDown={handleMouseDown}
                      onDoubleClick={handleDoubleClick}
                      isActive={activeResizer === 'observation'}
                    />
                  </th>
                  <th
                    style={{ width: `${widths.score}px` }}
                    className="px-3 py-3 border-r border-slate-200 relative select-none"
                  >
                    Score (Locked)
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

                      {/* Observation */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top">
                        <textarea
                          rows={2}
                          value={q.observation || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'observation', e.target.value)}
                          placeholder="Audit observation..."
                          className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-y"
                        />
                      </td>

                      {/* Score Dropdown (0 - 4) - LOCKED */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top">
                        <div className="space-y-1">
                          <div className="relative">
                            <select
                              value={q.score ?? ''}
                              disabled
                              title="Score cannot be changed"
                              className="w-full bg-slate-100 text-slate-700 font-bold text-xs px-2 py-1.5 rounded border border-slate-300 cursor-not-allowed opacity-90 appearance-none pr-6"
                            >
                              <option value="0">0 - No System</option>
                              <option value="1">1 - Inadequate</option>
                              <option value="2">2 - Documented</option>
                              <option value="3">3 - Partial</option>
                              <option value="4">4 - Sustained</option>
                            </select>
                            <Lock className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                          </div>
                          <div className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-700" />
                            <span>Score cannot be changed</span>
                          </div>
                        </div>
                      </td>

                      {/* Recommendations */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top">
                        <textarea
                          rows={2}
                          value={q.recommendations || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'recommendations', e.target.value)}
                          placeholder="Auditor recommendations..."
                          className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-y"
                        />
                      </td>

                      {/* CAPA Corrective and Preventive Action */}
                      <td className="px-3 py-3 border-r border-slate-200 align-top bg-indigo-50/20">
                        <textarea
                          rows={2}
                          value={q.capa_action || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'capa_action', e.target.value)}
                          placeholder="Enter Corrective & Preventive Action (CAPA)..."
                          className="w-full bg-white border border-indigo-200 rounded p-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
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

                {/* Score Locked Alert */}
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Baseline Score: <strong>{q.score} / 4</strong></span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold">(Score Locked)</span>
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
    </div>
  );
}
