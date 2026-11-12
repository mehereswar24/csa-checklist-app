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
import { BarChart3, ArrowUpRight, Award, Building2, Layers, Filter, CheckCircle2, TrendingUp } from 'lucide-react';

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

const UNIT_COLORS = [
  { fill: 'rgba(59, 130, 246, 0.8)', border: '#2563eb' }, // U-1 (BPL - API)
  { fill: 'rgba(16, 185, 129, 0.8)', border: '#059669' }, // U-2 (JDM - API)
  { fill: 'rgba(139, 92, 246, 0.8)', border: '#7c3aed' }, // U-4 (VSKP - API)
  { fill: 'rgba(6, 182, 212, 0.8)', border: '#0891b2' },  // U-5 (Parawada - API)
  { fill: 'rgba(245, 158, 11, 0.8)', border: '#d97706' }, // U-6 (GGP - FD)
  { fill: 'rgba(244, 63, 94, 0.8)', border: '#e11d48' }   // U-7 (GLS - FD)
];

export default function InteractiveAnalytics({
  units,
  elementsMeta,
  unitMetrics,
  onNavigateToUnitSummary,
  theme
}) {
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all');
  const [chartType, setChartType] = useState('bar'); // 'bar', 'radar', 'table'
  const [scoreMetricType, setScoreMetricType] = useState('capa'); // 'capa' (post-capa) or 'baseline'

  // Build matrix: for each element (1 to 19), get the score in each unit
  const elementComparison = elementsMeta.map((elem, elemIdx) => {
    const unitScores = units.map((u) => {
      const cl = u.checklists.find((c) => c.sheet_name === elem.sheet_ref);
      if (!cl) return { baseline: 0, capa: 0 };

      const divisor = cl.divisor_count || cl.questions.length || 1;
      const maxPossible = divisor * 4;

      const baseSum = cl.questions.reduce((sum, q) => sum + (typeof q.score === 'number' ? q.score : 0), 0);
      const capaSum = cl.questions.reduce((sum, q) => {
        const orig = typeof q.score === 'number' ? q.score : 0;
        const ver = typeof q.capa_verification_score === 'number' ? q.capa_verification_score : null;
        const effective = ver !== null ? Math.max(orig, ver) : orig;
        return sum + effective;
      }, 0);

      const basePct = maxPossible > 0 ? (baseSum / maxPossible) * 100 : 0;
      const capaPct = maxPossible > 0 ? (capaSum / maxPossible) * 100 : 0;

      return {
        unitId: u.id,
        unitCode: u.code,
        baseline: basePct,
        capa: capaPct
      };
    });

    const activeScores = unitScores.map((us) => (scoreMetricType === 'capa' ? us.capa : us.baseline));
    const avgScore = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;

    return {
      sl_no: elem.sl_no,
      element_name: elem.element_name,
      sheet_ref: elem.sheet_ref,
      unitScores,
      avgScore
    };
  });

  // Prepare chart datasets
  const labels = elementComparison.map((e) => `${e.sl_no}. ${e.element_name.length > 15 ? e.element_name.substring(0, 14) + '..' : e.element_name}`);

  let datasets = [];
  if (selectedUnitFilter === 'all') {
    datasets = units.map((u, i) => {
      const color = UNIT_COLORS[i % UNIT_COLORS.length];
      return {
        label: `${u.code} (${u.name.split('-')[1]?.trim() || u.name})`,
        data: elementComparison.map((e) => {
          const us = e.unitScores.find((s) => s.unitId === u.id);
          return Math.round((scoreMetricType === 'capa' ? us?.capa : us?.baseline) || 0);
        }),
        backgroundColor: color.fill,
        borderColor: color.border,
        borderWidth: 1.5,
        borderRadius: 4
      };
    });
  } else {
    const u = units.find((x) => x.id === selectedUnitFilter) || units[0];
    const uIdx = units.findIndex((x) => x.id === selectedUnitFilter);
    const color = UNIT_COLORS[Math.max(0, uIdx) % UNIT_COLORS.length];

    datasets = [
      {
        label: `${u.name} (Baseline Audit Score)`,
        data: elementComparison.map((e) => {
          const us = e.unitScores.find((s) => s.unitId === u.id);
          return Math.round(us?.baseline || 0);
        }),
        backgroundColor: 'rgba(148, 163, 184, 0.7)',
        borderColor: '#64748b',
        borderWidth: 1.5,
        borderRadius: 4
      },
      {
        label: `${u.name} (Post-CAPA Improved Score)`,
        data: elementComparison.map((e) => {
          const us = e.unitScores.find((s) => s.unitId === u.id);
          return Math.round(us?.capa || 0);
        }),
        backgroundColor: color.fill,
        borderColor: color.border,
        borderWidth: 1.5,
        borderRadius: 4
      }
    ];
  }

  const barChartData = {
    labels,
    datasets
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12, font: { size: 10, weight: '600' } }
      },
      title: {
        display: true,
        text: selectedUnitFilter === 'all'
          ? '6 UNITS ELEMENT-WISE COMPLIANCE SCORE COMPARISON (%)'
          : `ELEMENT-WISE BASELINE VS POST-CAPA SCORE: ${units.find((u) => u.id === selectedUnitFilter)?.name}`,
        font: { size: 13, weight: '700' },
        color: '#1e293b'
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`
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

  // Radar Data
  const radarData = {
    labels: elementComparison.slice(0, 10).map((e) => `${e.sl_no}. ${e.element_name.substring(0, 12)}`),
    datasets: units.slice(0, 4).map((u, i) => {
      const color = UNIT_COLORS[i % UNIT_COLORS.length];
      return {
        label: u.code,
        data: elementComparison.slice(0, 10).map((e) => {
          const us = e.unitScores.find((s) => s.unitId === u.id);
          return Math.round((scoreMetricType === 'capa' ? us?.capa : us?.baseline) || 0);
        }),
        backgroundColor: color.fill.replace('0.8', '0.15'),
        borderColor: color.border,
        borderWidth: 2,
        pointBackgroundColor: color.border
      };
    })
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 md:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: theme.primary }}
            >
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                  Dedicated Multi-Unit Analytics
                </span>
                <span className="text-xs font-mono text-slate-400">Org EHS Maturity</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
                6 Units Element-Wise Interactive Analytics
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Cross-facility benchmarking, element score variance, and post-CAPA performance comparison
              </p>
            </div>
          </div>

          {/* Unit Filter Dropdown & Metric Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Unit Selection Dropdown */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Filter Unit
              </label>
              <select
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="all">All 6 Units (Comparison)</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code}: {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Score Metric Toggle */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Score Type
              </label>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setScoreMetricType('capa')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    scoreMetricType === 'capa' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Post-CAPA
                </button>
                <button
                  onClick={() => setScoreMetricType('baseline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    scoreMetricType === 'baseline' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Baseline
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Units Overview Cards (Clickable - Redirects to Unit Summary) */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              6 Units Scorecards (Click any unit to focus its summary)
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold">Click card → Redirects to Unit Summary</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {units.map((u, i) => {
              const isAvail = u.available !== false && u.status !== 'Not Available Now';
              const metrics = unitMetrics[u.id] || {};
              const scorePct = typeof metrics.postCapaScorePct === 'number'
                ? metrics.postCapaScorePct
                : null;
              const delta = typeof metrics.deltaPct === 'number'
                ? metrics.deltaPct
                : null;
              const color = UNIT_COLORS[i % UNIT_COLORS.length];
              const isSelected = selectedUnitFilter === u.id;

              return (
                <div
                  key={u.id}
                  onClick={() => onNavigateToUnitSummary(u.id)}
                  className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : !isAvail
                      ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black font-mono text-white px-1.5 py-0.5 rounded shadow-2xs" style={{ backgroundColor: isAvail ? color.border : '#d97706' }}>
                      {u.code}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition" />
                  </div>

                  <div className="mt-2 text-xs font-bold text-slate-900 truncate" title={u.name}>
                    {u.name.split('-')[1]?.trim() || u.name}
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Score</span>
                      <span className="text-lg font-black font-mono text-slate-900">
                        {isAvail && scorePct !== null ? `${scorePct.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    {isAvail && delta > 0 && (
                      <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                        +{delta.toFixed(1)}%
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 text-[10px] font-semibold text-slate-500 truncate">
                    {isAvail ? (metrics.maturityLevel?.level || 'Level - III') : 'Not Available Now'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Charts Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 md:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Element-Wise Multi-Unit Benchmark Chart</span>
          </h2>
          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-md font-semibold transition ${chartType === 'bar' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}`}
            >
              Grouped Bar
            </button>
            <button
              onClick={() => setChartType('radar')}
              className={`px-3 py-1 rounded-md font-semibold transition ${chartType === 'radar' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}`}
            >
              Radar Comparison
            </button>
          </div>
        </div>

        {chartType === 'bar' ? (
          <div className="h-[420px] w-full">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        ) : (
          <div className="h-[420px] w-full flex items-center justify-center">
            <div className="w-full max-w-lg h-full">
              <Radar
                data={radarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { r: { beginAtZero: true, max: 100 } }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 6 Units Element Score Matrix Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div
          className="text-white px-5 py-3.5 flex items-center justify-between"
          style={{ backgroundColor: theme.tableHeaderBg }}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-300" />
            <h2 className="font-bold text-sm tracking-wide">6 Units × 19 Elements Score Matrix Table</h2>
          </div>
          <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded text-slate-200 font-medium">
            Showing {scoreMetricType === 'capa' ? 'Post-CAPA' : 'Baseline'} Compliance Scores
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-xs border-b border-slate-200">
              <tr className="text-slate-700">
                <th className="py-3 px-3 w-12 text-center font-bold">#</th>
                <th className="py-3 px-4 font-bold min-w-[200px]">Element</th>
                {units.map((u, i) => (
                  <th
                    key={u.id}
                    onClick={() => onNavigateToUnitSummary(u.id)}
                    className="py-3 px-3 text-center font-bold min-w-[90px] cursor-pointer hover:bg-slate-100 transition"
                    title={`Click to view ${u.name} summary`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{u.code}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3 text-right font-bold w-24">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {elementComparison.map((elem) => {
                return (
                  <tr key={elem.sl_no} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-400">
                      {elem.sl_no}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 truncate">
                      {elem.element_name}
                    </td>
                    {elem.unitScores.map((us) => {
                      const scoreVal = scoreMetricType === 'capa' ? us.capa : us.baseline;
                      const scoreRound = Math.round(scoreVal);
                      const isHigh = scoreRound >= 75;
                      const isMid = scoreRound >= 50 && scoreRound < 75;

                      return (
                        <td
                          key={us.unitId}
                          onClick={() => onNavigateToUnitSummary(us.unitId)}
                          className="py-2.5 px-3 text-center font-mono cursor-pointer hover:bg-indigo-50/40 transition"
                          title={`Jump to ${us.unitCode} summary`}
                        >
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              isHigh
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isMid
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {scoreRound}%
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-800">
                      {Math.round(elem.avgScore)}%
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
