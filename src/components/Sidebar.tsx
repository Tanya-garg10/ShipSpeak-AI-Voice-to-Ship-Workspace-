/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project } from '../types';
import {
  LayoutDashboard,
  FileSearch,
  Kanban,
  CheckSquare,
  Mic2,
  FolderGit2,
  Settings,
  Calendar,
  Sparkles,
  X,
  Volume2,
  ArrowUpRight,
  Globe
} from 'lucide-react';

export type NavigationTab =
  | 'landing'
  | 'overview'
  | 'analyzer'
  | 'tasks'
  | 'checklist'
  | 'demo'
  | 'projects'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeProject: Project | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeProject,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Home',
      icon: LayoutDashboard,
      description: 'Dashboard & sprint metrics'
    },
    {
      id: 'projects' as NavigationTab,
      label: 'My Projects',
      icon: FolderGit2,
      description: 'Manage competition boards'
    },
    {
      id: 'analyzer' as NavigationTab,
      label: 'Brief Analyzer',
      icon: FileSearch,
      description: 'Voice & text requirement parser'
    },
    {
      id: 'tasks' as NavigationTab,
      label: 'Task Board',
      icon: Kanban,
      description: 'Sprint Kanban & List views'
    },
    {
      id: 'checklist' as NavigationTab,
      label: 'Submission Checklist',
      icon: CheckSquare,
      description: 'Verified deliverables audit'
    },
    {
      id: 'demo' as NavigationTab,
      label: 'Demo Studio',
      icon: Mic2,
      description: '60/90/120s script & teleprompter'
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
      description: 'Storage & JSON backups'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#FAF8F5]/95 backdrop-blur-xl border-r border-violet-100/80 p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-10 shadow-sm ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                onSelectTab('landing');
                onCloseMobile();
              }}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
              title="Return to Home / Landing Page"
            >
              {/* Custom Waveform Logo */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 ring-1 ring-white/40 relative overflow-hidden group-hover:scale-105 transition-transform">
                <div className="flex items-center gap-[3px] h-5">
                  <span className="w-[3px] h-3 bg-white/90 rounded-full animate-wave-1" />
                  <span className="w-[3px] h-5 bg-white rounded-full animate-wave-2" />
                  <span className="w-[3px] h-2 bg-white/80 rounded-full animate-wave-3" />
                  <span className="w-[3px] h-4 bg-white rounded-full animate-wave-4" />
                  <span className="w-[3px] h-3 bg-white/90 rounded-full animate-wave-5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900 text-base tracking-tight group-hover:text-violet-700 transition-colors">ShipSpeak AI</span>
                </div>
                <p className="text-[11px] font-semibold text-violet-700 tracking-wide">
                  Speak. Build. Ship.
                </p>
              </div>
            </button>

            {/* Close Button on Mobile */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick return to Landing Page */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('landing');
              onCloseMobile();
            }}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-violet-50/60 hover:bg-violet-100/60 border border-violet-100/80 text-[11px] font-bold text-violet-700 transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-violet-600 group-hover:rotate-12 transition-transform" />
              <span>Back to Landing Page</span>
            </span>
            <span className="text-[10px] text-violet-500 font-semibold group-hover:translate-x-0.5 transition-transform">Exit Workspace &rarr;</span>
          </button>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all text-left group ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-100/90 via-violet-50/90 to-purple-50/80 text-violet-950 font-semibold shadow-xs ring-1 ring-violet-200/60'
                      : 'text-stone-600 hover:bg-stone-200/40 hover:text-stone-900'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-xs shadow-violet-400/30'
                        : 'bg-white/80 text-stone-500 group-hover:text-violet-700 group-hover:bg-white shadow-2xs'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-stone-900 leading-tight font-medium truncate">{item.label}</span>
                    <span className="text-[10px] text-stone-600 font-normal truncate max-w-[160px]">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Active Project & Powered by Wispr Flow */}
        <div className="space-y-3 pt-4 border-t border-violet-100/70">
          {activeProject ? (
            <div className="p-3.5 rounded-2xl bg-white/90 border border-violet-100/80 shadow-xs">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-stone-500 uppercase tracking-wider text-[9px]">Active Project</span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ready
                </span>
              </div>
              <p className="text-xs font-bold text-stone-900 truncate mb-1">
                {activeProject.title}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <Calendar className="w-3 h-3 text-violet-500 shrink-0" />
                <span className="truncate">
                  {activeProject.deadline !== 'Not specified in brief'
                    ? activeProject.deadline
                    : 'No deadline set'}
                </span>
              </div>
            </div>
          ) : null}

          {/* Clean Voice Productivity Section */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-50/80 via-purple-50/40 to-indigo-50/40 border border-violet-100/70 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Volume2 className="w-3 h-3" />
              </div>
              <span className="font-bold text-violet-950 text-xs tracking-tight">Voice-First Superpower</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Dictate briefs, sprint tasks, and demo scripts without breaking your coding flow.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
