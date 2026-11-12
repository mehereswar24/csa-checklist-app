import React from 'react';
import { Plus, Trash2, Calendar, FileText, MapPin, RotateCcw } from 'lucide-react';
import { useTableResize, ResizeHandle } from '../hooks/useTableResize.jsx';

const AUDITOR_CP_WIDTHS = {
  sno: 50,
  name: 190,
  desig: 190,
  action: 45
};

const AUDITEE_CP_WIDTHS = {
  sno: 50,
  name: 170,
  desig: 170,
  desc: 200,
  action: 45
};

export default function CoverPage({ data, onChange, theme }) {
  const { cover_page: cp, logo } = data;

  const {
    widths: auditorWidths,
    handleMouseDown: handleAuditorResize,
    handleDoubleClick: handleAuditorDblClick,
    resetAll: resetAuditorWidths,
    activeResizer: auditorActiveResizer
  } = useTableResize(AUDITOR_CP_WIDTHS, 'cp_auditor_widths');

  const {
    widths: auditeeWidths,
    handleMouseDown: handleAuditeeResize,
    handleDoubleClick: handleAuditeeDblClick,
    resetAll: resetAuditeeWidths,
    activeResizer: auditeeActiveResizer
  } = useTableResize(AUDITEE_CP_WIDTHS, 'cp_auditee_widths');

  const updateField = (field, value) => {
    onChange({
      ...data,
      cover_page: { ...cp, [field]: value }
    });
  };

  const updateAuditor = (index, field, value) => {
    const updated = [...cp.auditors];
    updated[index] = { ...updated[index], [field]: value };
    onChange({
      ...data,
      cover_page: { ...cp, auditors: updated }
    });
  };

  const addAuditor = () => {
    const updated = [...cp.auditors, { s_no: cp.auditors.length + 1, name: '', designation: '' }];
    onChange({
      ...data,
      cover_page: { ...cp, auditors: updated }
    });
  };

  const removeAuditor = (index) => {
    const updated = cp.auditors.filter((_, i) => i !== index);
    onChange({
      ...data,
      cover_page: { ...cp, auditors: updated }
    });
  };

  const updateAuditee = (index, field, value) => {
    const updated = [...cp.auditees];
    updated[index] = { ...updated[index], [field]: value };
    onChange({
      ...data,
      cover_page: { ...cp, auditees: updated }
    });
  };

  const addAuditee = () => {
    const updated = [...cp.auditees, { s_no: cp.auditees.length + 1, name: '', designation: '', description: '' }];
    onChange({
      ...data,
      cover_page: { ...cp, auditees: updated }
    });
  };

  const removeAuditee = (index) => {
    const updated = cp.auditees.filter((_, i) => i !== index);
    onChange({
      ...data,
      cover_page: { ...cp, auditees: updated }
    });
  };

  const auditorTotalWidth = Object.values(auditorWidths).reduce((a, b) => a + b, 0);
  const auditeeTotalWidth = Object.values(auditeeWidths).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200/80 p-6 md:p-8">
      {/* Top Banner */}
      <div className="border-b border-slate-100 pb-6 mb-7">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {logo ? (
              <img
                src={logo}
                alt="Granules India Limited Logo"
                className="h-20 w-auto max-w-[200px] object-contain border border-slate-200/80 rounded-xl p-2 bg-white shadow-xs"
              />
            ) : (
              <div className="h-20 w-24 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400">
                LOGO
              </div>
            )}
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase bg-[#0093dd]/10 text-[#0093dd] border border-[#0093dd]/30 px-2.5 py-0.5 rounded-md">
                Granules EHS & PSM Framework
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
                {cp.title || 'Comprehensive Safety Audit'}
              </h1>
              <p className="text-sm text-slate-500 font-medium">Cover Page & Assessment Record</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-600 flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Assessment Document & Attendance Tracking</span>
          </div>
        </div>
      </div>

      {/* Metadata Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-slate-50/60 p-5 rounded-xl border border-slate-200/60">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Document No:
          </label>
          <input
            type="text"
            value={cp.document_no || ''}
            onChange={(e) => updateField('document_no', e.target.value)}
            placeholder="e.g. CSA/2026/001"
            className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Unit Location:
          </label>
          <input
            type="text"
            value={cp.unit_location || ''}
            onChange={(e) => updateField('unit_location', e.target.value)}
            placeholder="e.g. Plant 1 - Main Facility"
            className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Report Prepared Date:
          </label>
          <input
            type="date"
            value={cp.report_date ? cp.report_date.substring(0, 10) : ''}
            onChange={(e) => updateField('report_date', e.target.value)}
            className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Assessment Start Date:
          </label>
          <input
            type="date"
            value={cp.start_date ? cp.start_date.substring(0, 10) : ''}
            onChange={(e) => updateField('start_date', e.target.value)}
            className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Assessment End Date:
          </label>
          <input
            type="date"
            value={cp.end_date ? cp.end_date.substring(0, 10) : ''}
            onChange={(e) => updateField('end_date', e.target.value)}
            className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Resizable Side-by-Side Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Auditor Table */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div
            className="text-white px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: theme.tableHeaderBg }}
          >
            <div>
              <h2 className="font-bold text-xs uppercase tracking-wider">Auditor Team</h2>
              <p className="text-[10px] text-slate-300">Lead Auditors & Specialists</p>
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
                className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-md transition"
              >
                <Plus className="w-3 h-3" /> Add
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
                {cp.auditors.map((auditor, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td style={{ width: auditorWidths.sno }} className="py-2 px-3 text-center font-semibold text-slate-400 border-r border-slate-100">
                      {auditor.s_no || idx + 1}
                    </td>
                    <td style={{ width: auditorWidths.name }} className="py-2 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditor.name || ''}
                        onChange={(e) => updateAuditor(idx, 'name', e.target.value)}
                        placeholder="Enter name"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td style={{ width: auditorWidths.desig }} className="py-2 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditor.designation || ''}
                        onChange={(e) => updateAuditor(idx, 'designation', e.target.value)}
                        placeholder="e.g. Lead Auditor"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td style={{ width: auditorWidths.action }} className="py-2 px-2 text-center no-print">
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

        {/* Auditee Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div
            className="text-white px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: theme.tableHeaderBg }}
          >
            <div>
              <h2 className="font-bold text-xs uppercase tracking-wider">Auditees & Plant Participants</h2>
              <p className="text-[10px] text-slate-300">Plant Representatives & Process Owners</p>
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
                className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-md transition"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
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
                    Auditee Name
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
                    Description
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
                {cp.auditees.map((auditee, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td style={{ width: auditeeWidths.sno }} className="py-2 px-3 text-center font-semibold text-slate-400 border-r border-slate-100">
                      {auditee.s_no || idx + 1}
                    </td>
                    <td style={{ width: auditeeWidths.name }} className="py-2 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditee.name || ''}
                        onChange={(e) => updateAuditee(idx, 'name', e.target.value)}
                        placeholder="Enter name"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td style={{ width: auditeeWidths.desig }} className="py-2 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditee.designation || ''}
                        onChange={(e) => updateAuditee(idx, 'designation', e.target.value)}
                        placeholder="e.g. Operations Mgr"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td style={{ width: auditeeWidths.desc }} className="py-2 px-3 border-r border-slate-100">
                      <input
                        type="text"
                        value={auditee.description || ''}
                        onChange={(e) => updateAuditee(idx, 'description', e.target.value)}
                        placeholder="Area / role"
                        className="w-full border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white bg-transparent rounded px-2 py-1 text-xs"
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
