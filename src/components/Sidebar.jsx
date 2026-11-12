import React, { useState } from 'react';
import {
  FileText,
  Users,
  LayoutDashboard,
  Crown,
  Handshake,
  Scale,
  Target,
  HeartPulse,
  HardHat,
  KeyRound,
  GraduationCap,
  Database,
  Workflow,
  Wrench,
  RefreshCw,
  PlayCircle,
  AlertTriangle,
  FlaskConical,
  Flame,
  Zap,
  Siren,
  Search,
  ChevronLeft,
  ChevronRight,
  Award,
  Layers
} from 'lucide-react';

export default function Sidebar({
  sheets,
  activeSheet,
  onSelectSheet,
  getSheetScore,
  overallScore,
  isCollapsed,
  onToggleCollapse,
  theme
}) {
  const [filterText, setFilterText] = useState('');

  // Distinct, unique icon and color configuration for each sheet
  const getSheetIconConfig = (sheetName) => {
    switch (sheetName) {
      case 'Cover Page':
        return { icon: <FileText className="w-4 h-4 text-emerald-400" />, label: 'Cover Page' };
      case 'Audit Team':
        return { icon: <Users className="w-4 h-4 text-sky-400" />, label: 'Audit Team' };
      case 'Summary':
        return { icon: <LayoutDashboard className="w-4 h-4 text-amber-400" />, label: 'Summary' };
      case 'EHS Leadership & Commitment':
        return { icon: <Crown className="w-4 h-4 text-amber-300" />, label: 'EHS Leadership' };
      case 'Employee Engagement':
        return { icon: <Handshake className="w-4 h-4 text-purple-400" />, label: 'Engagement' };
      case 'Statutory Compliance & Standa':
        return { icon: <Scale className="w-4 h-4 text-blue-400" />, label: 'Statutory Compliance' };
      case 'HIRA':
        return { icon: <Target className="w-4 h-4 text-rose-400" />, label: 'HIRA' };
      case 'IH & OHS':
        return { icon: <HeartPulse className="w-4 h-4 text-pink-400" />, label: 'IH & OHS' };
      case 'CSM':
        return { icon: <HardHat className="w-4 h-4 text-yellow-400" />, label: 'CSM' };
      case 'Work Permit System':
        return { icon: <KeyRound className="w-4 h-4 text-emerald-400" />, label: 'Work Permits & LOTO' };
      case 'Training, Awareness and Compete':
        return { icon: <GraduationCap className="w-4 h-4 text-violet-400" />, label: 'Training & Competency' };
      case 'PSI':
        return { icon: <Database className="w-4 h-4 text-cyan-400" />, label: 'Process Safety Info' };
      case 'PHA':
        return { icon: <Workflow className="w-4 h-4 text-indigo-400" />, label: 'PHA' };
      case 'Mechanical Integrity':
        return { icon: <Wrench className="w-4 h-4 text-slate-300" />, label: 'Mechanical Integrity' };
      case 'MOC':
        return { icon: <RefreshCw className="w-4 h-4 text-teal-400" />, label: 'Management of Change' };
      case 'PSSR':
        return { icon: <PlayCircle className="w-4 h-4 text-lime-400" />, label: 'PSSR' };
      case 'Workplace Hazards':
        return { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, label: 'Workplace Hazards' };
      case 'Chemical Hazards':
        return { icon: <FlaskConical className="w-4 h-4 text-fuchsia-400" />, label: 'Chemical Hazards' };
      case 'FIRE AND EXPLOSION HAZARD':
        return { icon: <Flame className="w-4 h-4 text-orange-400" />, label: 'Fire & Explosion' };
      case 'Electrical Safety':
        return { icon: <Zap className="w-4 h-4 text-yellow-300" />, label: 'Electrical Safety' };
      case 'Emergency Planning & Respon':
        return { icon: <Siren className="w-4 h-4 text-red-400" />, label: 'Emergency Response' };
      case 'Incident Investigation':
        return { icon: <Search className="w-4 h-4 text-blue-300" />, label: 'Incident Investigation' };
      default:
        return { icon: <FileText className="w-4 h-4 text-slate-300" />, label: sheetName };
    }
  };

  const coreSheets = ['Cover Page', 'Audit Team', 'Summary'];
  const checklistSheets = sheets.filter((s) => !coreSheets.includes(s));

  const filteredChecklists = checklistSheets.filter((s) => {
    if (!filterText) return true;
    return s.toLowerCase().includes(filterText.toLowerCase());
  });

  return (
    <aside
      className={`${theme.sidebarBg} text-slate-200 border-r ${theme.sidebarBorder} transition-all duration-300 ease-in-out flex flex-col shrink-0 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-72 md:w-80'
      }`}
    >
      {/* Sidebar Header */}
      <div className={`h-14 border-b ${theme.sidebarBorder} px-3.5 flex items-center justify-between ${theme.sidebarHeaderBg}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: theme.primary }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Audit Sections</h2>
              <p className="text-[10px] text-slate-400">22 Unique Elements</p>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Input */}
      {!isCollapsed && (
        <div className="p-3 border-b border-white/5 bg-black/20">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sections or elements..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full text-xs bg-white/5 text-slate-100 placeholder-slate-500 rounded-md pl-8 pr-2.5 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links Scrollable List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {/* Core Pages (Cover, Team, Summary) */}
        <div>
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Overview & Reports
            </div>
          )}
          <div className="space-y-1">
            {coreSheets.map((sheet) => {
              const isActive = activeSheet === sheet;
              const isSummary = sheet === 'Summary';
              const iconConfig = getSheetIconConfig(sheet);

              return (
                <button
                  key={sheet}
                  onClick={() => onSelectSheet(sheet)}
                  title={isCollapsed ? sheet : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? `${theme.activeTabBg} text-white font-bold shadow-md`
                      : isSummary
                      ? 'bg-white/5 hover:bg-white/10 text-amber-200'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-1' : ''}`}
                >
                  <div className="shrink-0 p-1 rounded-md bg-white/5">{iconConfig.icon}</div>
                  {!isCollapsed && (
                    <div className="flex-1 text-left flex items-center justify-between">
                      <span className="truncate">{sheet}</span>
                      {isSummary && (
                        <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded shadow-xs">
                          {(overallScore * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Checklist Elements (19 Elements) */}
        <div>
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Audit Elements ({filteredChecklists.length})
              </span>
              <span className="text-[9px] text-slate-500">19 Elements</span>
            </div>
          )}

          <div className="space-y-1">
            {filteredChecklists.map((sheet, idx) => {
              const isActive = activeSheet === sheet;
              const score = getSheetScore(sheet);
              const scorePct = score !== null && score !== undefined ? Math.round(score * 100) : null;
              const iconConfig = getSheetIconConfig(sheet);

              let badgeColor = 'bg-slate-800 text-slate-400';
              let barColor = 'bg-slate-600';
              if (scorePct !== null) {
                if (scorePct >= 75) {
                  badgeColor = 'bg-emerald-950 text-emerald-400 border border-emerald-800/60';
                  barColor = 'bg-emerald-500';
                } else if (scorePct >= 50) {
                  badgeColor = 'bg-amber-950 text-amber-400 border border-amber-800/60';
                  barColor = 'bg-amber-500';
                } else {
                  badgeColor = 'bg-rose-950 text-rose-400 border border-rose-800/60';
                  barColor = 'bg-rose-500';
                }
              }

              return (
                <button
                  key={sheet}
                  onClick={() => onSelectSheet(sheet)}
                  title={isCollapsed ? `${idx + 1}. ${sheet} (${scorePct ?? 0}%)` : undefined}
                  className={`w-full group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all relative ${
                    isActive
                      ? `${theme.activeTabBg} text-white font-bold shadow-md`
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-1' : ''}`}
                >
                  <div className="shrink-0 p-1 rounded-md bg-white/5">{iconConfig.icon}</div>

                  {!isCollapsed ? (
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate text-xs">
                          <span className="text-slate-400 font-mono text-[10px] mr-1.5">
                            {idx + 1}.
                          </span>
                          {sheet}
                        </span>

                        {scorePct !== null && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${badgeColor}`}
                          >
                            {scorePct}%
                          </span>
                        )}
                      </div>

                      {/* Mini Score Progress Bar */}
                      {scorePct !== null && (
                        <div className="w-full bg-black/40 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${Math.min(scorePct, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    scorePct !== null && (
                      <span
                        className={`absolute right-1 top-1 w-2 h-2 rounded-full ${
                          scorePct >= 75 ? 'bg-emerald-400' : scorePct >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                      />
                    )
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-white/5 bg-black/25 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Benchmark Score
            </span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              {(overallScore * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
              style={{ width: `${Math.min(overallScore * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </aside>
  );
}
