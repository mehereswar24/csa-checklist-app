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
import { Award, ArrowUpRight, CheckCircle, BarChart3, HelpCircle, Layers, ShieldCheck, RotateCcw } from 'lucide-react';
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

const SUMMARY_DEFAULT_WIDTHS = {
  sl: 65,
  elem: 340,
  score: 110,
  bench: 180,
  action: 90
};

export default function SummaryDashboard({ data, onSelectSheet, theme }) {
  const { summary, checklists } = data;
  const [chartView, setChartView] = useState('both');

  // Excel-Style column resizing hook for summary table
  const { widths, handleMouseDown, handleDoubleClick, resetAll, activeResizer } = useTableResize(
    SUMMARY_DEFAULT_WIDTHS,
    'summary_columns'
  );

  const liveElements = summary.elements.map((elem) => {
    const cl = checklists.find((c) => c.sheet_name === elem.sheet_ref);
    const score = cl && cl.computedScore !== undefined ? cl.computedScore : elem.score;
    return {
      ...elem,
      currentScore: score
    };
  });

  const totalScoreSum = liveElements.reduce((acc, el) => acc + (el.currentScore || 0), 0);
  const liveOverallScore = liveElements.length > 0 ? totalScoreSum / liveElements.length : 0;

  const activeLevel = summary.maturity_levels.find((ml) => {
    return liveOverallScore >= ml.min && liveOverallScore <= ml.max;
  }) || summary.maturity_levels[2];

  const getScoreColor = (score) => {
    const pct = score * 100;
    if (pct < 50) return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: '#f43f5e' };
    if (pct < 75) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: '#f59e0b' };
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: '#10b981' };
  };

  const labels = liveElements.map((e) => e.element_name);
  const scorePercentages = liveElements.map((e) => Math.round(e.currentScore * 1000) / 10);

  // Vertical Bar Chart
  const verticalBarData = {
    labels: labels.map((l, i) => `${i + 1}. ${l.length > 20 ? l.substring(0, 18) + '...' : l}`),
    datasets: [
      {
        label: 'ELEMENT WISE SCORE (%)',
        data: scorePercentages,
        backgroundColor: scorePercentages.map((p) =>
          p < 50 ? 'rgba(244, 63, 94, 0.85)' : p < 75 ? 'rgba(99, 102, 241, 0.85)' : 'rgba(16, 185, 129, 0.85)'
        ),
        borderColor: scorePercentages.map((p) =>
          p < 50 ? '#e11d48' : p < 75 ? '#4f46e5' : '#059669'
        ),
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  const verticalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'ELEMENT WISE SCORE (Vertical Column Chart)',
        font: { size: 13, weight: '700', family: 'Plus Jakarta Sans' },
        color: '#1e293b'
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `Score: ${ctx.raw}% (${(ctx.raw / 100 * 4).toFixed(2)} / 4.0)`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (val) => `${val}%`, font: { size: 10 } },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { maxRotation: 45, minRotation: 45, font: { size: 9 } },
        grid: { display: false }
      }
    }
  };

  // Horizontal Bar Chart
  const horizontalBarData = {
    labels: labels.map((l, i) => `${i + 1}. ${l}`),
    datasets: [
      {
        label: 'Compliance Score (%)',
        data: scorePercentages,
        backgroundColor: scorePercentages.map((p) =>
          p < 50 ? 'rgba(244, 63, 94, 0.8)' : p < 75 ? 'rgba(79, 70, 229, 0.85)' : 'rgba(16, 185, 129, 0.85)'
        ),
        borderColor: theme.primary,
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const horizontalBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'ELEMENT BENCHMARK RANKING (Horizontal Bar Chart)',
        font: { size: 13, weight: '700', family: 'Plus Jakarta Sans' },
        color: '#1e293b'
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `Compliance: ${ctx.raw}%`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (val) => `${val}%` },
        grid: { color: '#f1f5f9' }
      },
      y: {
        ticks: { font: { size: 10 } },
        grid: { display: false }
      }
    }
  };

  const radarData = {
    labels: labels.map((l) => (l.length > 16 ? l.substring(0, 14) + '..' : l)),
    datasets: [
      {
        label: 'Current Maturity %',
        data: scorePercentages,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: theme.primary,
        pointBackgroundColor: theme.primary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.primary
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20, callback: (v) => `${v}%` }
      }
    }
  };

  const tableTotalWidth = Object.values(widths).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* Executive Gap Assessment Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-6 md:p-8">
        <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-md">
              Executive Benchmark
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
              {summary.title || 'Safety Management System & Process Safety Management System - Gap Assessment'}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Executive Gap Assessment Benchmark & Element Compliance Summary
            </p>
          </div>

          {/* Benchmark Score Hero Pill */}
          <div
            className="text-white p-5 rounded-2xl shadow-md min-w-[250px] bg-gradient-to-br"
            style={{ backgroundImage: `linear-gradient(135deg, ${theme.tableHeaderBg}, #0f172a)` }}
          >
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Overall Benchmarking</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-extrabold font-mono tracking-tight">
                {(liveOverallScore * 100).toFixed(2)}%
              </span>
              <span className="text-xs text-slate-400">
                ({(liveOverallScore * 4).toFixed(2)} / 4.00)
              </span>
            </div>
            <div className="mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 inline-block">
              {activeLevel?.level}: {activeLevel?.criteria.split('–')[0].split('-')[0].trim()}
            </div>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Elements</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{liveElements.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">PSM & Safety Elements</div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assessment Scope</div>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">
              {checklists.reduce((acc, c) => acc + c.questions.length, 0)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Total Checkpoints</div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Highest Scored</div>
            <div className="text-sm font-bold text-emerald-700 truncate mt-1.5">
              {[...liveElements].sort((a, b) => b.currentScore - a.currentScore)[0]?.element_name || 'N/A'}
            </div>
            <div className="text-xs text-emerald-600 font-semibold font-mono">
              {([Math.max(...liveElements.map((e) => e.currentScore))] * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Gap Area</div>
            <div className="text-sm font-bold text-rose-700 truncate mt-1.5">
              {[...liveElements].sort((a, b) => a.currentScore - b.currentScore)[0]?.element_name || 'N/A'}
            </div>
            <div className="text-xs text-rose-600 font-semibold font-mono">
              {([Math.min(...liveElements.map((e) => e.currentScore))] * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Summary Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div
            className="text-white px-5 py-3.5 flex items-center justify-between"
            style={{ backgroundColor: theme.tableHeaderBg }}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-300" />
              <h2 className="font-bold text-sm tracking-wide">Gap Assessment Elements & Scores</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetAll}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded transition flex items-center gap-1"
                title="Reset column widths"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-200 font-medium">
                Live Synced
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="text-left text-xs border-collapse table-fixed" style={{ width: tableTotalWidth }}>
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
                  {/* Sl No */}
                  <th
                    style={{ width: widths.sl, minWidth: 40 }}
                    className="relative py-3 px-3 text-center font-bold border-r border-slate-200"
                  >
                    Sl No
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('sl', e, 40)}
                      onDoubleClick={() => handleDoubleClick('sl')}
                      active={activeResizer === 'sl'}
                    />
                  </th>

                  {/* Element */}
                  <th
                    style={{ width: widths.elem, minWidth: 150 }}
                    className="relative py-3 px-3 font-bold border-r border-slate-200"
                  >
                    Element
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('elem', e, 150)}
                      onDoubleClick={() => handleDoubleClick('elem')}
                      active={activeResizer === 'elem'}
                    />
                  </th>

                  {/* Score */}
                  <th
                    style={{ width: widths.score, minWidth: 80 }}
                    className="relative py-3 px-4 text-right font-bold border-r border-slate-200"
                  >
                    Score
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('score', e, 80)}
                      onDoubleClick={() => handleDoubleClick('score')}
                      active={activeResizer === 'score'}
                    />
                  </th>

                  {/* Visual Benchmark */}
                  <th
                    style={{ width: widths.bench, minWidth: 100 }}
                    className="relative py-3 px-4 font-bold border-r border-slate-200"
                  >
                    Benchmark
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('bench', e, 100)}
                      onDoubleClick={() => handleDoubleClick('bench')}
                      active={activeResizer === 'bench'}
                    />
                  </th>

                  {/* Action */}
                  <th
                    style={{ width: widths.action, minWidth: 60 }}
                    className="relative py-3 px-3 text-center font-bold no-print"
                  >
                    Action
                    <ResizeHandle
                      onMouseDown={(e) => handleMouseDown('action', e, 60)}
                      onDoubleClick={() => handleDoubleClick('action')}
                      active={activeResizer === 'action'}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveElements.map((elem, idx) => {
                  const pct = Math.round(elem.currentScore * 1000) / 10;
                  const colors = getScoreColor(elem.currentScore);
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-indigo-50/30 cursor-pointer transition"
                      onClick={() => onSelectSheet(elem.sheet_ref)}
                    >
                      <td style={{ width: widths.sl }} className="py-2.5 px-3 text-center font-semibold text-slate-400 border-r border-slate-100">
                        {elem.sl_no}
                      </td>
                      <td style={{ width: widths.elem }} className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-100 truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{elem.element_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono hidden md:inline shrink-0">
                            [{elem.sheet_ref}]
                          </span>
                        </div>
                      </td>
                      <td style={{ width: widths.score }} className="py-2.5 px-4 text-right font-mono font-bold border-r border-slate-100">
                        <span className={`px-2 py-0.5 rounded-md text-xs ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {pct.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ width: widths.bench }} className="py-2.5 px-4 border-r border-slate-100">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              backgroundColor: colors.bar
                            }}
                          ></div>
                        </div>
                      </td>
                      <td style={{ width: widths.action }} className="py-2.5 px-3 text-center no-print">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSheet(elem.sheet_ref);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition"
                        >
                          View <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
                  <td colSpan={2} className="py-3.5 px-4 text-xs font-bold text-slate-800">
                    Overall score: <span className="text-[11px] font-normal font-mono text-slate-400 ml-2">=AVERAGE(C5:C23)</span>
                  </td>
                  <td style={{ width: widths.score }} className="py-3.5 px-4 text-right font-mono text-sm font-black text-indigo-700">
                    {(liveOverallScore * 100).toFixed(2)}%
                  </td>
                  <td colSpan={2} className="py-3.5 px-4">
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${Math.min(liveOverallScore * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right Column: Charts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Interactive Analytics
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium no-print">
                <button
                  onClick={() => setChartView('vertical')}
                  className={`px-2.5 py-1 rounded-md transition ${chartView === 'vertical' ? 'bg-white shadow-xs font-bold text-indigo-600' : 'text-slate-600'}`}
                >
                  Column
                </button>
                <button
                  onClick={() => setChartView('horizontal')}
                  className={`px-2.5 py-1 rounded-md transition ${chartView === 'horizontal' ? 'bg-white shadow-xs font-bold text-indigo-600' : 'text-slate-600'}`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartView('radar')}
                  className={`px-2.5 py-1 rounded-md transition ${chartView === 'radar' ? 'bg-white shadow-xs font-bold text-indigo-600' : 'text-slate-600'}`}
                >
                  Radar
                </button>
                <button
                  onClick={() => setChartView('both')}
                  className={`px-2.5 py-1 rounded-md transition ${chartView === 'both' ? 'bg-white shadow-xs font-bold text-indigo-600' : 'text-slate-600'}`}
                >
                  Both
                </button>
              </div>
            </div>

            {(chartView === 'vertical' || chartView === 'both') && (
              <div className="h-64 mb-6">
                <Bar data={verticalBarData} options={verticalBarOptions} />
              </div>
            )}

            {(chartView === 'horizontal' || chartView === 'both') && (
              <div className="h-64">
                <Bar data={horizontalBarData} options={horizontalBarOptions} />
              </div>
            )}

            {chartView === 'radar' && (
              <div className="h-80">
                <Radar data={radarData} options={radarOptions} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance Criteria & Maturity Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {/* Degree of Compliance */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div
            className="text-white px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: theme.tableHeaderBg }}
          >
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Scoring Criteria (Degree of Compliance)
            </h3>
            <span className="text-xs text-slate-300">Scale: 0 - 4</span>
          </div>
          <div className="p-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-bold">Criteria Description</th>
                  <th className="py-2.5 px-3 font-bold text-center w-16">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.scoring_criteria.map((sc, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {sc.degree}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block w-6 h-6 rounded-md text-xs font-bold leading-6 text-white ${
                        sc.score === 0 ? 'bg-rose-500' :
                        sc.score === 1 ? 'bg-amber-500' :
                        sc.score === 2 ? 'bg-yellow-500 text-slate-950' :
                        sc.score === 3 ? 'bg-indigo-600' : 'bg-emerald-600'
                      }`}>
                        {sc.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maturity Levels */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div
            className="text-white px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: theme.tableHeaderBg }}
          >
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Maturity Level Mapping Criteria
            </h3>
            <span className="text-xs text-slate-300">5-Tier Benchmark</span>
          </div>
          <div className="p-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-bold w-24">Level</th>
                  <th className="py-2.5 px-3 font-bold">Maturity Mapping Criteria</th>
                  <th className="py-2.5 px-3 font-bold text-center w-28">Score Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.maturity_levels.map((ml, i) => {
                  const isActive = liveOverallScore >= ml.min && liveOverallScore <= ml.max;
                  return (
                    <tr
                      key={i}
                      className={`${
                        isActive
                          ? 'bg-indigo-50/90 font-bold border-l-4 border-l-indigo-600'
                          : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {isActive && <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                          <span className={isActive ? 'text-indigo-950 font-extrabold' : 'text-slate-700 font-semibold'}>
                            {ml.level}
                          </span>
                        </div>
                      </td>
                      <td className={`py-2.5 px-3 ${isActive ? 'text-indigo-950 font-bold' : 'text-slate-600'}`}>
                        {ml.criteria}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs ${
                            isActive
                              ? 'bg-indigo-600 text-white font-black shadow-xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ml.range}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
