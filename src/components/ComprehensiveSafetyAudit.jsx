import React from 'react';
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
  FileCheck
} from 'lucide-react';
import { useTableResize, ResizeHandle } from '../hooks/useTableResize.jsx';

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

const AUDIT_CRITERIA_WIDTHS = {
  score: 90,
  indicator: 180,
  degree: 460,
  weight: 140
};

const SCORING_RUBRIC = [
  { score: 0, indicator: 'Non-Compliant', badge: 'bg-rose-100 text-rose-800 border-rose-300', bar: 'bg-rose-500', pct: '0%', degree: 'No system in place', desc: 'No documented procedure, no records, and no implementation on shop floor.' },
  { score: 1, indicator: 'Inadequate', badge: 'bg-orange-100 text-orange-800 border-orange-300', bar: 'bg-orange-500', pct: '25%', degree: 'Inadequate System - (SOP is not defined/ Not documented)', desc: 'SOP missing, draft stage, or employees unaware of safety instructions.' },
  { score: 2, indicator: 'Documented Only', badge: 'bg-amber-100 text-amber-800 border-amber-300', bar: 'bg-amber-500', pct: '50%', degree: 'Defined & Documented (SOP is available)', desc: 'SOP defined and approved, but shopfloor verification shows patchy compliance.' },
  { score: 3, indicator: 'Partial Implementation', badge: 'bg-blue-100 text-blue-800 border-blue-300', bar: 'bg-blue-500', pct: '75%', degree: 'Partially Implemented (SOP defined, documented & implemented partially)', desc: 'Documented and deployed with minor gaps or occasional deviations noted.' },
  { score: 4, indicator: 'Full & Sustained', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', bar: 'bg-emerald-500', pct: '100%', degree: 'Implemented & Sustained (SOP defined, documented, strictly implemented & verified)', desc: 'Complete alignment: documented SOP, active execution, records verified, zero deviation.' }
];

export default function ComprehensiveSafetyAudit({
  units,
  selectedUnitId,
  onSelectUnit,
  onUpdateUnitCoverPage,
  unitMetrics,
  theme
}) {
  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];
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
    widths: rubricWidths,
    handleMouseDown: handleRubricResize,
    handleDoubleClick: handleRubricDblClick,
    resetAll: resetRubricWidths,
    activeResizer: rubricActiveResizer
  } = useTableResize(AUDIT_CRITERIA_WIDTHS, 'csa_audit_rubric_widths');

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
  const auditorTotalWidth = Object.values(auditorWidths).reduce((a, b) => a + b, 0);
  const auditeeTotalWidth = Object.values(auditeeWidths).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
                <span className="text-xs font-mono text-slate-400">Org EHS Maturity</span>
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

      {/* Scoring Criteria & Rating Indication (Degree of Compliance) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                Scoring Criteria & Rating Indication
                <span className="text-[11px] font-normal text-slate-500">(0 to 4 Degree of Compliance Rubric)</span>
              </h3>
              <p className="text-xs text-slate-500">Comprehensive safety audit evaluation criteria and compliance benchmarks</p>
            </div>
          </div>
          <button
            onClick={resetRubricWidths}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition no-print"
            title="Reset columns to default widths"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Widths
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-slate-100/75 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th
                  style={{ width: `${rubricWidths.score}px` }}
                  className="px-4 py-3 border-r border-slate-200 text-center relative select-none"
                >
                  Score
                  <ResizeHandle
                    columnId="score"
                    onMouseDown={handleRubricResize}
                    onDoubleClick={handleRubricDblClick}
                    isActive={rubricActiveResizer === 'score'}
                  />
                </th>
                <th
                  style={{ width: `${rubricWidths.indicator}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Rating Indicator
                  <ResizeHandle
                    columnId="indicator"
                    onMouseDown={handleRubricResize}
                    onDoubleClick={handleRubricDblClick}
                    isActive={rubricActiveResizer === 'indicator'}
                  />
                </th>
                <th
                  style={{ width: `${rubricWidths.degree}px` }}
                  className="px-4 py-3 border-r border-slate-200 relative select-none"
                >
                  Degree of Compliance & Operational Definition
                  <ResizeHandle
                    columnId="degree"
                    onMouseDown={handleRubricResize}
                    onDoubleClick={handleRubricDblClick}
                    isActive={rubricActiveResizer === 'degree'}
                  />
                </th>
                <th
                  style={{ width: `${rubricWidths.weight}px` }}
                  className="px-4 py-3 relative select-none"
                >
                  Compliance Weight
                  <ResizeHandle
                    columnId="weight"
                    onMouseDown={handleRubricResize}
                    onDoubleClick={handleRubricDblClick}
                    isActive={rubricActiveResizer === 'weight'}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {SCORING_RUBRIC.map((item) => (
                <tr key={item.score} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-4 py-3.5 border-r border-slate-200 text-center font-bold">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-sm shadow-sm">
                      {item.score}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 border-r border-slate-200">
                    <span className={`inline-flex px-3 py-1 rounded-md text-xs font-semibold border ${item.badge}`}>
                      {item.indicator}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 border-r border-slate-200">
                    <div className="font-semibold text-slate-800">{item.degree}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${item.bar} transition-all duration-300`}
                          style={{ width: item.pct }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 min-w-[36px] text-right">{item.pct}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
