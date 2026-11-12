import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, RotateCcw, LayoutList, Table as TableIcon, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { useTableResize, ResizeHandle } from '../hooks/useTableResize.jsx';

const DEFAULT_WIDTHS = {
  sno: 60,
  obs: 420,
  ver: 420,
  status: 130,
  observation: 220,
  score: 160,
  recommendations: 220,
  remarks: 180
};

export default function ChecklistSheet({ checklist, onUpdateQuestion, theme }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState(() => {
    // Default to card view on mobile devices (< 768px)
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
    'checklist_columns'
  );

  // Compute live totals
  const totalScore = useMemo(() => {
    return checklist.questions.reduce((sum, q) => {
      const val = typeof q.score === 'number' ? q.score : 0;
      return sum + val;
    }, 0);
  }, [checklist.questions]);

  const divisor = checklist.divisor_count || checklist.questions.length || 1;
  const maxPossible = divisor * 4;
  const complianceScore = maxPossible > 0 ? totalScore / maxPossible : 0;

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return checklist.questions.filter((q) => {
      const matchSearch =
        searchTerm === '' ||
        (q.checklist_observation && q.checklist_observation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.auditor_verification && q.auditor_verification.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.observation && q.observation.toLowerCase().includes(searchTerm.toLowerCase()));

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

  // Score button styling
  const getScoreButtonClass = (buttonScore, currentScore) => {
    const isSelected = currentScore === buttonScore;
    if (!isSelected) {
      return 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300';
    }
    switch (buttonScore) {
      case 0:
        return 'bg-rose-500 text-white border-rose-600 shadow-sm font-bold scale-105';
      case 1:
        return 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold scale-105';
      case 2:
        return 'bg-yellow-500 text-slate-900 border-yellow-600 shadow-sm font-bold scale-105';
      case 3:
        return 'bg-indigo-600 text-white border-indigo-700 shadow-sm font-bold scale-105';
      case 4:
        return 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-bold scale-105';
      default:
        return 'bg-slate-700 text-white border-slate-800';
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
          const isDocHeader = trimmed.toLowerCase().startsWith('document') || trimmed.toLowerCase().startsWith('document verification');
          const isShopHeader = trimmed.toLowerCase().startsWith('shopfloor') || trimmed.toLowerCase().startsWith('shopfloor verification');

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

  const tableTotalWidth = Object.values(widths).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-[1900px] mx-auto space-y-4 md:space-y-5">
      {/* Element Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 md:p-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 md:pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                Audit Checklist
              </span>
              <span className="text-xs font-mono text-slate-400">[{checklist.sheet_name}]</span>
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
              {checklist.title || checklist.sheet_name}
            </h1>
          </div>

          {/* KPI Pills - Responsive Grid on Mobile */}
          <div className="grid grid-cols-3 sm:flex items-center gap-2 md:gap-3">
            <div className="bg-slate-50 border border-slate-200/60 p-2 md:px-4 md:py-2 rounded-xl text-center">
              <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions</div>
              <div className="text-base md:text-lg font-bold text-slate-800">{checklist.questions.length}</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 p-2 md:px-4 md:py-2 rounded-xl text-center">
              <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</div>
              <div className="text-base md:text-lg font-bold text-slate-900">
                {totalScore} <span className="text-[10px] md:text-xs text-slate-400 font-normal">/{maxPossible}</span>
              </div>
            </div>

            <div
              className="text-white p-2 md:px-5 md:py-2 rounded-xl text-center shadow-xs"
              style={{ backgroundColor: theme.primary }}
            >
              <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider opacity-85">Compliance</div>
              <div className="text-lg md:text-2xl font-black font-mono">
                {(complianceScore * 100).toFixed(1)}%
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
              placeholder="Search requirements or verifications..."
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
                <option value="all">All Scores</option>
                <option value="4">4 - Excellent</option>
                <option value="3">3 - In Existence</option>
                <option value="2">2 - Available</option>
                <option value="1">1 - Inadequate</option>
                <option value="0">0 - No System</option>
                <option value="unscored">Unscored</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            {/* View Mode Switcher (Card vs Table) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition ${viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                title="Card View (Mobile Optimized)"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                title="Excel Grid View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset Widths button (when in table mode) */}
            {viewMode === 'table' && (
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition hidden md:inline-flex"
                title="Reset column widths"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Widths</span>
              </button>
            )}

            {(searchTerm || scoreFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setScoreFilter('all');
                  setStatusFilter('all');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mode 1: Mobile-Optimized Card View */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = !!expandedVerifications[q.id];

            return (
              <div
                key={q.id || idx}
                className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 space-y-3.5 transition hover:border-slate-300"
              >
                {/* Card Header: Number & Question */}
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                    {q.s_no}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {q.checklist_observation}
                    </p>
                  </div>
                </div>

                {/* Collapsible Verification Accordion */}
                <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleVerification(q.id)}
                    className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <span>Auditor Verification Guidelines</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-slate-200/40 text-xs">
                      {renderVerificationText(q.auditor_verification)}
                    </div>
                  )}
                </div>

                {/* Status & Score Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Compliance Status */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Compliance Status
                    </label>
                    <select
                      value={q.compliance_status || ''}
                      onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'compliance_status', e.target.value)}
                      className={`w-full text-xs font-semibold rounded-lg border px-3 py-2 focus:outline-none transition ${
                        q.compliance_status?.toLowerCase() === 'yes'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : q.compliance_status?.toLowerCase() === 'no'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Partial">Partial</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>

                  {/* Score Pills (Touch Friendly) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Score (0 - 4)
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[0, 1, 2, 3, 4].map((btnScore) => (
                        <button
                          key={btnScore}
                          onClick={() => onUpdateQuestion(checklist.sheet_name, q.id, 'score', btnScore)}
                          className={`h-9 rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${getScoreButtonClass(
                            btnScore,
                            q.score
                          )}`}
                        >
                          {btnScore}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Findings & Recommendations Fields */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div>
                    <input
                      type="text"
                      value={q.observation || ''}
                      onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'observation', e.target.value)}
                      placeholder="Observation / Findings..."
                      className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white outline-none transition placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={q.recommendations || ''}
                      onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'recommendations', e.target.value)}
                      placeholder="Recommendations / Action Items..."
                      className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white outline-none transition placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 2: Resizable Excel-Style Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto max-h-[750px] overflow-y-auto">
            <table className="text-left text-xs border-collapse table-fixed" style={{ width: tableTotalWidth }}>
              <thead className="sticky top-0 z-20 shadow-xs" style={{ backgroundColor: theme.tableHeaderBg }}>
                <tr className="text-white select-none">
                  {/* S.No */}
                  <th
                    style={{ width: widths.sno, minWidth: 40 }}
                    className="relative py-3.5 px-3 text-center font-bold border-b border-r border-white/10"
                  >
                    #
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('sno', e, 40)}
                      onDoubleClick={() => handleDoubleClick('sno')}
                      active={activeResizer === 'sno'}
                    />
                  </th>

                  {/* CHECKLIST OBSERVATION */}
                  <th
                    style={{ width: widths.obs, minWidth: 150 }}
                    className="relative py-3.5 px-4 font-bold border-b border-r border-white/10 tracking-wide"
                  >
                    CHECKLIST OBSERVATION
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('obs', e, 150)}
                      onDoubleClick={() => handleDoubleClick('obs')}
                      active={activeResizer === 'obs'}
                    />
                  </th>

                  {/* AUDITOR VERIFICATION */}
                  <th
                    style={{ width: widths.ver, minWidth: 150 }}
                    className="relative py-3.5 px-4 font-bold border-b border-r border-white/10 tracking-wide"
                  >
                    AUDITOR VERIFICATION
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('ver', e, 150)}
                      onDoubleClick={() => handleDoubleClick('ver')}
                      active={activeResizer === 'ver'}
                    />
                  </th>

                  {/* COMPLIANCE STATUS */}
                  <th
                    style={{ width: widths.status, minWidth: 90 }}
                    className="relative py-3.5 px-3 font-bold border-b border-r border-white/10 text-center tracking-wide"
                  >
                    COMPLIANCE
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('status', e, 90)}
                      onDoubleClick={() => handleDoubleClick('status')}
                      active={activeResizer === 'status'}
                    />
                  </th>

                  {/* OBSERVATION */}
                  <th
                    style={{ width: widths.observation, minWidth: 120 }}
                    className="relative py-3.5 px-3 font-bold border-b border-r border-white/10 tracking-wide"
                  >
                    OBSERVATION
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('observation', e, 120)}
                      onDoubleClick={() => handleDoubleClick('observation')}
                      active={activeResizer === 'observation'}
                    />
                  </th>

                  {/* SCORE */}
                  <th
                    style={{ width: widths.score, minWidth: 120 }}
                    className="relative py-3.5 px-3 font-bold border-b border-r border-white/10 text-center tracking-wide"
                  >
                    SCORE
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('score', e, 120)}
                      onDoubleClick={() => handleDoubleClick('score')}
                      active={activeResizer === 'score'}
                    />
                  </th>

                  {/* RECOMMENDATIONS */}
                  <th
                    style={{ width: widths.recommendations, minWidth: 120 }}
                    className="relative py-3.5 px-3 font-bold border-b border-r border-white/10 tracking-wide"
                  >
                    RECOMMENDATIONS
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('recommendations', e, 120)}
                      onDoubleClick={() => handleDoubleClick('recommendations')}
                      active={activeResizer === 'recommendations'}
                    />
                  </th>

                  {/* REMARKS */}
                  <th
                    style={{ width: widths.remarks, minWidth: 100 }}
                    className="relative py-3.5 px-3 font-bold border-b border-white/10 tracking-wide"
                  >
                    REMARKS
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('remarks', e, 100)}
                      onDoubleClick={() => handleDoubleClick('remarks')}
                      active={activeResizer === 'remarks'}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.map((q, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <tr
                      key={q.id || index}
                      className={`${isEven ? 'bg-white' : 'bg-slate-50/50'} hover:bg-indigo-50/40 transition-colors`}
                    >
                      <td style={{ width: widths.sno }} className="py-3 px-3 text-center font-semibold text-slate-500 border-r border-slate-100 align-top truncate">
                        {q.s_no}
                      </td>
                      <td style={{ width: widths.obs }} className="py-3 px-4 text-slate-900 font-medium leading-relaxed border-r border-slate-100 align-top break-words">
                        {q.checklist_observation}
                      </td>
                      <td style={{ width: widths.ver }} className="py-3 px-4 border-r border-slate-100 align-top bg-slate-50/30 break-words">
                        {renderVerificationText(q.auditor_verification)}
                      </td>
                      <td style={{ width: widths.status }} className="py-3 px-2 border-r border-slate-100 align-top text-center">
                        <select
                          value={q.compliance_status || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'compliance_status', e.target.value)}
                          className={`w-full text-xs font-semibold rounded-md border px-2 py-1.5 focus:outline-none transition ${
                            q.compliance_status?.toLowerCase() === 'yes'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : q.compliance_status?.toLowerCase() === 'no'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="">-- Status --</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Partial">Partial</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>
                      <td style={{ width: widths.observation }} className="py-2 px-2 border-r border-slate-100 align-top">
                        <textarea
                          value={q.observation || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'observation', e.target.value)}
                          placeholder="Auditor findings..."
                          rows={2}
                          className="w-full text-xs border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded-md p-1.5 resize-y outline-none transition"
                        />
                      </td>
                      <td style={{ width: widths.score }} className="py-3 px-2 border-r border-slate-100 align-top text-center">
                        <div className="flex items-center justify-center gap-1">
                          {[0, 1, 2, 3, 4].map((btnScore) => (
                            <button
                              key={btnScore}
                              onClick={() => onUpdateQuestion(checklist.sheet_name, q.id, 'score', btnScore)}
                              className={`w-6 h-6 rounded-md text-[11px] border transition-all ${getScoreButtonClass(
                                btnScore,
                                q.score
                              )}`}
                            >
                              {btnScore}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td style={{ width: widths.recommendations }} className="py-2 px-2 border-r border-slate-100 align-top">
                        <textarea
                          value={q.recommendations || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'recommendations', e.target.value)}
                          placeholder="Action items..."
                          rows={2}
                          className="w-full text-xs border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded-md p-1.5 resize-y outline-none transition"
                        />
                      </td>
                      <td style={{ width: widths.remarks }} className="py-2 px-2 align-top">
                        <textarea
                          value={q.remarks || ''}
                          onChange={(e) => onUpdateQuestion(checklist.sheet_name, q.id, 'remarks', e.target.value)}
                          placeholder="Remarks..."
                          rows={2}
                          className="w-full text-xs border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded-md p-1.5 resize-y outline-none transition"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-800">
                  <td style={{ width: widths.sno }} className="py-3 px-3 text-center border-r border-slate-200"></td>
                  <td
                    colSpan={3}
                    className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-slate-700 border-r border-slate-200"
                  >
                    TOTAL :
                    <span className="font-mono text-[11px] font-normal text-slate-400 ml-2">
                      {checklist.score_formula?.split('/')[0] || '=SUM(F4:F...)'}
                    </span>
                  </td>
                  <td style={{ width: widths.observation }} className="py-3 px-2 border-r border-slate-200"></td>
                  <td
                    style={{ width: widths.score }}
                    className="py-3 px-3 text-center font-mono font-black text-sm text-slate-900 border-r border-slate-200 bg-indigo-50/50"
                  >
                    {totalScore}
                  </td>
                  <td colSpan={2} className="py-3 px-3"></td>
                </tr>

                <tr className="bg-slate-100/80 font-black border-t border-slate-200 text-slate-900">
                  <td style={{ width: widths.sno }} className="py-3 px-3 text-center border-r border-slate-200"></td>
                  <td
                    colSpan={3}
                    className="py-3 px-4 text-right text-xs uppercase tracking-wider text-slate-900 border-r border-slate-200"
                  >
                    ELEMENT COMPLIANCE SCORE :
                    <span className="font-mono text-[11px] font-normal text-slate-400 ml-2">
                      {checklist.score_formula || `=Total / (${divisor} * 4)`}
                    </span>
                  </td>
                  <td style={{ width: widths.observation }} className="py-3 px-2 border-r border-slate-200"></td>
                  <td
                    style={{ width: widths.score }}
                    className="py-3 px-3 text-center font-mono font-black text-base border-r border-slate-200 text-white"
                    style={{ backgroundColor: theme.primary, width: widths.score }}
                  >
                    {(complianceScore * 100).toFixed(1)}%
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-xs font-semibold text-slate-600">
                    {checklist.title || checklist.sheet_name}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
