import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Award,
  ArrowUpRight,
  CheckCircle,
  BarChart3,
  Building2,
  TrendingUp,
  Sparkles,
  Layers,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Target,
  Factory,
  Pill,
  Activity,
  RotateCcw,
  Sliders,
  FileCheck2,
  AlertCircle,
  Clock,
  Compass
} from 'lucide-react';
import { useTableResize, ResizeHandle } from '../hooks/useTableResize.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const MATURITY_LEVELS = [
  { level: 'Level - I', criteria: 'Initial', range: '1% - 25%', min: 0, max: 0.25, badge: 'bg-rose-100 text-rose-800 border-rose-300' },
  { level: 'Level - II', criteria: 'Managed', range: '26% - 50%', min: 0.26, max: 0.50, badge: 'bg-orange-100 text-orange-800 border-orange-300' },
  { level: 'Level - III', criteria: 'Defined', range: '51% - 75%', min: 0.51, max: 0.75, badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  { level: 'Level - IV', criteria: 'Qualitatively Managed', range: '76% - 85%', min: 0.76, max: 0.85, badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  { level: 'Level - V', criteria: 'Continuous Improvement', range: '86% - 100%', min: 0.86, max: 1.0, badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
];

const UNIT_BENCHMARK_WIDTHS = {
  unitCode: 110,
  unitName: 220,
  division: 100,
  location: 170,
  baseline: 120,
  postCapa: 120,
  delta: 100,
  maturity: 150,
  action: 95
};

const MATRIX_TABLE_WIDTHS = {
  sno: 45,
  elem: 240,
  orgAvg: 100,
  apiAvg: 100,
  fdAvg: 100,
  unit1: 95,
  unit2: 95,
  unit4: 95,
  unit5: 95,
  unit6: 95,
  unit7: 105,
  action: 85
};

const ELEMENT_TABLE_WIDTHS = {
  sl: 50,
  elem: 300,
  baseline: 120,
  postCapa: 120,
  delta: 100,
  capaStats: 140,
  action: 85
};

const MATURITY_TABLE_WIDTHS = {
  level: 130,
  range: 120,
  criteria: 450,
  units: 320
};

const CRITERIA_TABLE_WIDTHS = {
  score: 100,
  degree: 560,
  weight: 220
};

export default function SummaryDashboard({
  units = [],
  selectedUnitId,
  onSelectUnit,
  unitMetrics = {},
  scoringCriteria = [],
  maturityLevels = [],
  onSelectSheet,
  theme
}) {
  const [chartView, setChartView] = useState('both'); // 'bar', 'radar', 'both'
  const [selectedElementIdx, setSelectedElementIdx] = useState(0);

  // Resizing hooks
  const {
    widths: unitWidths,
    handleMouseDown: handleUnitResize,
    handleDoubleClick: handleUnitDblClick,
    resetAll: resetUnitWidths,
    activeResizer: unitActiveResizer
  } = useTableResize(UNIT_BENCHMARK_WIDTHS, 'csa_unit_summary_widths_v3');

  const {
    widths: matrixWidths,
    handleMouseDown: handleMatrixResize,
    handleDoubleClick: handleMatrixDblClick,
    resetAll: resetMatrixWidths,
    activeResizer: matrixActiveResizer
  } = useTableResize(MATRIX_TABLE_WIDTHS, 'csa_matrix_19_widths_v3');

  const {
    widths: elemWidths,
    handleMouseDown: handleElemResize,
    handleDoubleClick: handleElemDblClick,
    resetAll: resetElemWidths,
    activeResizer: elemActiveResizer
  } = useTableResize(ELEMENT_TABLE_WIDTHS, 'csa_summary_elem_widths_v3');

  const {
    widths: maturityWidths,
    handleMouseDown: handleMaturityResize,
    handleDoubleClick: handleMaturityDblClick,
    resetAll: resetMaturityWidths,
    activeResizer: maturityActiveResizer
  } = useTableResize(MATURITY_TABLE_WIDTHS, 'csa_dashboard_maturity_widths_v1');

  const {
    widths: criteriaWidths,
    handleMouseDown: handleCriteriaResize,
    handleDoubleClick: handleCriteriaDblClick,
    resetAll: resetCriteriaWidths,
    activeResizer: criteriaActiveResizer
  } = useTableResize(CRITERIA_TABLE_WIDTHS, 'csa_dashboard_criteria_widths_v1');

  const getMaturityTier = (pct) => {
    if (pct === null || pct === undefined) {
      return { level: 'N/A', criteria: 'Not Available Now', badge: 'bg-slate-100 text-slate-600 border-slate-300' };
    }
    const ratio = pct / 100;
    return (
      MATURITY_LEVELS.find((ml) => ratio >= ml.min && ratio <= ml.max) ||
      MATURITY_LEVELS[MATURITY_LEVELS.length - 1]
    );
  };

  const getScoreTheme = (pct) => {
    if (pct === null || pct === undefined) {
      return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', bar: '#94a3b8' };
    }
    if (pct < 50) return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: '#f43f5e' };
    if (pct < 75) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: '#f59e0b' };
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: '#10b981' };
  };

  // 1. Division groupings
  // API: Units 1, 2, 4, 5
  const apiUnits = useMemo(
    () => units.filter((u) => u.division === 'API' || ['unit_1', 'unit_2', 'unit_4', 'unit_5'].includes(u.id)),
    [units]
  );

  // FD: Unit 6 (GGP) and Unit 7 (GLS)
  const fdUnits = useMemo(
    () => units.filter((u) => u.division === 'FD' || ['unit_6', 'unit_7'].includes(u.id)),
    [units]
  );

  // Active (Available) Units filter
  const activeUnits = useMemo(
    () => units.filter((u) => u.available !== false && u.status !== 'Not Available Now'),
    [units]
  );

  const activeApiUnits = useMemo(
    () => apiUnits.filter((u) => u.available !== false && u.status !== 'Not Available Now'),
    [apiUnits]
  );

  const activeFdUnits = useMemo(
    () => fdUnits.filter((u) => u.available !== false && u.status !== 'Not Available Now'),
    [fdUnits]
  );

  // 2. Org Maturity Rollup (Across active available units)
  const orgMetrics = useMemo(() => {
    if (activeUnits.length === 0) return { postCapaPct: 0, baselinePct: 0, avgScore: 0, deltaPct: 0, maturity: MATURITY_LEVELS[0] };
    let sumPost = 0;
    let sumBase = 0;
    activeUnits.forEach((u) => {
      const m = unitMetrics[u.id];
      if (m && typeof m.postCapaScorePct === 'number') {
        sumPost += m.postCapaScorePct;
        sumBase += m.baselineScorePct || 0;
      }
    });
    const avgPost = sumPost / activeUnits.length;
    const avgBase = sumBase / activeUnits.length;
    return {
      postCapaPct: avgPost,
      baselinePct: avgBase,
      avgScore: (avgPost / 100) * 4,
      deltaPct: avgPost - avgBase,
      maturity: getMaturityTier(avgPost),
      activeCount: activeUnits.length,
      totalCount: units.length
    };
  }, [units, activeUnits, unitMetrics]);

  // 3. API Maturity Rollup (Units 1, 2, 4, 5)
  const apiMetrics = useMemo(() => {
    if (activeApiUnits.length === 0) return { postCapaPct: 0, baselinePct: 0, avgScore: 0, deltaPct: 0, maturity: MATURITY_LEVELS[0] };
    let sumPost = 0;
    let sumBase = 0;
    activeApiUnits.forEach((u) => {
      const m = unitMetrics[u.id];
      if (m && typeof m.postCapaScorePct === 'number') {
        sumPost += m.postCapaScorePct;
        sumBase += m.baselineScorePct || 0;
      }
    });
    const avgPost = sumPost / activeApiUnits.length;
    const avgBase = sumBase / activeApiUnits.length;
    return {
      postCapaPct: avgPost,
      baselinePct: avgBase,
      avgScore: (avgPost / 100) * 4,
      deltaPct: avgPost - avgBase,
      maturity: getMaturityTier(avgPost),
      activeCount: activeApiUnits.length,
      totalCount: apiUnits.length
    };
  }, [apiUnits, activeApiUnits, unitMetrics]);

  // 4. FD Maturity Rollup (Unit 6 GGP active, Unit 7 GLS not available now)
  const fdMetrics = useMemo(() => {
    if (activeFdUnits.length === 0) {
      return {
        postCapaPct: null,
        baselinePct: null,
        avgScore: null,
        deltaPct: 0,
        maturity: { level: 'N/A', criteria: 'Not Available Now' },
        activeCount: 0,
        totalCount: fdUnits.length
      };
    }
    let sumPost = 0;
    let sumBase = 0;
    activeFdUnits.forEach((u) => {
      const m = unitMetrics[u.id];
      if (m && typeof m.postCapaScorePct === 'number') {
        sumPost += m.postCapaScorePct;
        sumBase += m.baselineScorePct || 0;
      }
    });
    const avgPost = sumPost / activeFdUnits.length;
    const avgBase = sumBase / activeFdUnits.length;
    return {
      postCapaPct: avgPost,
      baselinePct: avgBase,
      avgScore: (avgPost / 100) * 4,
      deltaPct: avgPost - avgBase,
      maturity: getMaturityTier(avgPost),
      activeCount: activeFdUnits.length,
      totalCount: fdUnits.length
    };
  }, [fdUnits, activeFdUnits, unitMetrics]);

  // 5. All Units 19 Elements Benchmark Matrix
  const matrix19Elements = useMemo(() => {
    const firstUnit = units[0];
    if (!firstUnit || !firstUnit.checklists) return [];

    return firstUnit.checklists.map((cl, idx) => {
      const elemName = cl.sheet_name;

      const unitScoresMap = {};
      let orgSum = 0;
      let orgCount = 0;
      let apiSum = 0;
      let apiCount = 0;
      let fdSum = 0;
      let fdCount = 0;

      units.forEach((u) => {
        const isAvail = u.available !== false && u.status !== 'Not Available Now';
        const uElem = unitMetrics[u.id]?.elements?.[idx];
        const pPct = isAvail && uElem && typeof uElem.postCapaPct === 'number' ? uElem.postCapaPct : null;
        
        unitScoresMap[u.id] = pPct;

        if (isAvail && pPct !== null) {
          orgSum += pPct;
          orgCount++;

          if (['unit_1', 'unit_2', 'unit_4', 'unit_5'].includes(u.id) || u.division === 'API') {
            apiSum += pPct;
            apiCount++;
          } else if (['unit_6', 'unit_7'].includes(u.id) || u.division === 'FD') {
            fdSum += pPct;
            fdCount++;
          }
        }
      });

      return {
        s_no: idx + 1,
        element_name: elemName,
        sheet_ref: cl.sheet_name,
        orgAvgPct: orgCount > 0 ? orgSum / orgCount : null,
        apiAvgPct: apiCount > 0 ? apiSum / apiCount : null,
        fdAvgPct: fdCount > 0 ? fdSum / fdCount : null,
        unitScores: unitScoresMap
      };
    });
  }, [units, unitMetrics]);

  // Selected Element Cross-Plant Benchmark calculation
  const selectedElement = matrix19Elements[selectedElementIdx] || matrix19Elements[0] || {};

  const elementPlantScores = useMemo(() => {
    return units.map((u) => {
      const isAvail = u.available !== false && u.status !== 'Not Available Now';
      const elData = unitMetrics[u.id]?.elements?.[selectedElementIdx];
      return {
        unitId: u.id,
        code: u.code,
        name: u.name,
        division: u.division,
        isAvailable: isAvail,
        baselinePct: isAvail && typeof elData?.baselinePct === 'number' ? Math.round(elData.baselinePct * 10) / 10 : 0,
        postCapaPct: isAvail && typeof elData?.postCapaPct === 'number' ? Math.round(elData.postCapaPct * 10) / 10 : 0,
        deltaPct: isAvail && typeof elData?.deltaPct === 'number' ? Math.round(elData.deltaPct * 10) / 10 : 0
      };
    });
  }, [units, unitMetrics, selectedElementIdx]);

  const topPlantForElement = useMemo(() => {
    const valid = elementPlantScores.filter((p) => p.isAvailable && p.postCapaPct > 0);
    if (valid.length === 0) return null;
    return [...valid].sort((a, b) => b.postCapaPct - a.postCapaPct)[0];
  }, [elementPlantScores]);

  const elementComparisonChartData = {
    labels: elementPlantScores.map((p) =>
      p.isAvailable ? `${p.code} (${p.division})` : `${p.code} (N/A)`
    ),
    datasets: [
      {
        label: 'Baseline Audit Score (%)',
        data: elementPlantScores.map((p) => p.baselinePct),
        backgroundColor: 'rgba(148, 163, 184, 0.7)',
        borderColor: '#64748b',
        borderWidth: 1.5,
        borderRadius: 4
      },
      {
        label: 'Post-CAPA Effective Score (%)',
        data: elementPlantScores.map((p) => p.postCapaPct),
        backgroundColor: elementPlantScores.map((p) =>
          !p.isAvailable
            ? 'rgba(203, 213, 225, 0.4)'
            : p.division === 'FD'
            ? 'rgba(168, 85, 247, 0.85)'
            : 'rgba(59, 130, 246, 0.85)'
        ),
        borderColor: elementPlantScores.map((p) =>
          !p.isAvailable ? '#cbd5e1' : p.division === 'FD' ? '#9333ea' : '#2563eb'
        ),
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  };

  const elementComparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 11, weight: '600' } }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const p = elementPlantScores[ctx.dataIndex];
            if (!p || !p.isAvailable) return `${ctx.dataset.label}: Not Available Now (Audit Pending)`;
            return `${ctx.dataset.label}: ${ctx.raw}% (${(ctx.raw / 25).toFixed(2)}/4.0)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%`, font: { size: 10 } },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { font: { size: 11, weight: '600' } },
        grid: { display: false }
      }
    }
  };

  // Selected Unit Data
  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0] || {};
  const isCurrentUnitAvailable = currentUnit.available !== false && currentUnit.status !== 'Not Available Now';
  const currentMetric = unitMetrics[currentUnit.id] || {
    baselineScorePct: null,
    baselineAvgScore: null,
    postCapaScorePct: null,
    postCapaAvgScore: null,
    deltaPct: null,
    maturityLevel: { level: 'Level - I', criteria: 'Initial', range: '1% - 25%' },
    elements: []
  };

  // Charts data for selected unit (if available)
  const baselineScores = (currentMetric.elements || []).map((e) =>
    typeof e.baselinePct === 'number' ? Math.round(e.baselinePct * 10) / 10 : 0
  );
  const postCapaScores = (currentMetric.elements || []).map((e) =>
    typeof e.postCapaPct === 'number' ? Math.round(e.postCapaPct * 10) / 10 : 0
  );

  const barChartData = {
    labels: (currentMetric.elements || []).map((e, idx) => `${idx + 1}. ${e.element_name.substring(0, 14)}..`),
    datasets: [
      {
        label: 'Baseline Audit Score (%)',
        data: baselineScores,
        backgroundColor: 'rgba(148, 163, 184, 0.7)',
        borderColor: '#64748b',
        borderWidth: 1.5,
        borderRadius: 4
      },
      {
        label: 'Post-CAPA Effective Score (%)',
        data: postCapaScores,
        backgroundColor: 'rgba(79, 70, 229, 0.85)',
        borderColor: '#4338ca',
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 11, weight: '600' } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}% (${(ctx.raw / 25).toFixed(2)}/4.0)`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%`, font: { size: 10 } },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { maxRotation: 45, minRotation: 45, font: { size: 9 } },
        grid: { display: false }
      }
    }
  };

  const radarChartData = {
    labels: (currentMetric.elements || []).map((e) =>
      e.element_name.length > 15 ? e.element_name.substring(0, 13) + '..' : e.element_name
    ),
    datasets: [
      {
        label: 'Baseline %',
        data: baselineScores,
        borderColor: 'rgba(148, 163, 184, 0.8)',
        backgroundColor: 'rgba(148, 163, 184, 0.15)',
        borderWidth: 1.5
      },
      {
        label: 'Post-CAPA %',
        data: postCapaScores,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderWidth: 2
      }
    ]
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 25, callback: (v) => `${v}%`, font: { size: 9 } }
      }
    },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 11, weight: '600' } } }
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* EXECUTIVE HEADER & TOP ACTIONS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Granules EHS Maturity • Executive Landing Page
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Enterprise Safety & Operational Maturity
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Multi-unit EHS benchmark across <strong className="text-blue-700 font-semibold">API Division (Units 1, 2, 4, 5)</strong> and <strong className="text-purple-700 font-semibold">Finished Dosage Division (Unit 6 GGP, Unit 7 GLS)</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick navigation to Comprehensive Safety Audit */}
            <button
              onClick={() => onSelectSheet('Audit')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: theme.primary }}
            >
              <FileCheck2 className="w-4 h-4" />
              Comprehensive Safety Audit
            </button>

            {/* Active Focus Unit Switcher */}
            <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Focus Unit
                </span>
                <select
                  value={selectedUnitId}
                  onChange={(e) => onSelectUnit(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-2"
                >
                  {units.map((u) => {
                    const isAvail = u.available !== false && u.status !== 'Not Available Now';
                    const m = unitMetrics[u.id];
                    return (
                      <option key={u.id} value={u.id}>
                        {u.code} - {u.name.split('(')[0].trim()}{' '}
                        {isAvail && m?.postCapaScorePct !== null
                          ? `(${m.postCapaScorePct.toFixed(1)}%)`
                          : '(Not Available Now)'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP SECTION: SCORING CRITERIA & MATURITY LEVEL MAPPING                     */}
      {/* ========================================================================= */}
      
      {/* 1. SCORING CRITERIA — DEGREE OF COMPLIANCE (0 TO 4 SCALE) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Scoring Criteria — Degree of Compliance (0 to 4 Scale)
                </h2>
                <p className="text-xs text-slate-500">
                  Standard evaluation rubric applied to all 19 elements and checklist questions across units.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={resetCriteriaWidths}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-2xs"
            title="Reset column widths"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Widths
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed text-xs min-w-[750px]">
            <thead>
              <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th
                  style={{ width: `${criteriaWidths.score}px` }}
                  className="px-4 py-3 border-r border-slate-200 text-center relative select-none"
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
            <tbody className="divide-y divide-slate-200 text-xs">
              {(scoringCriteria && scoringCriteria.length > 0
                ? scoringCriteria
                : [
                    { score: 0, degree: 'Non-Compliant: No system in place' },
                    { score: 1, degree: 'Inadequate: Inadequate System - (SOP is not defined/ Not documented)' },
                    { score: 2, degree: 'Documented Only: Defined & Documented (SOP is available)' },
                    { score: 3, degree: 'Partial Implementation: Partially Implemented (SOP defined, documented & implemented partially)' },
                    { score: 4, degree: 'Full & Sustained: Implemented & Sustained (SOP defined, documented, strictly implemented & verified)' }
                  ]
              ).map((sc) => {
                const colors = [
                  { badge: 'bg-rose-100 text-rose-800 border-rose-300', bar: 'bg-rose-500', pct: '0%' },
                  { badge: 'bg-orange-100 text-orange-800 border-orange-300', bar: 'bg-orange-500', pct: '25%' },
                  { badge: 'bg-amber-100 text-amber-800 border-amber-300', bar: 'bg-amber-500', pct: '50%' },
                  { badge: 'bg-blue-100 text-blue-800 border-blue-300', bar: 'bg-blue-500', pct: '75%' },
                  { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', bar: 'bg-emerald-500', pct: '100%' }
                ][sc.score] || { badge: 'bg-slate-100 text-slate-800', bar: 'bg-slate-500', pct: '0%' };

                return (
                  <tr key={sc.score} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 border-r border-slate-200 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm border ${colors.badge}`}>
                        {sc.score}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="text-sm font-semibold text-slate-800">{sc.degree}</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {sc.score === 0 && 'No documented procedure, no records, and no implementation on shop floor.'}
                        {sc.score === 1 && 'SOP missing, draft stage, or employees unaware of safety instructions.'}
                        {sc.score === 2 && 'SOP defined and approved, but shopfloor verification shows patchy compliance.'}
                        {sc.score === 3 && 'Documented and deployed with minor gaps or occasional deviations noted.'}
                        {sc.score === 4 && 'Complete alignment: documented SOP, active execution, records verified, zero deviation.'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                          <div className={`h-full ${colors.bar}`} style={{ width: colors.pct }} />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700 min-w-[36px] text-right">{colors.pct}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Audit Integrity Standard */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
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

      {/* 2. MATURITY LEVEL MAPPING CRITERIA (LEVELS I TO V) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Maturity Level Mapping Criteria (Levels I to V)
                </h2>
                <p className="text-xs text-slate-500">
                  Five-tier institutional safety compliance framework mapping compliance percentages to operational maturity.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={resetMaturityWidths}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-2xs"
            title="Reset column widths"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Widths
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed text-xs min-w-[950px]">
            <thead>
              <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
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
                  Compliance Score
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
                  Criteria & Operational Characteristics
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
                  Units at this Level
                  <ResizeHandle
                    columnId="units"
                    onMouseDown={handleMaturityResize}
                    onDoubleClick={handleMaturityDblClick}
                    isActive={maturityActiveResizer === 'units'}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {(maturityLevels && maturityLevels.length > 0 ? maturityLevels : MATURITY_LEVELS).map((ml, idx) => {
                const badgeStyle = MATURITY_LEVELS[idx]?.badge || 'bg-slate-100 text-slate-800 border-slate-300';
                
                // Get units that fall into this level
                const matchingUnits = activeUnits.filter((u) => {
                  const m = unitMetrics[u.id];
                  if (!m || typeof m.postCapaScorePct !== 'number') return false;
                  const ratio = m.postCapaScorePct / 100;
                  return ratio >= ml.min && ratio <= ml.max;
                });

                return (
                  <tr key={ml.level} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 border-r border-slate-200 font-bold">
                      <span className={`inline-flex px-2.5 py-1 rounded-md font-semibold border ${badgeStyle}`}>
                        {ml.level}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200 font-mono font-bold text-slate-700">
                      {ml.range}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="font-bold text-slate-900 text-sm">{ml.criteria}</div>
                      <div className="text-slate-500 mt-1 leading-relaxed">
                        {idx === 0 && 'Ad-hoc practices, lack of formal documented SOPs, reactive incident response, and absent systematic controls.'}
                        {idx === 1 && 'Basic compliance initiated, documented SOPs available but shopfloor implementation patchy and non-standardized.'}
                        {idx === 2 && 'Standard procedures defined, approved, documented, and consistently executed across operating shifts and areas.'}
                        {idx === 3 && 'Quantitative process safety metrics tracked, proactive hazard assessments (PHA/HIRA), and robust mechanical integrity.'}
                        {idx === 4 && 'Zero-harm safety culture, sustained compliance, institutionalized CAPA learning, and continuous EHS excellence.'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {matchingUnits.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {matchingUnits.map((u) => {
                            const m = unitMetrics[u.id];
                            const isSelected = u.id === selectedUnitId;
                            return (
                              <button
                                key={u.id}
                                onClick={() => onSelectUnit(u.id)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border transition ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                                }`}
                                title={`Click to focus ${u.name}`}
                              >
                                <span>{u.code}</span>
                                <span className={isSelected ? 'text-indigo-200' : 'text-slate-500'}>
                                  ({m ? `${m.postCapaScorePct.toFixed(1)}%` : ''})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP SECTION: 3-TIER MATURITY CARDS (ORG -> API -> FD)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 1: ORG MATURITY (OVERALL) */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-indigo-800/60 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Tier 1 â€¢ Enterprise Rollup
              </span>
              <span className="text-[11px] font-mono text-indigo-300/80">
                {orgMetrics.activeCount} Active / {orgMetrics.totalCount} Total Units
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Granules EHS Maturity (Enterprise Rollup)
            </h3>
            <p className="text-xs text-indigo-200/70 mt-1">
              Overall safety maturity aggregated across all active API & Finished Dosage manufacturing units.
            </p>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {orgMetrics.postCapaPct.toFixed(1)}%
              </span>
              <span className="text-sm font-mono text-indigo-300">
                ({orgMetrics.avgScore.toFixed(2)} / 4.0)
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {orgMetrics.maturity.level}: {orgMetrics.maturity.criteria}
              </span>
              <span className="text-xs text-emerald-400 font-semibold font-mono">
                +{orgMetrics.deltaPct.toFixed(1)}% CAPA Gain
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-indigo-800/50">
            <div className="flex justify-between text-xs text-indigo-200/80 mb-1.5 font-medium">
              <span>Baseline: {orgMetrics.baselinePct.toFixed(1)}%</span>
              <span>Target: 86.0% (Level-V)</span>
            </div>
            <div className="w-full bg-indigo-950/80 rounded-full h-2.5 overflow-hidden border border-indigo-700/50">
              <div
                className="bg-gradient-to-r from-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, orgMetrics.postCapaPct)}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-indigo-300/70">
              <span>4 API Units â€¢ 2 FD Units</span>
              <span className="text-amber-300/80">Unit-7 GLS Not Available Now</span>
            </div>
          </div>
        </div>

        {/* CARD 2: API MATURITY (UNITS 1, 2, 4, 5) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Factory className="w-3.5 h-3.5 text-blue-600" />
                Tier 2 â€¢ API Business Unit
              </span>
              <span className="text-[11px] font-mono text-blue-600 font-bold">4 Operating Plants</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              API Cluster Maturity
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Active Pharmaceutical Ingredients: <strong>Unit 1 (BPL)</strong>, <strong>Unit 2 (JDM)</strong>, <strong>Unit 4 (VSKP)</strong> & <strong>Unit 5 (Parawada)</strong>.
            </p>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-4xl font-black font-mono tracking-tight text-blue-700">
                {apiMetrics.postCapaPct.toFixed(1)}%
              </span>
              <span className="text-sm font-mono text-slate-400">
                ({apiMetrics.avgScore.toFixed(2)} / 4.0)
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                {apiMetrics.maturity.level}: {apiMetrics.maturity.criteria}
              </span>
              <span className="text-xs text-emerald-600 font-semibold font-mono">
                +{apiMetrics.deltaPct.toFixed(1)}% CAPA Gain
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              API Operating Units (Click to Focus)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {apiUnits.map((u) => {
                const m = unitMetrics[u.id];
                const isSelected = u.id === selectedUnitId;
                return (
                  <button
                    key={u.id}
                    onClick={() => onSelectUnit(u.id)}
                    className={`p-2 rounded-lg text-left border transition text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-slate-800">{u.code}</span>
                      <span className="font-mono font-bold text-blue-700">
                        {m && typeof m.postCapaScorePct === 'number' ? `${m.postCapaScorePct.toFixed(1)}%` : '-'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">
                      {u.name.split('(')[1]?.replace(')', '') || u.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CARD 3: FD MATURITY (UNITS 6 GGP, 7 GLS) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:border-purple-300 transition">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Pill className="w-3.5 h-3.5 text-purple-600" />
                Tier 3 â€¢ Finished Dosage (FD)
              </span>
              <span className="text-[11px] font-mono text-purple-700 font-bold">2 Units (GGP & GLS)</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              FD Cluster Maturity
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Finished Dosage Formulations: <strong>Unit 6 (GGP)</strong> and <strong>Unit 7 (GLS - Not Available Now)</strong>.
            </p>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-4xl font-black font-mono tracking-tight text-purple-700">
                {fdMetrics.postCapaPct !== null ? `${fdMetrics.postCapaPct.toFixed(1)}%` : 'N/A'}
              </span>
              {fdMetrics.avgScore !== null && (
                <span className="text-sm font-mono text-slate-400">
                  ({fdMetrics.avgScore.toFixed(2)} / 4.0)
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                {fdMetrics.maturity.level}: {fdMetrics.maturity.criteria}
              </span>
              {fdMetrics.deltaPct > 0 && (
                <span className="text-xs text-emerald-600 font-semibold font-mono">
                  +{fdMetrics.deltaPct.toFixed(1)}% CAPA Gain
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Finished Dosage Units (Click to Focus)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {fdUnits.map((u) => {
                const isAvail = u.available !== false && u.status !== 'Not Available Now';
                const m = unitMetrics[u.id];
                const isSelected = u.id === selectedUnitId;
                return (
                  <button
                    key={u.id}
                    onClick={() => onSelectUnit(u.id)}
                    className={`p-2 rounded-lg text-left border transition text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-400 shadow-xs'
                        : isAvail
                        ? 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                        : 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-slate-800">{u.code}</span>
                      {isAvail ? (
                        <span className="font-mono font-bold text-purple-700">
                          {m && typeof m.postCapaScorePct === 'number' ? `${m.postCapaScorePct.toFixed(1)}%` : '-'}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          Not Available
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">
                      {u.name.split('(')[1]?.replace(')', '') || u.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ELEMENT-WISE CROSS-PLANT PERFORMANCE GRAPH                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Element Cross-Plant Analytics
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Cross-Plant Performance Graph: {selectedElement?.element_name || 'EHS Element'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any of the 19 EHS elements to inspect compliance score distribution across all Granules manufacturing plants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Element Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select EHS Element (1 - 19)
                </span>
                <select
                  value={selectedElementIdx}
                  onChange={(e) => setSelectedElementIdx(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-3 max-w-[260px] truncate"
                >
                  {matrix19Elements.map((el, idx) => (
                    <option key={el.s_no} value={idx}>
                      {el.s_no}. {el.element_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Jump to Element Checklist */}
            {selectedElement?.sheet_ref && (
              <button
                onClick={() => onSelectSheet(selectedElement.sheet_ref)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition shadow-2xs"
                title={`Open checklist for ${selectedElement.element_name}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Element Checklist
              </button>
            )}
          </div>
        </div>

        {/* Element Summary Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Org Average %
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-800">
                {selectedElement?.orgAvgPct !== null ? `${selectedElement.orgAvgPct.toFixed(1)}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">All Plants</span>
            </div>
          </div>

          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
              API Cluster Avg %
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-blue-700">
                {selectedElement?.apiAvgPct !== null ? `${selectedElement.apiAvgPct.toFixed(1)}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-blue-500 font-medium">4 API Plants</span>
            </div>
          </div>

          <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
              FD Cluster Avg %
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-purple-700">
                {selectedElement?.fdAvgPct !== null ? `${selectedElement.fdAvgPct.toFixed(1)}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-purple-500 font-medium">Unit-6 GGP</span>
            </div>
          </div>

          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Top Performing Plant
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold font-mono text-emerald-800 truncate">
                {topPlantForElement ? `${topPlantForElement.code} (${topPlantForElement.postCapaPct.toFixed(1)}%)` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Grouped Bar Graph */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              {selectedElement ? `${selectedElement.s_no}. ${selectedElement.element_name}` : 'Element'} — Plant-by-Plant Compliance Scores
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block" /> Baseline Score
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" /> API Post-CAPA
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 font-bold">
                <span className="w-3 h-3 rounded-xs bg-purple-600 inline-block" /> FD Post-CAPA
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <Bar data={elementComparisonChartData} options={elementComparisonChartOptions} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ALL UNITS 19 ELEMENTS COMPREHENSIVE BENCHMARK MATRIX                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Units 19 Elements Benchmark Matrix
                </h2>
                <p className="text-xs text-slate-500">
                  Multi-unit cross-comparison across Organization Average, API Cluster, FD Cluster, and all operating facilities.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetMatrixWidths}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-2xs"
              title="Reset column widths"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Widths
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed text-xs min-w-[1150px]">
            <thead>
              <tr className="bg-slate-100/90 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <th
                  style={{ width: `${matrixWidths.sno}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center relative select-none"
                >
                  #
                  <ResizeHandle
                    columnId="sno"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'sno'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.elem}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  EHS Element (19 Elements)
                  <ResizeHandle
                    columnId="elem"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'elem'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.orgAvg}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center bg-indigo-50/70 text-indigo-900 relative select-none"
                >
                  Org Avg %
                  <ResizeHandle
                    columnId="orgAvg"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'orgAvg'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.apiAvg}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center bg-blue-50/70 text-blue-900 relative select-none"
                >
                  API Avg %
                  <ResizeHandle
                    columnId="apiAvg"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'apiAvg'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.fdAvg}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center bg-purple-50/70 text-purple-900 relative select-none"
                >
                  FD Avg %
                  <ResizeHandle
                    columnId="fdAvg"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'fdAvg'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.unit1}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center relative select-none"
                >
                  U-1 (BPL)
                  <ResizeHandle
                    columnId="unit1"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'unit1'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.unit2}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center relative select-none"
                >
                  U-2 (JDM)
                  <ResizeHandle
                    columnId="unit2"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'unit2'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.unit4}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center relative select-none"
                >
                  U-4 (VSKP)
                  <ResizeHandle
                    columnId="unit4"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'unit4'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.unit5}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center relative select-none"
                >
                  U-5 (PAR)
                  <ResizeHandle
                    columnId="unit5"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'unit5'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.unit6}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center relative select-none"
                >
                  U-6 (GGP)
                  <ResizeHandle
                    columnId="unit6"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'unit6'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.unit7}px` }}
                  className="px-3 py-3 border-r border-slate-200 text-center relative select-none"
                >
                  U-7 (GLS)
                  <ResizeHandle
                    columnId="unit7"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'unit7'}
                  />
                </th>
                <th
                  style={{ width: `${matrixWidths.action}px` }}
                  className="px-3 py-3 text-center relative select-none"
                >
                  Checklist
                  <ResizeHandle
                    columnId="action"
                    onMouseDown={handleMatrixResize}
                    onDoubleClick={handleMatrixDblClick}
                    isActive={matrixActiveResizer === 'action'}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {matrix19Elements.map((row) => {
                const orgTheme = getScoreTheme(row.orgAvgPct);
                const apiTheme = getScoreTheme(row.apiAvgPct);
                const fdTheme = getScoreTheme(row.fdAvgPct);

                return (
                  <tr key={row.s_no} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-3 border-r border-slate-200 text-center font-bold text-slate-500">
                      {row.s_no}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      <div className="font-semibold text-slate-800 line-clamp-1" title={row.element_name}>
                        {row.element_name}
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r border-slate-200 text-center bg-indigo-50/40">
                      {row.orgAvgPct !== null ? (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold border ${orgTheme.bg} ${orgTheme.text} ${orgTheme.border}`}>
                          {row.orgAvgPct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-3 border-r border-slate-200 text-center bg-blue-50/40">
                      {row.apiAvgPct !== null ? (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold border ${apiTheme.bg} ${apiTheme.text} ${apiTheme.border}`}>
                          {row.apiAvgPct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-3 border-r border-slate-200 text-center bg-purple-50/40">
                      {row.fdAvgPct !== null ? (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold border ${fdTheme.bg} ${fdTheme.text} ${fdTheme.border}`}>
                          {row.fdAvgPct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    {/* Unit 1 */}
                    <td className="px-3 py-3 border-r border-slate-200 text-center">
                      <span className="font-mono font-semibold text-slate-700">
                        {(row.unitScores['unit_1'] || 0).toFixed(1)}%
                      </span>
                    </td>
                    {/* Unit 2 */}
                    <td className="px-3 py-3 border-r border-slate-200 text-center">
                      <span className="font-mono font-semibold text-slate-700">
                        {(row.unitScores['unit_2'] || 0).toFixed(1)}%
                      </span>
                    </td>
                    {/* Unit 4 */}
                    <td className="px-3 py-3 border-r border-slate-200 text-center">
                      <span className="font-mono font-semibold text-slate-700">
                        {(row.unitScores['unit_4'] || 0).toFixed(1)}%
                      </span>
                    </td>
                    {/* Unit 5 */}
                    <td className="px-3 py-3 border-r border-slate-200 text-center">
                      <span className="font-mono font-semibold text-slate-700">
                        {(row.unitScores['unit_5'] || 0).toFixed(1)}%
                      </span>
                    </td>
                    {/* Unit 6 GGP */}
                    <td className="px-3 py-3 border-r border-slate-200 text-center">
                      <span className="font-mono font-semibold text-slate-700">
                        {(row.unitScores['unit_6'] || 0).toFixed(1)}%
                      </span>
                    </td>
                    {/* Unit 7 GLS (Not Available Now) */}
                    <td className="px-3 py-3 border-r border-slate-200 text-center bg-amber-50/20">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                        Not Available
                      </span>
                    </td>
                    {/* Action */}
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => onSelectSheet(row.sheet_ref)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition inline-flex items-center justify-center"
                        title="View Checklist"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. UNIT-WISE SUMMARY BENCHMARK TABLE (ALL 6 OPERATING UNITS)              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Unit-Wise Operational Benchmark & Division Summary
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any unit row or "Focus" button to inspect its comprehensive 19 elements profile and CAPA breakdown below.
            </p>
          </div>
          <button
            onClick={resetUnitWidths}
            className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition"
          >
            Reset Column Widths
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th
                  style={{ width: `${unitWidths.unitCode}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Unit Code
                  <ResizeHandle
                    columnId="unitCode"
                    onMouseDown={handleUnitResize}
                    onDoubleClick={handleUnitDblClick}
                    isActive={unitActiveResizer === 'unitCode'}
                  />
                </th>
                <th
                  style={{ width: `${unitWidths.unitName}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Unit Name / Facility
                  <ResizeHandle
                    columnId="unitName"
                    onMouseDown={handleUnitResize}
                    onDoubleClick={handleUnitDblClick}
                    isActive={unitActiveResizer === 'unitName'}
                  />
                </th>
                <th
                  style={{ width: `${unitWidths.division}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none text-center"
                >
                  Division
                  <ResizeHandle
                    columnId="division"
                    onMouseDown={handleUnitResize}
                    onDoubleClick={handleUnitDblClick}
                    isActive={unitActiveResizer === 'division'}
                  />
                </th>
                <th
                  style={{ width: `${unitWidths.location}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Location / Plant
                  <ResizeHandle
                    columnId="location"
                    onMouseDown={handleUnitResize}
                    onDoubleClick={handleUnitDblClick}
                    isActive={unitActiveResizer === 'location'}
                  />
                </th>
                <th
                  style={{ width: `${unitWidths.baseline}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Baseline Score
                  <ResizeHandle
                    columnId="baseline"
                    onMouseDown={handleUnitResize}
                    onDoubleClick={handleUnitDblClick}
                    isActive={unitActiveResizer === 'baseline'}
                  />
                </th>
                <th
                  style={{ width: `${unitWidths.postCapa}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Post-CAPA Score
                  <ResizeHandle
                    columnId="postCapa"
                    onMouseDown={handleUnitResize}
                    onDoubleClick={handleUnitDblClick}
                    isActive={unitActiveResizer === 'postCapa'}
                  />
                </th>
                <th
                  style={{ width: `${unitWidths.delta}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  CAPA Gain
                  <ResizeHandle
                    columnId="delta"
                    onMouseDown={handleUnitResize}
                    onDoubleClick={handleUnitDblClick}
                    isActive={unitActiveResizer === 'delta'}
                  />
                </th>
                <th
                  style={{ width: `${unitWidths.maturity}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Maturity Level
                  <ResizeHandle
                    columnId="maturity"
                    onMouseDown={handleUnitResize}
                    onDoubleClick={handleUnitDblClick}
                    isActive={unitActiveResizer === 'maturity'}
                  />
                </th>
                <th
                  style={{ width: `${unitWidths.action}px` }}
                  className="px-4 py-3 text-center relative select-none"
                >
                  Action
                  <ResizeHandle
                    columnId="action"
                    onMouseDown={handleUnitResize}
                    onDoubleClick={handleUnitDblClick}
                    isActive={unitActiveResizer === 'action'}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {units.map((u) => {
                const isSelected = u.id === selectedUnitId;
                const isAvail = u.available !== false && u.status !== 'Not Available Now';
                const m = unitMetrics[u.id] || {};
                const isFD = ['unit_6', 'unit_7'].includes(u.id) || u.division === 'FD';
                const themeCol = isAvail && typeof m.postCapaScorePct === 'number'
                  ? getScoreTheme(m.postCapaScorePct)
                  : { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' };

                return (
                  <tr
                    key={u.id}
                    onClick={() => onSelectUnit(u.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 font-medium'
                        : isAvail
                        ? 'hover:bg-slate-50/60'
                        : 'bg-amber-50/30 hover:bg-amber-50/60'
                    }`}
                  >
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-600' : isAvail ? 'bg-slate-300' : 'bg-amber-400'}`} />
                        <span className="font-mono text-xs font-bold text-slate-800">{u.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">
                        {isAvail ? (u.cover_page?.assessment_stage || 'Annual Assessment') : 'Audit Report Pending / Not Available Now'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border ${
                          isFD
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {isFD ? 'FD' : 'API'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200 text-slate-600 text-xs">
                      {u.cover_page?.location || u.location || 'Plant Site'}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      {isAvail && typeof m.baselineScorePct === 'number' ? (
                        <>
                          <div className="text-xs font-mono font-bold text-slate-600">
                            {m.baselineScorePct.toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ({(m.baselineAvgScore || 0).toFixed(2)} / 4.0)
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      {isAvail && typeof m.postCapaScorePct === 'number' ? (
                        <>
                          <div className="text-xs font-mono font-bold text-indigo-700">
                            {m.postCapaScorePct.toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-slate-500">
                            ({(m.postCapaAvgScore || 0).toFixed(2)} / 4.0)
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-amber-700 font-medium">Not Available</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      {isAvail && typeof m.deltaPct === 'number' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          +{m.deltaPct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      {isAvail && m.maturityLevel ? (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${themeCol.bg} ${themeCol.text} ${themeCol.border}`}>
                          {m.maturityLevel.level}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Not Available Now
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUnit(u.id);
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Focus'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FOCUSED UNIT DEEP DIVE KPI CARDS & CHARTS                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentUnit.code}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                currentUnit.division === 'FD' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {currentUnit.division === 'FD' ? 'FD Division' : 'API Division'}
              </span>
              <span className="text-xs text-slate-500">Focused Unit Analysis</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{currentUnit.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUnit.cover_page?.location || 'Plant Site'} â€¢ {currentUnit.cover_page?.hazard_classification || 'Class A Chemical'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectSheet('Audit')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Open Unit Audit Checklist
            </button>
          </div>
        </div>

        {/* If unit is not available now (e.g. Unit 7 GLS) */}
        {!isCurrentUnitAvailable ? (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {currentUnit.name} - Audit Report Not Available Now
            </h3>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              The Comprehensive Safety Audit (CSA) report for <strong>{currentUnit.code} ({currentUnit.name})</strong> is currently pending or not yet submitted for this cycle. Its 19 elements and scoring benchmarks will appear once the data is published.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectUnit('unit_6')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
              >
                Switch to Available FD Facility: Unit-6 GGP
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Focused KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Baseline Audit Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-800">
                    {currentMetric.baselineScorePct !== null ? `${currentMetric.baselineScorePct.toFixed(1)}%` : 'N/A'}
                  </span>
                  {currentMetric.baselineAvgScore !== null && (
                    <span className="text-xs font-mono text-slate-400">
                      ({currentMetric.baselineAvgScore.toFixed(2)}/4.0)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                  Post-CAPA Effective Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-indigo-700">
                    {currentMetric.postCapaScorePct !== null ? `${currentMetric.postCapaScorePct.toFixed(1)}%` : 'N/A'}
                  </span>
                  {currentMetric.postCapaAvgScore !== null && (
                    <span className="text-xs font-mono text-indigo-500">
                      ({currentMetric.postCapaAvgScore.toFixed(2)}/4.0)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  CAPA Improvement Delta
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-700">
                    +{currentMetric.deltaPct !== null ? currentMetric.deltaPct.toFixed(1) : '0.0'}%
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">Post-CAPA Gain</span>
                </div>
              </div>

              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Unit Maturity Tier
                </span>
                <div className="mt-1">
                  <span className="inline-flex px-2.5 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                    {currentMetric.maturityLevel?.level}: {currentMetric.maturityLevel?.criteria}
                  </span>
                </div>
              </div>
            </div>

            {/* Dual Visual Charts */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  19 Elements Compliance Profile ({currentUnit.code})
                </h3>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setChartView('both')}
                    className={`px-2.5 py-1 rounded ${chartView === 'both' ? 'bg-white font-bold shadow-xs text-indigo-600' : 'text-slate-600'}`}
                  >
                    Both
                  </button>
                  <button
                    onClick={() => setChartView('bar')}
                    className={`px-2.5 py-1 rounded ${chartView === 'bar' ? 'bg-white font-bold shadow-xs text-indigo-600' : 'text-slate-600'}`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setChartView('radar')}
                    className={`px-2.5 py-1 rounded ${chartView === 'radar' ? 'bg-white font-bold shadow-xs text-indigo-600' : 'text-slate-600'}`}
                  >
                    Radar Profile
                  </button>
                </div>
              </div>

              <div className={`grid gap-6 ${chartView === 'both' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {(chartView === 'both' || chartView === 'bar') && (
                  <div className={`${chartView === 'both' ? 'lg:col-span-2' : ''} bg-slate-50/50 rounded-xl p-4 border border-slate-200 h-80`}>
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                )}
                {(chartView === 'both' || chartView === 'radar') && (
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200 h-80 flex items-center justify-center">
                    <Radar data={radarChartData} options={radarChartOptions} />
                  </div>
                )}
              </div>
            </div>

            {/* Focused Unit Elements Breakdown Table */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  {currentUnit.code} Element-by-Element Breakdown (19 Elements)
                </h3>
                <button
                  onClick={resetElemWidths}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
                >
                  Reset Widths
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                      <th style={{ width: `${elemWidths.sl}px` }} className="px-3 py-2.5 border-r border-slate-200 text-center">
                        #
                      </th>
                      <th style={{ width: `${elemWidths.elem}px` }} className="px-4 py-2.5 border-r border-slate-200">
                        Element Name
                      </th>
                      <th style={{ width: `${elemWidths.baseline}px` }} className="px-4 py-2.5 border-r border-slate-200">
                        Baseline Score
                      </th>
                      <th style={{ width: `${elemWidths.postCapa}px` }} className="px-4 py-2.5 border-r border-slate-200">
                        Post-CAPA Score
                      </th>
                      <th style={{ width: `${elemWidths.delta}px` }} className="px-4 py-2.5 border-r border-slate-200">
                        Delta
                      </th>
                      <th style={{ width: `${elemWidths.capaStats}px` }} className="px-4 py-2.5 border-r border-slate-200 text-center">
                        CAPA Actions
                      </th>
                      <th style={{ width: `${elemWidths.action}px` }} className="px-3 py-2.5 text-center">
                        Checklist
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {(currentMetric.elements || []).map((el) => {
                      const elTheme = getScoreTheme(el.postCapaPct);
                      return (
                        <tr key={el.s_no} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-2.5 border-r border-slate-200 text-center font-bold text-slate-400">
                            {el.s_no}
                          </td>
                          <td className="px-4 py-2.5 border-r border-slate-200 font-semibold text-slate-800">
                            {el.element_name}
                          </td>
                          <td className="px-4 py-2.5 border-r border-slate-200 font-mono text-slate-600">
                            {typeof el.baselinePct === 'number'
                              ? `${el.baselinePct.toFixed(1)}% (${(el.baselineAvg || 0).toFixed(2)}/4)`
                              : 'N/A'}
                          </td>
                          <td className="px-4 py-2.5 border-r border-slate-200">
                            {typeof el.postCapaPct === 'number' ? (
                              <span className={`inline-flex px-2 py-0.5 rounded font-mono font-bold border ${elTheme.bg} ${elTheme.text} ${elTheme.border}`}>
                                {el.postCapaPct.toFixed(1)}% ({((el.postCapaAvg || 0)).toFixed(2)}/4)
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 border-r border-slate-200 font-mono font-semibold text-emerald-700">
                            +{typeof el.deltaPct === 'number' ? el.deltaPct.toFixed(1) : 0}%
                          </td>
                          <td className="px-4 py-2.5 border-r border-slate-200 text-center">
                            <span className="text-[11px] text-slate-500 font-medium">
                              {el.verifiedCapaCount > 0 ? (
                                <span className="text-emerald-700 font-bold">{el.verifiedCapaCount} Verified</span>
                              ) : el.openCapaCount > 0 ? (
                                <span className="text-amber-700 font-bold">{el.openCapaCount} Open</span>
                              ) : (
                                <span className="text-slate-400">0 Actions</span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              onClick={() => onSelectSheet(el.sheet_ref)}
                              className="px-2 py-1 rounded text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition inline-flex items-center gap-1"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
