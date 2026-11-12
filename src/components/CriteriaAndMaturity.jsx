import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  Layers,
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Compass,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { useTableResize, ResizeHandle } from '../hooks/useTableResize.jsx';

const CRITERIA_TABLE_WIDTHS = {
  score: 100,
  degree: 540,
  weight: 220
};

const MATURITY_TABLE_WIDTHS = {
  level: 120,
  range: 130,
  criteria: 400,
  units: 320
};

export default function CriteriaAndMaturity({
  units,
  scoringCriteria,
  maturityLevels,
  unitMetrics,
  onNavigateToUnitSummary,
  theme
}) {
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all');

  const {
    widths: criteriaWidths,
    handleMouseDown: handleCriteriaResize,
    handleDoubleClick: handleCriteriaDblClick,
    resetAll: resetCriteriaWidths,
    activeResizer: criteriaActiveResizer
  } = useTableResize(CRITERIA_TABLE_WIDTHS, 'csa_criteria_table_widths');

  const {
    widths: maturityWidths,
    handleMouseDown: handleMaturityResize,
    handleDoubleClick: handleMaturityDblClick,
    resetAll: resetMaturityWidths,
    activeResizer: maturityActiveResizer
  } = useTableResize(MATURITY_TABLE_WIDTHS, 'csa_maturity_table_widths');

  const selectedUnit = selectedUnitFilter !== 'all' ? units.find((u) => u.id === selectedUnitFilter) : null;
  const selectedMetric = selectedUnit ? unitMetrics[selectedUnit.id] : null;

  // Group all units by their post-CAPA maturity level (or baseline if no CAPA)
  const getUnitMaturityLevel = (uId) => {
    const m = unitMetrics[uId];
    if (!m) return maturityLevels[0];
    const score = m.postCapaScorePct / 100;
    const found = maturityLevels.find((ml) => score >= ml.min && score <= ml.max);
    return found || maturityLevels[maturityLevels.length - 1];
  };

  // Level color mapping
  const LEVEL_THEMES = [
    {
      level: 'Level - I',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      activeRing: 'ring-rose-500 bg-rose-50/70 border-rose-400',
      progressBg: 'bg-rose-500',
      hex: '#e11d48'
    },
    {
      level: 'Level - II',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      activeRing: 'ring-amber-500 bg-amber-50/70 border-amber-400',
      progressBg: 'bg-amber-500',
      hex: '#d97706'
    },
    {
      level: 'Level - III',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      activeRing: 'ring-blue-500 bg-blue-50/70 border-blue-400',
      progressBg: 'bg-blue-600',
      hex: '#2563eb'
    },
    {
      level: 'Level - IV',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      activeRing: 'ring-indigo-500 bg-indigo-50/70 border-indigo-400',
      progressBg: 'bg-indigo-600',
      hex: '#4f46e5'
    },
    {
      level: 'Level - V',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      activeRing: 'ring-emerald-500 bg-emerald-50/70 border-emerald-400',
      progressBg: 'bg-emerald-600',
      hex: '#059669'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Unit Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Compass className="w-3.5 h-3.5" />
              Standard Compliance & Progression Framework
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Scoring Criteria & Maturity Level Mapping
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Degree of Compliance (0 - 4 Rating scale) & 5-Tier Organizational EHS Maturity Classification.
            </p>
          </div>

          {/* Unit Selection Dropdown */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="flex flex-col">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Unit Filter View
              </label>
              <select
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer pr-4"
              >
                <option value="all">★ All 6 Units (Org-wide View)</option>
                {units.map((u) => {
                  const m = unitMetrics[u.id];
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} ({m && typeof m.postCapaScorePct === 'number' ? `${m.postCapaScorePct.toFixed(1)}%` : 'Pending'})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Unit Quick Highlight Bar */}
        {selectedUnit && selectedMetric && (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                {selectedUnit.id.replace('unit_', 'U')}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedUnit.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                    {selectedUnit.code}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                  <span>Baseline: <strong className="text-slate-700">{typeof selectedMetric.baselineScorePct === 'number' ? `${selectedMetric.baselineScorePct.toFixed(1)}%` : 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Post-CAPA: <strong className="text-emerald-700">{typeof selectedMetric.postCapaScorePct === 'number' ? `${selectedMetric.postCapaScorePct.toFixed(1)}%` : 'Pending'}</strong></span>
                  <span>•</span>
                  <span>Gain: <strong className="text-indigo-700">+{typeof selectedMetric.deltaPct === 'number' ? `${selectedMetric.deltaPct.toFixed(1)}%` : '0.0%'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Assigned Level</div>
                <div className="text-sm font-bold text-indigo-700">{selectedMetric.maturityLevel.level}</div>
              </div>
              <button
                onClick={() => onNavigateToUnitSummary && onNavigateToUnitSummary(selectedUnit.id)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <span>View Unit Summary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: MATURITY LEVEL MAPPING (LEVEL I TO V) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Maturity Level Mapping Criteria (Levels I to V)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedUnitFilter === 'all'
                ? 'Showing all 6 Units mapped across organizational maturity tiers.'
                : `Highlighting maturity tier position for ${selectedUnit?.name || 'Selected Unit'}.`}
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Click any unit badge to open its full unit-wise summary.
          </div>
        </div>

        {/* 5-Level Visual Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {maturityLevels.map((lvl, idx) => {
            const themeConfig = LEVEL_THEMES[idx] || LEVEL_THEMES[0];
            
            // Find units in this tier
            const unitsInTier = units.filter((u) => {
              const uLvl = getUnitMaturityLevel(u.id);
              return uLvl.level === lvl.level;
            });

            const isCurrentUnitInTier = selectedUnit && getUnitMaturityLevel(selectedUnit.id).level === lvl.level;

            return (
              <div
                key={lvl.level}
                className={`rounded-xl border p-4 transition-all relative flex flex-col justify-between ${
                  isCurrentUnitInTier
                    ? `border-2 ${themeConfig.activeRing} shadow-md`
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm'
                }`}
              >
                {isCurrentUnitInTier && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Active Unit
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${themeConfig.badge}`}>
                      {lvl.level}
                    </span>
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      {lvl.range}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-800 leading-snug min-h-[38px] mb-3">
                    {lvl.criteria}
                  </h3>
                </div>

                {/* Units in this tier */}
                <div className="mt-3 pt-3 border-t border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Units in Tier</span>
                    <span className="font-mono text-slate-600 font-semibold">{unitsInTier.length}</span>
                  </div>

                  {unitsInTier.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic py-1">No units currently in this tier</div>
                  ) : (
                    <div className="space-y-1.5">
                      {unitsInTier.map((u) => {
                        const m = unitMetrics[u.id];
                        const isThisSelected = selectedUnitFilter === u.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => onNavigateToUnitSummary && onNavigateToUnitSummary(u.id)}
                            className={`w-full text-left p-1.5 rounded-lg border text-xs transition flex items-center justify-between ${
                              isThisSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                : 'bg-white hover:bg-indigo-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className="font-semibold truncate max-w-[100px]">{u.code}</span>
                            <span className={`font-mono text-[11px] font-bold ${isThisSelected ? 'text-white' : 'text-emerald-700'}`}>
                              {m && typeof m.postCapaScorePct === 'number' ? `${m.postCapaScorePct.toFixed(1)}%` : '-'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resizable Maturity Levels Master Table */}
        <div className="border-t border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th
                  style={{ width: `${maturityWidths.level}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Maturity Level
                  <ResizeHandle
                    columnId="level"
                    onMouseDown={handleMaturityResize}
                    onDoubleClick={handleMaturityDblClick}
                    isActive={maturityActiveResizer === 'level'}
                  />
                </th>
                <th
                  style={{ width: `${maturityWidths.range}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Score Range %
                  <ResizeHandle
                    columnId="range"
                    onMouseDown={handleMaturityResize}
                    onDoubleClick={handleMaturityDblClick}
                    isActive={maturityActiveResizer === 'range'}
                  />
                </th>
                <th
                  style={{ width: `${maturityWidths.criteria}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Maturity Criteria & Definition
                  <ResizeHandle
                    columnId="criteria"
                    onMouseDown={handleMaturityResize}
                    onDoubleClick={handleMaturityDblClick}
                    isActive={maturityActiveResizer === 'criteria'}
                  />
                </th>
                <th
                  style={{ width: `${maturityWidths.units}px` }}
                  className="px-4 py-3 relative select-none"
                >
                  {selectedUnitFilter === 'all' ? 'All Units In Tier' : 'Unit Status'}
                  <ResizeHandle
                    columnId="units"
                    onMouseDown={handleMaturityResize}
                    onDoubleClick={handleMaturityDblClick}
                    isActive={maturityActiveResizer === 'units'}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {maturityLevels.map((ml, idx) => {
                const themeConfig = LEVEL_THEMES[idx] || LEVEL_THEMES[0];
                const unitsInTier = units.filter((u) => getUnitMaturityLevel(u.id).level === ml.level);
                const isSelectedTier = selectedUnit && getUnitMaturityLevel(selectedUnit.id).level === ml.level;

                return (
                  <tr
                    key={ml.level}
                    className={`transition-colors ${
                      isSelectedTier
                        ? 'bg-indigo-50/60 font-medium'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-4 py-3 border-r border-slate-200">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border ${themeConfig.badge}`}>
                        {ml.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 font-mono font-bold text-slate-700">
                      {ml.range}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 text-slate-800 text-xs">
                      {ml.criteria}
                    </td>
                    <td className="px-4 py-3">
                      {selectedUnitFilter === 'all' ? (
                        <div className="flex flex-wrap gap-2">
                          {unitsInTier.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">None</span>
                          ) : (
                            unitsInTier.map((u) => {
                              const m = unitMetrics[u.id];
                              return (
                                <button
                                  key={u.id}
                                  onClick={() => onNavigateToUnitSummary && onNavigateToUnitSummary(u.id)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-xs font-semibold text-slate-700 transition shadow-2xs"
                                  title={`Click to view ${u.name} summary`}
                                >
                                  <span>{u.name}</span>
                                  <span className="text-[11px] font-mono font-bold text-emerald-700">
                                    {m && typeof m.postCapaScorePct === 'number' ? `${m.postCapaScorePct.toFixed(1)}%` : '-'}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      ) : (
                        <div>
                          {isSelectedTier ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {selectedUnit.name} ({typeof selectedMetric?.postCapaScorePct === 'number' ? `${selectedMetric.postCapaScorePct.toFixed(1)}%` : 'Pending'})
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: SCORING CRITERIA (DEGREE OF COMPLIANCE 0 - 4) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Scoring Criteria — Degree of Compliance (0 to 4 Scale)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard evaluation rubric applied to all 19 elements and checklist questions across units.
            </p>
          </div>
          <button
            onClick={resetCriteriaWidths}
            className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition"
          >
            Reset Column Widths
          </button>
        </div>

        {/* Resizable Criteria Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th
                  style={{ width: `${criteriaWidths.score}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Score
                  <ResizeHandle
                    columnId="score"
                    onMouseDown={handleCriteriaResize}
                    onDoubleClick={handleCriteriaDblClick}
                    isActive={criteriaActiveResizer === 'score'}
                  />
                </th>
                <th
                  style={{ width: `${criteriaWidths.degree}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Degree of Compliance / Operational Status
                  <ResizeHandle
                    columnId="degree"
                    onMouseDown={handleCriteriaResize}
                    onDoubleClick={handleCriteriaDblClick}
                    isActive={criteriaActiveResizer === 'degree'}
                  />
                </th>
                <th
                  style={{ width: `${criteriaWidths.weight}px` }}
                  className="px-4 py-3 relative select-none"
                >
                  Compliance Weight
                  <ResizeHandle
                    columnId="weight"
                    onMouseDown={handleCriteriaResize}
                    onDoubleClick={handleCriteriaDblClick}
                    isActive={criteriaActiveResizer === 'weight'}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {scoringCriteria.map((sc) => {
                const colors = [
                  { badge: 'bg-rose-100 text-rose-800 border-rose-300', bar: 'bg-rose-500', pct: '0%', text: 'Non-Compliant' },
                  { badge: 'bg-orange-100 text-orange-800 border-orange-300', bar: 'bg-orange-500', pct: '25%', text: 'Inadequate' },
                  { badge: 'bg-amber-100 text-amber-800 border-amber-300', bar: 'bg-amber-500', pct: '50%', text: 'Documented Only' },
                  { badge: 'bg-blue-100 text-blue-800 border-blue-300', bar: 'bg-blue-500', pct: '75%', text: 'Partial Implementation' },
                  { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', bar: 'bg-emerald-500', pct: '100%', text: 'Full & Sustained' }
                ][sc.score] || { badge: 'bg-slate-100 text-slate-800', bar: 'bg-slate-500', pct: '0%', text: 'Pending' };

                return (
                  <tr key={sc.score} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${colors.badge}`}>
                          {sc.score}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">/ 4</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="text-sm font-semibold text-slate-800">{sc.degree}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {sc.score === 0 && 'No documented procedure, no records, and no implementation on shop floor.'}
                        {sc.score === 1 && 'SOP missing, draft stage, or employees unaware of safety instructions.'}
                        {sc.score === 2 && 'SOP defined and approved, but shopfloor verification shows patchy compliance.'}
                        {sc.score === 3 && 'Documented and deployed with minor gaps or occasional deviations noted.'}
                        {sc.score === 4 && 'Complete alignment: documented SOP, active execution, records verified, zero deviation.'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className={`h-full ${colors.bar}`} style={{ width: colors.pct }}></div>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700">{colors.pct}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Audit Lock & CAPA Additive Rule Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>Audit Integrity Standard:</strong> Baseline audit scores (0-4) are locked as historical records.
              When CAPA actions are completed and verified (0-4), the delta score is added to compute the effective
              organizational compliance score.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
