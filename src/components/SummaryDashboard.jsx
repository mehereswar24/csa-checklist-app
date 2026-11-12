import React, { useState } from 'react';
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
  Target
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

const UNIT_BENCHMARK_WIDTHS = {
  unitCode: 120,
  unitName: 240,
  location: 180,
  baseline: 130,
  postCapa: 130,
  delta: 110,
  maturity: 150,
  action: 110
};

const ELEMENT_TABLE_WIDTHS = {
  sl: 60,
  elem: 340,
  baseline: 130,
  postCapa: 130,
  delta: 110,
  bench: 180,
  action: 90
};

export default function SummaryDashboard({
  units,
  selectedUnitId,
  onSelectUnit,
  unitMetrics,
  onSelectSheet,
  theme
}) {
  const [chartView, setChartView] = useState('both'); // 'bar', 'radar', 'both'

  // Resizing hooks
  const {
    widths: unitWidths,
    handleMouseDown: handleUnitResize,
    handleDoubleClick: handleUnitDblClick,
    resetAll: resetUnitWidths,
    activeResizer: unitActiveResizer
  } = useTableResize(UNIT_BENCHMARK_WIDTHS, 'csa_unit_summary_widths');

  const {
    widths: elemWidths,
    handleMouseDown: handleElemResize,
    handleDoubleClick: handleElemDblClick,
    resetAll: resetElemWidths,
    activeResizer: elemActiveResizer
  } = useTableResize(ELEMENT_TABLE_WIDTHS, 'csa_summary_elem_widths');

  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const currentMetric = unitMetrics[currentUnit.id] || {
    baselineScorePct: 0,
    baselineAvgScore: 0,
    postCapaScorePct: 0,
    postCapaAvgScore: 0,
    deltaPct: 0,
    maturityLevel: { level: 'Level - I', criteria: 'Initial', range: '1% - 25%' },
    elements: []
  };

  const getScoreTheme = (pct) => {
    if (pct < 50) return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: '#f43f5e' };
    if (pct < 75) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: '#f59e0b' };
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: '#10b981' };
  };

  // Chart data for selected unit's 19 elements
  const elemLabels = currentMetric.elements.map((e) =>
    e.element_name.length > 20 ? e.element_name.substring(0, 18) + '...' : e.element_name
  );
  const baselineScores = currentMetric.elements.map((e) => Math.round(e.baselinePct * 10) / 10);
  const postCapaScores = currentMetric.elements.map((e) => Math.round(e.postCapaPct * 10) / 10);

  // Grouped Bar Chart: Baseline vs Post-CAPA
  const barChartData = {
    labels: currentMetric.elements.map((e, idx) => `${idx + 1}. ${e.element_name.substring(0, 14)}..`),
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
      legend: {
        position: 'top',
        labels: { font: { size: 11, weight: '600' } }
      },
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

  // Radar Chart: Multi-dimensional Profile
  const radarChartData = {
    labels: currentMetric.elements.map((e) =>
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
      legend: {
        position: 'top',
        labels: { font: { size: 11, weight: '600' } }
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Active Unit Switcher */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Multi-Unit Organizational Benchmark
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Executive Summary & Unit-Wise Benchmark
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Multi-unit cross-comparison of Baseline vs. Post-CAPA scores and comprehensive element breakdown.
            </p>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="flex flex-col">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Focus Unit
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => onSelectUnit(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer pr-4"
              >
                {units.map((u) => {
                  const m = unitMetrics[u.id];
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} ({m ? `${m.postCapaScorePct.toFixed(1)}%` : ''})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: UNIT-WISE BENCHMARK TABLE (ALL 6 UNITS) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Unit-Wise Summary Benchmark (All 6 Operating Units)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any unit row or "Focus Unit" to inspect its 19 elements breakdown and CAPA metrics.
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
          <table className="w-full text-left border-collapse min-w-[850px]">
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
                const m = unitMetrics[u.id] || {
                  baselineScorePct: 0,
                  postCapaScorePct: 0,
                  deltaPct: 0,
                  maturityLevel: { level: 'Level - I' }
                };
                const themeCol = getScoreTheme(m.postCapaScorePct);

                return (
                  <tr
                    key={u.id}
                    onClick={() => onSelectUnit(u.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 font-medium'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                        <span className="font-mono text-xs font-bold text-slate-800">{u.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.cover_page?.assessment_stage || 'Annual Assessment'}</div>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200 text-slate-600 text-xs">
                      {u.cover_page?.location || 'Plant Site'}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="text-xs font-mono font-bold text-slate-600">
                        {m.baselineScorePct.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ({(m.baselineAvgScore || 0).toFixed(2)} / 4.0)
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <div className="text-xs font-mono font-bold text-indigo-700">
                        {m.postCapaScorePct.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ({(m.postCapaAvgScore || 0).toFixed(2)} / 4.0)
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{m.deltaPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${themeCol.bg} ${themeCol.text} ${themeCol.border}`}>
                        {m.maturityLevel.level}
                      </span>
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

      {/* SECTION 2: FOCUSED UNIT DEEP DIVE KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Baseline Audit Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Baseline Audit Score</span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 font-mono">
              {currentMetric.baselineScorePct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({currentMetric.baselineAvgScore.toFixed(2)} / 4.0)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Original audit baseline evaluation (scores locked as historical record).
          </p>
        </div>

        {/* Card 2: Post-CAPA Effective Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5 bg-gradient-to-br from-indigo-50/40 to-white">
          <div className="flex items-center justify-between text-indigo-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Post-CAPA Effective Score</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-700 font-mono">
              {currentMetric.postCapaScorePct.toFixed(1)}%
            </span>
            <span className="text-xs text-indigo-500 font-mono">
              ({currentMetric.postCapaAvgScore.toFixed(2)} / 4.0)
            </span>
          </div>
          <p className="text-xs text-indigo-500 mt-2">
            Updated overall score incorporating completed & verified CAPA actions.
          </p>
        </div>

        {/* Card 3: CAPA Boost / Delta */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">CAPA Value Added</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-mono">
              +{currentMetric.deltaPct.toFixed(1)}%
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              Compliance Gain
            </span>
          </div>
          <p className="text-xs text-emerald-600 mt-2">
            Net compliance improvement realized post corrective actions.
          </p>
        </div>

        {/* Card 4: Maturity Level */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Assigned Maturity Tier</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-slate-800">
              {currentMetric.maturityLevel.level}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono font-bold text-slate-600">
              {currentMetric.maturityLevel.range}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate" title={currentMetric.maturityLevel.criteria}>
            {currentMetric.maturityLevel.criteria}
          </p>
        </div>
      </div>

      {/* SECTION 3: VISUAL COMPARISON CHARTS (SELECTED UNIT) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              19 Elements Compliance Profile: {currentUnit.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing Baseline Audit scores against Post-CAPA verification across all 19 functional elements.
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setChartView('both')}
              className={`px-3 py-1.5 rounded-md transition ${
                chartView === 'both' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setChartView('bar')}
              className={`px-3 py-1.5 rounded-md transition ${
                chartView === 'bar' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
              }`}
            >
              Grouped Column
            </button>
            <button
              onClick={() => setChartView('radar')}
              className={`px-3 py-1.5 rounded-md transition ${
                chartView === 'radar' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
              }`}
            >
              Maturity Radar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {(chartView === 'bar' || chartView === 'both') && (
            <div className={`${chartView === 'both' ? 'lg:col-span-7' : 'lg:col-span-12'} h-[360px]`}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          )}

          {(chartView === 'radar' || chartView === 'both') && (
            <div className={`${chartView === 'both' ? 'lg:col-span-5' : 'lg:col-span-12'} h-[360px]`}>
              <Radar data={radarChartData} options={radarChartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: 19 ELEMENTS DETAILED BREAKDOWN TABLE (SELECTED UNIT) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Element-Wise Score Breakdown: {currentUnit.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed breakdown of all 19 safety management system elements with individual CAPA gains.
            </p>
          </div>
          <button
            onClick={resetElemWidths}
            className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition"
          >
            Reset Column Widths
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th
                  style={{ width: `${elemWidths.sl}px` }}
                  className="px-4 py-3 border-r border-slate-200 text-center relative select-none"
                >
                  Sl No
                  <ResizeHandle
                    columnId="sl"
                    onMouseDown={handleElemResize}
                    onDoubleClick={handleElemDblClick}
                    isActive={elemActiveResizer === 'sl'}
                  />
                </th>
                <th
                  style={{ width: `${elemWidths.elem}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Element Name
                  <ResizeHandle
                    columnId="elem"
                    onMouseDown={handleElemResize}
                    onDoubleClick={handleElemDblClick}
                    isActive={elemActiveResizer === 'elem'}
                  />
                </th>
                <th
                  style={{ width: `${elemWidths.baseline}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Baseline Score
                  <ResizeHandle
                    columnId="baseline"
                    onMouseDown={handleElemResize}
                    onDoubleClick={handleElemDblClick}
                    isActive={elemActiveResizer === 'baseline'}
                  />
                </th>
                <th
                  style={{ width: `${elemWidths.postCapa}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Post-CAPA Score
                  <ResizeHandle
                    columnId="postCapa"
                    onMouseDown={handleElemResize}
                    onDoubleClick={handleElemDblClick}
                    isActive={elemActiveResizer === 'postCapa'}
                  />
                </th>
                <th
                  style={{ width: `${elemWidths.delta}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Delta (+%)
                  <ResizeHandle
                    columnId="delta"
                    onMouseDown={handleElemResize}
                    onDoubleClick={handleElemDblClick}
                    isActive={elemActiveResizer === 'delta'}
                  />
                </th>
                <th
                  style={{ width: `${elemWidths.bench}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Compliance Progress
                  <ResizeHandle
                    columnId="bench"
                    onMouseDown={handleElemResize}
                    onDoubleClick={handleElemDblClick}
                    isActive={elemActiveResizer === 'bench'}
                  />
                </th>
                <th
                  style={{ width: `${elemWidths.action}px` }}
                  className="px-4 py-3 text-center relative select-none"
                >
                  Action
                  <ResizeHandle
                    columnId="action"
                    onMouseDown={handleElemResize}
                    onDoubleClick={handleElemDblClick}
                    isActive={elemActiveResizer === 'action'}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {currentMetric.elements.map((el) => {
                const themeCol = getScoreTheme(el.postCapaPct);

                return (
                  <tr key={el.s_no} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 border-r border-slate-200 text-center font-mono font-bold text-slate-600">
                      {el.s_no}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      <div className="font-semibold text-slate-800">{el.element_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{el.sheet_ref}</div>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 font-mono text-xs">
                      <span className="font-bold text-slate-700">{el.baselinePct.toFixed(1)}%</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        ({el.baselineAvg.toFixed(2)}/4)
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 font-mono text-xs">
                      <span className="font-bold text-indigo-700">{el.postCapaPct.toFixed(1)}%</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        ({el.postCapaAvg.toFixed(2)}/4)
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        +{el.deltaPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                          {/* Baseline bar */}
                          <div
                            className="h-full bg-slate-300 absolute top-0 left-0"
                            style={{ width: `${Math.min(100, el.baselinePct)}%` }}
                          />
                          {/* Post-capa bar */}
                          <div
                            className="h-full bg-indigo-600 absolute top-0 left-0 opacity-80"
                            style={{ width: `${Math.min(100, el.postCapaPct)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                          {el.postCapaPct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onSelectSheet(el.sheet_ref)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
