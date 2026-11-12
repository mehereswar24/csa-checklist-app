import React, { useState } from 'react';
import {
  FileCheck2,
  LayoutDashboard,
  BarChart3,
  Compass,
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
  Layers,
  X,
  Building2,
  TrendingUp,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

export default function Sidebar({
  checklistSheets = [],
  activeSheet,
  onSelectSheet,
  getSheetScore,
  unitMetrics = {},
  selectedUnitId,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  theme
}) {
  const [filterText, setFilterText] = useState('');

  const getElementIcon = (sheetName) => {
    switch (sheetName) {
      case 'EHS Leadership & Commitment':
        return <Crown className="w-4 h-4 text-amber-300" />;
      case 'Employee Engagement':
        return <Handshake className="w-4 h-4 text-purple-400" />;
      case 'Statutory Compliance & Standa':
        return <Scale className="w-4 h-4 text-blue-400" />;
      case 'HIRA':
        return <Target className="w-4 h-4 text-rose-400" />;
      case 'IH & OHS':
        return <HeartPulse className="w-4 h-4 text-pink-400" />;
      case 'CSM':
        return <HardHat className="w-4 h-4 text-yellow-400" />;
      case 'Work Permit System':
        return <KeyRound className="w-4 h-4 text-emerald-400" />;
      case 'Training, Awareness and Compete':
        return <GraduationCap className="w-4 h-4 text-violet-400" />;
      case 'PSI':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'PHA':
        return <Workflow className="w-4 h-4 text-indigo-400" />;
      case 'Mechanical Integrity':
        return <Wrench className="w-4 h-4 text-slate-300" />;
      case 'MOC':
        return <RefreshCw className="w-4 h-4 text-teal-400" />;
      case 'PSSR':
        return <PlayCircle className="w-4 h-4 text-lime-400" />;
      case 'Workplace Hazards':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Chemical Hazards':
        return <FlaskConical className="w-4 h-4 text-fuchsia-400" />;
      case 'FIRE AND EXPLOSION HAZARD':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Electrical Safety':
        return <Zap className="w-4 h-4 text-yellow-300" />;
      case 'Emergency Planning & Respon':
        return <Siren className="w-4 h-4 text-red-400" />;
      case 'Incident Investigation':
        return <Search className="w-4 h-4 text-blue-300" />;
      default:
        return <FileCheck2 className="w-4 h-4 text-slate-300" />;
    }
  };

  const coreSections = [
    {
      id: 'Summary',
      label: 'Granules EHS Maturity (Landing)',
      badge: 'Executive',
      icon: <LayoutDashboard className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'Audit',
      label: 'Comprehensive Safety Audit',
      badge: 'Assessment',
      icon: <FileCheck2 className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'Analytics',
      label: '6 Units Interactive Analytics',
      badge: 'Compare',
      icon: <BarChart3 className="w-4 h-4 text-sky-400" />
    }
  ];

  const filteredChecklists = checklistSheets.filter((s) => {
    if (!filterText) return true;
    return s.toLowerCase().includes(filterText.toLowerCase());
  });

  const handleItemClick = (sheetId) => {
    onSelectSheet(sheetId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const currentMetric = unitMetrics[selectedUnitId] || { postCapaScorePct: 0 };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Floating Sidebar Panel */}
      <aside
        className={`
          ${theme.sidebarBg} text-slate-200 border ${theme.sidebarBorder}
          flex flex-col select-none transition-all duration-300 ease-in-out h-full
          ${
            isMobileOpen
              ? 'fixed inset-y-2 left-2 z-50 w-[calc(100vw-1rem)] max-w-xs rounded-2xl shadow-2xl'
              : 'hidden md:flex relative z-20 rounded-2xl shadow-sm'
          }
          shrink-0 overflow-hidden
          ${isCollapsed ? 'md:w-16' : 'md:w-72 lg:w-80'}
        `}
      >
        {/* Sidebar Header (Navigation Context) */}
        <div
          className={`h-14 border-b ${theme.sidebarBorder} px-3.5 flex items-center justify-between ${theme.sidebarHeaderBg} shrink-0`}
        >
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 px-1.5 bg-white rounded-lg shadow-xs flex items-center justify-center shrink-0 border border-white/20">
                <img
                  src="/granules_logo.png"
                  alt="Granules Logo"
                  className="h-5 w-auto object-contain"
                />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Audit Sections
                </span>
                <span className="text-[10px] text-[#0093dd] font-semibold">19 Elements • 4 Modules</span>
              </div>
            </div>
          ) : (
            <div className="mx-auto h-8 w-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-xs border border-white/20">
              <img src="/granules_logo.png" alt="Granules Logo" className="h-5 w-5 object-contain" />
            </div>
          )}

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className={`hidden md:block p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-2.5 border-b border-white/5 bg-black/20 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit elements..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full text-xs bg-white/5 text-slate-100 placeholder-slate-400 rounded-lg pl-8 pr-2.5 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Links Scrollable List (No visible scrollbar slider) */}
        <div
          className="flex-1 overflow-y-auto py-2.5 px-2 space-y-4 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Main Core Sections */}
          <div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                <span>Core Framework</span>
                <span className="text-[9px] text-slate-500">4 Modules</span>
              </div>
            )}
            <div className="space-y-1">
              {coreSections.map((sec) => {
                const isActive = activeSheet === sec.id;

                return (
                  <button
                    key={sec.id}
                    onClick={() => handleItemClick(sec.id)}
                    title={isCollapsed && !isMobileOpen ? sec.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? `${theme.activeTabBg} text-white font-bold shadow-md`
                        : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center px-1' : ''}`}
                  >
                    <div className="shrink-0 p-1.5 rounded-lg bg-white/5">{sec.icon}</div>
                    {(!isCollapsed || isMobileOpen) && (
                      <div className="flex-1 text-left flex items-center justify-between min-w-0">
                        <span className="truncate">{sec.label}</span>
                        {sec.id === 'Summary' && typeof currentMetric?.postCapaScorePct === 'number' && (
                          <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded shadow-2xs">
                            {currentMetric.postCapaScorePct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 19 Audit Checklist Elements */}
          <div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Audit Elements
                </span>
                <span className="text-[9px] text-slate-500">19 Checklists</span>
              </div>
            )}

            <div className="space-y-1">
              {filteredChecklists.map((sheet, index) => {
                const isActive = activeSheet === sheet;
                const scoreData = getSheetScore ? getSheetScore(sheet) : null;
                const icon = getElementIcon(sheet);

                return (
                  <button
                    key={sheet}
                    onClick={() => handleItemClick(sheet)}
                    title={isCollapsed && !isMobileOpen ? `${index + 1}. ${sheet}` : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? `${theme.activeTabBg} text-white font-bold shadow-sm`
                        : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center px-1' : ''}`}
                  >
                    <div className="shrink-0 p-1 rounded-md bg-white/5">{icon}</div>

                    {(!isCollapsed || isMobileOpen) && (
                      <div className="flex-1 text-left flex items-center justify-between min-w-0">
                        <div className="truncate">
                          <span className="text-[10px] font-mono opacity-50 mr-1.5">{index + 1}.</span>
                          <span>{sheet}</span>
                        </div>
                        {scoreData && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ml-1 shrink-0 ${
                              scoreData.pct < 50
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : scoreData.pct < 75
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {scoreData.pct.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Active Focus Unit Indicator */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 border-t border-white/10 bg-black/30 shrink-0 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider">Active Focus</span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Post-CAPA</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-semibold text-white truncate max-w-[150px]">
                {unitMetrics[selectedUnitId]?.unitName || selectedUnitId}
              </span>
              <span className="font-mono font-bold text-indigo-300">
                {typeof currentMetric?.postCapaScorePct === 'number'
                  ? `${currentMetric.postCapaScorePct.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
