import React, { useState } from 'react';
import {
  Chart as ChartJS,
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
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Building2,
  Calendar,
  FileText,
  MapPin,
  ShieldAlert,
  Users,
  Plus,
  Trash2,
  RotateCcw,
  Award,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  FileCheck2,
  BarChart3,
  Clock,
  ExternalLink
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

const AUDITOR_TABLE_WIDTHS = {
  sno: 50,
  name: 200,
  desig: 200,
  action: 45
};

const AUDITEE_TABLE_WIDTHS = {
  sno: 50,
  name: 180,
  desig: 180,
  desc: 220,
  action: 45
};

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

const ELEMENT_TABLE_WIDTHS = {
  sl: 50,
  elem: 300,
  baseline: 120,
  postCapa: 120,
  delta: 100,
  capaStats: 140,
  action: 85
};

const getScoreTheme = (score) => {
  if (typeof score !== 'number') return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' };
  if (score < 25) return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  if (score < 50) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  if (score < 75) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  if (score < 85) return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
  return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
};

const getMaturityBadge = (postCapaPct) => {
  if (typeof postCapaPct !== 'number') return { level: 'Level - I', badge: 'bg-slate-100 text-slate-600 border-slate-300', text: 'Not Available' };
  if (postCapaPct < 25) return { level: 'Level - I', badge: 'bg-rose-100 text-rose-800 border-rose-300', text: 'Initial' };
  if (postCapaPct < 50) return { level: 'Level - II', badge: 'bg-orange-100 text-orange-800 border-orange-300', text: 'Managed' };
  if (postCapaPct < 75) return { level: 'Level - III', badge: 'bg-amber-100 text-amber-800 border-amber-300', text: 'Defined' };
  if (postCapaPct < 85) return { level: 'Level - IV', badge: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Qualitatively Managed' };
  return { level: 'Level - V', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'Continuous Improvement' };
};



export default function ComprehensiveSafetyAudit({
  units = [],
  selectedUnitId,
  onSelectUnit = () => {},
  onUpdateUnitCoverPage = () => {},
  unitMetrics = {},
  theme = {},
  onSelectSheet = () => {}
}) {
  const [chartView, setChartView] = useState('both'); // 'bar', 'radar', 'both'

  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0] || {};
  const isCurrentUnitAvailable = currentUnit.available !== false && currentUnit.status !== 'Not Available Now';
  const cp = currentUnit.cover_page || {};

  const {
    widths: auditorWidths,
    handleMouseDown: handleAuditorResize,
    handleDoubleClick: handleAuditorDblClick,
    resetAll: resetAuditorWidths,
    activeResizer: auditorActiveResizer
  } = useTableResize(AUDITOR_TABLE_WIDTHS, 'csa_auditor_widths');

  const {
    widths: auditeeWidths,
    handleMouseDown: handleAuditeeResize,
    handleDoubleClick: handleAuditeeDblClick,
    resetAll: resetAuditeeWidths,
    activeResizer: auditeeActiveResizer
  } = useTableResize(AUDITEE_TABLE_WIDTHS, 'csa_auditee_widths');


  const {
    widths: unitWidths,
    handleMouseDown: handleUnitResize,
    handleDoubleClick: handleUnitDblClick,
    resetAll: resetUnitWidths,
    activeResizer: unitActiveResizer
  } = useTableResize(UNIT_BENCHMARK_WIDTHS, 'csa_audit_unit_benchmark_widths');

  const {
    widths: elemWidths,
    handleMouseDown: handleElemResize,
    handleDoubleClick: handleElemDblClick,
    resetAll: resetElemWidths,
    activeResizer: elemActiveResizer
  } = useTableResize(ELEMENT_TABLE_WIDTHS, 'csa_audit_elem_widths');

  const updateField = (field, value) => {
    onUpdateUnitCoverPage(currentUnit.id, {
      ...cp,
      [field]: value
    });
  };

  const updateAuditor = (index, field, value) => {
    const updated = [...(cp.auditors || [])];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateUnitCoverPage(currentUnit.id, {
      ...cp,
      auditors: updated
    });
  };

  const addAuditor = () => {
    const updated = [...(cp.auditors || []), { s_no: (cp.auditors || []).length + 1, name: '', designation: '' }];
    onUpdateUnitCoverPage(currentUnit.id, {
      ...cp,
      auditors: updated
    });
  };

  const removeAuditor = (index) => {
    const updated = (cp.auditors || []).filter((_, i) => i !== index);
    onUpdateUnitCoverPage(currentUnit.id, {
      ...cp,
      auditors: updated
    });
  };

  const updateAuditee = (index, field, value) => {
    const updated = [...(cp.auditees || [])];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateUnitCoverPage(currentUnit.id, {
      ...cp,
      auditees: updated
    });
  };

  const addAuditee = () => {
    const updated = [
      ...(cp.auditees || []),
      { s_no: (cp.auditees || []).length + 1, name: '', designation: '', description: '' }
    ];
    onUpdateUnitCoverPage(currentUnit.id, {
      ...cp,
      auditees: updated
    });
  };

  const removeAuditee = (index) => {
    const updated = (cp.auditees || []).filter((_, i) => i !== index);
    onUpdateUnitCoverPage(currentUnit.id, {
      ...cp,
      auditees: updated
    });
  };

  const currentMetrics = unitMetrics[currentUnit.id] || { baselineScore: 0.6, capaScore: 0.68, delta: 0.08 };
  const currentMetric = unitMetrics[currentUnit.id] || {
    baselineScorePct: null,
    baselineAvgScore: null,
    postCapaScorePct: null,
    postCapaAvgScore: null,
    deltaPct: null,
    maturityLevel: { level: 'Level - I', criteria: 'Initial', range: '1% - 25%' },
    elements: []
  };

  const auditorTotalWidth = Object.values(auditorWidths).reduce((a, b) => a + b, 0);
  const auditeeTotalWidth = Object.values(auditeeWidths).reduce((a, b) => a + b, 0);

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

  const barTopLabelsPlugin = {
    id: 'barTopLabelsCsa',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.hidden) return;

        meta.data.forEach((bar, index) => {
          const val = dataset.data[index];
          if (val === null || val === undefined) return;
          const text = `${Math.round(val * 10) / 10}%`;

          ctx.save();
          const barWidth = bar.width || 12;
          const yPos = bar.y - 3;

          if (barWidth < 18) {
            ctx.font = 'bold 8px sans-serif';
            ctx.fillStyle = '#1e293b';
            ctx.translate(bar.x, yPos);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 2, 0);
          } else {
            ctx.font = 'bold 10px sans-serif';
            ctx.fillStyle = datasetIndex === 0 ? '#475569' : '#0f172a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(text, bar.x, yPos);
          }
          ctx.restore();
        });
      });
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 22, left: 4, right: 4, bottom: 0 }
    },
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
        max: 115,
        ticks: {
          callback: (v) => (v <= 100 ? `${v}%` : ''),
          stepSize: 20,
          font: { size: 10 }
        },
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
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 md:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: theme.primary }}
            >
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                  Governance & Administration
                </span>
                <span className="text-xs font-mono text-slate-400">Granules EHS Maturity</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
                Comprehensive Safety Audit (Maturity Assessment)
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Unit Setup, Assessment Parameters, and Auditor/Auditee Sign-off Rosters
              </p>
            </div>
          </div>

          {/* Unit Switcher Hero Dropdown */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Assessment Unit
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => onSelectUnit(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3 flex items-center gap-2">
              <div className="text-center px-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Baseline</span>
                <span className="text-sm font-black font-mono text-slate-700">
                  {typeof currentMetrics.baselineScorePct === 'number'
                    ? `${currentMetrics.baselineScorePct.toFixed(1)}%`
                    : typeof currentMetrics.baselineScore === 'number'
                    ? `${(currentMetrics.baselineScore * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="text-center px-2">
                <span className="text-[9px] uppercase font-bold text-emerald-600 block">Post-CAPA</span>
                <span className="text-sm font-black font-mono text-emerald-600">
                  {typeof currentMetrics.postCapaScorePct === 'number'
                    ? `${currentMetrics.postCapaScorePct.toFixed(1)}%`
                    : typeof currentMetrics.capaScore === 'number'
                    ? `${(currentMetrics.capaScore * 100).toFixed(1)}%`
                    : 'Not Available'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {currentUnit.available === false && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div>
              <strong>Audit Report Not Available Now:</strong> Comprehensive Safety Audit report for <strong>{currentUnit.name}</strong> is currently pending for this cycle. Assessment parameters will become active once the audit is conducted.
            </div>
          </div>
        )}

        {/* Audit Details - Dropdown-Driven Parameters Grid */}
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Assessment Parameters & Governance Dropdowns
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
            {/* Unit Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Audited Facility Unit
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => onSelectUnit(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assessment Stage Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Audit Assessment Cycle
              </label>
              <select
                value={cp.audit_stage || 'Comprehensive Periodic Audit'}
                onChange={(e) => updateField('audit_stage', e.target.value)}
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Comprehensive Periodic Audit">Comprehensive Periodic Audit (Annual)</option>
                <option value="Statutory Triennial Safety Audit">Statutory Triennial Safety Audit</option>
                <option value="Process Safety Gap Assessment (PSM)">Process Safety Gap Assessment (PSM)</option>
                <option value="Surveillance Audit (Mid-Cycle)">Surveillance Audit (Mid-Cycle)</option>
                <option value="Pre-Commissioning Maturity Review">Pre-Commissioning Maturity Review</option>
              </select>
            </div>

            {/* Document No Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Document Reference
              </label>
              <select
                value={cp.document_no || `CSA/${currentUnit.code}/2026`}
                onChange={(e) => updateField('document_no', e.target.value)}
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value={`CSA/${currentUnit.code}/2026`}>{`CSA/${currentUnit.code}/2026 (Official)`}</option>
                <option value={`CSA/${currentUnit.code}/2026-REV1`}>{`CSA/${currentUnit.code}/2026-REV1 (Post-CAPA)`}</option>
                <option value={`AUDIT/${currentUnit.code}/SPECIAL`}>{`AUDIT/${currentUnit.code}/SPECIAL (Special Review)`}</option>
              </select>
            </div>

            {/* Facility Hazard Classification */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Hazard Classification
              </label>
              <select
                value={cp.hazard_class || 'Major Accident Hazard (MAH)'}
                onChange={(e) => updateField('hazard_class', e.target.value)}
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Major Accident Hazard (MAH)">Major Accident Hazard (MAH) - Chemical</option>
                <option value="Category A High Hazard">Category A High Hazard - Process Units</option>
                <option value="Category B Medium Hazard">Category B Medium Hazard - Formulations</option>
                <option value="Category C General Facility">Category C General Facility - Logistics/Storage</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Unit Location
              </label>
              <input
                type="text"
                value={cp.unit_location || currentUnit.location}
                onChange={(e) => updateField('unit_location', e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Report Prepared Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Report Prepared Date
              </label>
              <input
                type="date"
                value={cp.report_date ? cp.report_date.substring(0, 10) : ''}
                onChange={(e) => updateField('report_date', e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Assessment Start Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Assessment Start Date
              </label>
              <input
                type="date"
                value={cp.start_date ? cp.start_date.substring(0, 10) : ''}
                onChange={(e) => updateField('start_date', e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Assessment End Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Assessment End Date
              </label>
              <input
                type="date"
                value={cp.end_date ? cp.end_date.substring(0, 10) : ''}
                onChange={(e) => updateField('end_date', e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. UNIT-WISE OPERATIONAL BENCHMARK & DIVISION SUMMARY (ALL 6 OPERATING UNITS) */}
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
                      {isAvail && typeof m.postCapaScorePct === 'number' ? (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${themeCol.bg} ${themeCol.text} ${themeCol.border}`}>
                          {getMaturityBadge(m.postCapaScorePct).level}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
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
                        className={`px-3 py-1 rounded text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700'
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
      {/* 3. FOCUSED UNIT DEEP DIVE KPI CARDS & CHARTS                              */}
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
              {currentUnit.cover_page?.location || currentUnit.location || 'Plant Site'} • {currentUnit.cover_page?.hazard_classification || 'Class A Chemical'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectSheet('Sheet_1')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Open Unit Audit Checklist
            </button>
          </div>
        </div>

        {/* If unit is not available now (e.g. GLS) */}
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
                Switch to Available FD Facility: GGP
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
                    {typeof currentMetric.baselineScorePct === 'number' ? `${currentMetric.baselineScorePct.toFixed(1)}%` : 'N/A'}
                  </span>
                  {typeof currentMetric.baselineAvgScore === 'number' && (
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
                    {typeof currentMetric.postCapaScorePct === 'number' ? `${currentMetric.postCapaScorePct.toFixed(1)}%` : 'N/A'}
                  </span>
                  {typeof currentMetric.postCapaAvgScore === 'number' && (
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
                <div className="flex items-line gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-700">
                    +{typeof currentMetric.deltaPct === 'number' ? currentMetric.deltaPct.toFixed(1) : '0.0'}%
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

            {/* Charts View: Bar & Radar */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    19 Elements Compliance Profile ({currentUnit.code})
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
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
                    <Bar data={barChartData} options={barChartOptions} plugins={[barTopLabelsPlugin]} />
                  </div>
                )}
                {(chartView === 'both' || chartView === 'radar') && (
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200 h-80 flex items-center justify-center">
                    <Radar data={radarChartData} options={radarChartOptions} />
                  </div>
                )}
              </div>
            </div>

            {/* 19 Elements Compliance Table with Direct Jump */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentUnit.code} Element-by-Element Breakdown (19 Elements)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click "Open" to jump directly to any audit element's detailed checklist questions and evidence.
                  </p>
                </div>
                <button
                  onClick={resetElemWidths}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
                >
                  Reset Widths
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                      <th style={{ width: `${elemWidths.sl}px` }} className="px-3 py-2.5 border-r border-slate-200 text-center relative select-none">
                        #
                        <ResizeHandle columnId="sl" onMouseDown={handleElemResize} onDoubleClick={handleElemDblClick} isActive={elemActiveResizer === 'sl'} />
                      </th>
                      <th style={{ width: `${elemWidths.elem}px` }} className="px-4 py-2.5 border-r border-slate-200 relative select-none">
                        Element Name
                        <ResizeHandle columnId="elem" onMouseDown={handleElemResize} onDoubleClick={handleElemDblClick} isActive={elemActiveResizer === 'elem'} />
                      </th>
                      <th style={{ width: `${elemWidths.baseline}px` }} className="px-4 py-2.5 border-r border-slate-200 relative select-none">
                        Baseline Score
                        <ResizeHandle columnId="baseline" onMouseDown={handleElemResize} onDoubleClick={handleElemDblClick} isActive={elemActiveResizer === 'baseline'} />
                      </th>
                      <th style={{ width: `${elemWidths.postCapa}px` }} className="px-4 py-2.5 border-r border-slate-200 relative select-none">
                        Post-CAPA Score
                        <ResizeHandle columnId="postCapa" onMouseDown={handleElemResize} onDoubleClick={handleElemDblClick} isActive={elemActiveResizer === 'postCapa'} />
                      </th>
                      <th style={{ width: `${elemWidths.delta}px` }} className="px-4 py-2.5 border-r border-slate-200 relative select-none">
                        Delta
                        <ResizeHandle columnId="delta" onMouseDown={handleElemResize} onDoubleClick={handleElemDblClick} isActive={elemActiveResizer === 'delta'} />
                      </th>
                      <th style={{ width: `${elemWidths.capaStats}px` }} className="px-4 py-2.5 border-r border-slate-200 text-center relative select-none">
                        CAPA Actions
                        <ResizeHandle columnId="capaStats" onMouseDown={handleElemResize} onDoubleClick={handleElemDblClick} isActive={elemActiveResizer === 'capaStats'} />
                      </th>
                      <th style={{ width: `${elemWidths.action}px` }} className="px-3 py-2.5 text-center relative select-none">
                        Checklist
                        <ResizeHandle columnId="action" onMouseDown={handleElemResize} onDoubleClick={handleElemDblClick} isActive={elemActiveResizer === 'action'} />
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

      {/* Auditor Team and Auditees & Plant Participants (Rendered because a unit is selected) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Auditor Team Table */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div
            className="text-white px-5 py-3.5 flex items-center justify-between"
            style={{ backgroundColor: theme.tableHeaderBg }}
          >
            <div>
              <h2 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-300" />
                <span>Auditor Team — {currentUnit.code}</span>
              </h2>
              <p className="text-[10px] text-slate-300">Lead Auditors & Process Safety Specialists</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={resetAuditorWidths}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded transition flex items-center gap-0.5"
                title="Reset column widths"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={addAuditor}
                className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-md transition font-semibold"
              >
                <Plus className="w-3 h-3" /> Add Auditor
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="text-left text-xs border-collapse table-fixed" style={{ width: auditorTotalWidth }}>
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
                  <th
                    style={{ width: auditorWidths.sno, minWidth: 35 }}
                    className="relative py-2.5 px-3 text-center font-bold border-r border-slate-200"
                  >
                    #
                    <ResizeHandle
                      onMouseDown={(e) => handleAuditorResize('sno', e, 35)}
                      onDoubleClick={() => handleAuditorDblClick('sno')}
                      active={auditorActiveResizer === 'sno'}
                    />
                  </th>
                  <th
                    style={{ width: auditorWidths.name, minWidth: 100 }}
                    className="relative py-2.5 px-3 font-bold border-r border-slate-200"
                  >
                    Auditor Name
                    <ResizeHandle
                      onMouseDown={(e) => handleAuditorResize('name', e, 100)}
                      onDoubleClick={() => handleAuditorDblClick('name')}
                      active={auditorActiveResizer === 'name'}
                    />
                  </th>
                  <th
                    style={{ width: auditorWidths.desig, minWidth: 100 }}
                    className="relative py-2.5 px-3 font-bold border-r border-slate-200"
                  >
                    Designation
                    <ResizeHandle
                      onMouseDown={(e) => handleAuditorResize('desig', e, 100)}
                      onDoubleClick={() => handleAuditorDblClick('desig')}
                      active={auditorActiveResizer === 'desig'}
                    />
                  </th>
                  <th
                    style={{ width: auditorWidths.action, minWidth: 35 }}
                    className="relative py-2.5 px-2 text-center font-bold no-print"
                  >
                    <ResizeHandle
                      onMouseDown={(e) => handleAuditorResize('action', e, 35)}
                      onDoubleClick={() => handleAuditorDblClick('action')}
                      active={auditorActiveResizer === 'action'}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(cp.auditors || []).map((auditor, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td style={{ width: auditorWidths.sno }} className="py-2.5 px-3 text-center font-semibold text-slate-400 border-r border-slate-100">
                      {auditor.s_no || idx + 1}
                    </td>
                    <td style={{ width: auditorWidths.name }} className="py-2.5 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditor.name || ''}
                        onChange={(e) => updateAuditor(idx, 'name', e.target.value)}
                        placeholder="Auditor name"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs font-medium"
                      />
                    </td>
                    <td style={{ width: auditorWidths.desig }} className="py-2.5 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditor.designation || ''}
                        onChange={(e) => updateAuditor(idx, 'designation', e.target.value)}
                        placeholder="e.g. Lead Auditor"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs font-medium"
                      />
                    </td>
                    <td style={{ width: auditorWidths.action }} className="py-2.5 px-2 text-center no-print">
                      <button
                        onClick={() => removeAuditor(idx)}
                        className="text-slate-300 hover:text-rose-500 p-1 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditees and Plant Participants Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div
            className="text-white px-5 py-3.5 flex items-center justify-between"
            style={{ backgroundColor: theme.tableHeaderBg }}
          >
            <div>
              <h2 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-300" />
                <span>Auditees & Plant Participants — {currentUnit.code}</span>
              </h2>
              <p className="text-[10px] text-slate-300">Operations Heads, Maintenance Leads & Safety Coordinators</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={resetAuditeeWidths}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded transition flex items-center gap-0.5"
                title="Reset column widths"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={addAuditee}
                className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-md transition font-semibold"
              >
                <Plus className="w-3 h-3" /> Add Participant
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="text-left text-xs border-collapse table-fixed" style={{ width: auditeeTotalWidth }}>
              <thead className="sticky top-0 bg-slate-50 z-10 shadow-xs border-b border-slate-200 select-none">
                <tr className="text-slate-600">
                  <th
                    style={{ width: auditeeWidths.sno, minWidth: 35 }}
                    className="relative py-2.5 px-3 text-center font-bold border-r border-slate-200"
                  >
                    #
                    <ResizeHandle
                      onMouseDown={(e) => handleAuditeeResize('sno', e, 35)}
                      onDoubleClick={() => handleAuditeeDblClick('sno')}
                      active={auditeeActiveResizer === 'sno'}
                    />
                  </th>
                  <th
                    style={{ width: auditeeWidths.name, minWidth: 90 }}
                    className="relative py-2.5 px-3 font-bold border-r border-slate-200"
                  >
                    Participant Name
                    <ResizeHandle
                      onMouseDown={(e) => handleAuditeeResize('name', e, 90)}
                      onDoubleClick={() => handleAuditeeDblClick('name')}
                      active={auditeeActiveResizer === 'name'}
                    />
                  </th>
                  <th
                    style={{ width: auditeeWidths.desig, minWidth: 90 }}
                    className="relative py-2.5 px-3 font-bold border-r border-slate-200"
                  >
                    Designation
                    <ResizeHandle
                      onMouseDown={(e) => handleAuditeeResize('desig', e, 90)}
                      onDoubleClick={() => handleAuditeeDblClick('desig')}
                      active={auditeeActiveResizer === 'desig'}
                    />
                  </th>
                  <th
                    style={{ width: auditeeWidths.desc, minWidth: 100 }}
                    className="relative py-2.5 px-3 font-bold border-r border-slate-200"
                  >
                    Role / Area
                    <ResizeHandle
                      onMouseDown={(e) => handleAuditeeResize('desc', e, 100)}
                      onDoubleClick={() => handleAuditeeDblClick('desc')}
                      active={auditeeActiveResizer === 'desc'}
                    />
                  </th>
                  <th
                    style={{ width: auditeeWidths.action, minWidth: 35 }}
                    className="relative py-2.5 px-2 text-center font-bold no-print"
                  >
                    <ResizeHandle
                      onMouseDown={(e) => handleAuditeeResize('action', e, 35)}
                      onDoubleClick={() => handleAuditeeDblClick('action')}
                      active={auditeeActiveResizer === 'action'}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(cp.auditees || []).map((auditee, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td style={{ width: auditeeWidths.sno }} className="py-2 px-3 text-center font-semibold text-slate-400 border-r border-slate-100">
                      {auditee.s_no || idx + 1}
                    </td>
                    <td style={{ width: auditeeWidths.name }} className="py-2 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditee.name || ''}
                        onChange={(e) => updateAuditee(idx, 'name', e.target.value)}
                        placeholder="Auditee name"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs font-medium"
                      />
                    </td>
                    <td style={{ width: auditeeWidths.desig }} className="py-2 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditee.designation || ''}
                        onChange={(e) => updateAuditee(idx, 'designation', e.target.value)}
                        placeholder="e.g. Area Incharge"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs font-medium"
                      />
                    </td>
                    <td style={{ width: auditeeWidths.desc }} className="py-2 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditee.description || ''}
                        onChange={(e) => updateAuditee(idx, 'description', e.target.value)}
                        placeholder="Area / responsibility"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs font-medium"
                      />
                    </td>
                    <td style={{ width: auditeeWidths.action }} className="py-2 px-2 text-center no-print">
                      <button
                        onClick={() => removeAuditee(idx)}
                        className="text-slate-300 hover:text-rose-500 p-1 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
