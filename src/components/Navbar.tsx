/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../types';
import {
  ChevronDown,
  Plus,
  ExternalLink,
  Github,
  CheckCircle2,
  Bell,
  Menu,
  Sparkles,
  Trophy,
  User,
  Clock,
  Check,
  Globe
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface NavbarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (id: string) => void;
  onCreateNewProject: () => void;
  onToggleMobileSidebar: () => void;
  onNavigate?: (tab: NavigationTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateNewProject,
  onToggleMobileSidebar,
  onNavigate
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Compute stats for active project
  const totalTasks = activeProject?.tasks?.length || 0;
  const completedTasks = activeProject?.tasks?.filter(t => t.status === 'done').length || 0;
  const totalChecklist = activeProject?.checklist?.length || 0;
  const completedChecklist = activeProject?.checklist?.filter(c => c.isCompleted).length || 0;
  const readinessPct = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  // Notification items generated from real project state
  const notifications = [
    ...(activeProject?.deadline && activeProject.deadline !== 'Not specified in brief' ? [{
      id: 'notif_deadline',
      title: 'Upcoming Submission Deadline',
      desc: `${activeProject.competitionName}: ${activeProject.deadline}`,
      time: 'Priority',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50'
    }] : []),
    {
      id: 'notif_tasks',
      title: `${completedTasks} of ${totalTasks} Tasks Shipped`,
      desc: activeProject ? activeProject.title : 'No active workspace',
      time: `${readinessPct}% Ready`,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 'notif_wispr',
      title: 'Voice-to-Ship Engine Ready',
      desc: 'Use voice dictation for hands-free planning',
      time: 'Active',
      icon: Sparkles,
      color: 'text-violet-600 bg-violet-50'
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-violet-100/70 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Competition Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-200/50 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Competition / Project Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-violet-100 bg-white/90 hover:bg-white text-xs text-stone-800 shadow-xs hover:border-violet-300 transition-all max-w-[260px] sm:max-w-[340px]"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-violet-600 shrink-0 shadow-xs shadow-violet-400" />
              <div className="flex flex-col text-left truncate">
                <span className="text-[10px] text-stone-600 font-medium uppercase tracking-wider">Competition Workspace</span>
                <span className="font-bold text-stone-900 truncate">
                  {activeProject ? activeProject.title : 'Select a Project'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-600 ml-auto shrink-0" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-84 bg-white/95 backdrop-blur-xl border border-violet-100 rounded-2xl shadow-xl z-50 p-2 text-xs divide-y divide-stone-100">
                  <div className="px-3 py-2 text-[11px] font-semibold text-stone-600 uppercase tracking-wider flex justify-between items-center">
                    <span>Switch Competition ({projects.length})</span>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onCreateNewProject();
                      }}
                      className="text-violet-700 hover:text-violet-800 flex items-center gap-1 font-semibold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                    {projects.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectProject(p.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex flex-col gap-0.5 ${
                          p.id === activeProject?.id
                            ? 'bg-violet-50 text-violet-950 font-medium ring-1 ring-violet-200'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate">{p.title}</span>
                          {p.id === activeProject?.id && (
                            <Check className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-stone-600 truncate">{p.competitionName}</span>
                      </button>
                    ))}

                    {projects.length === 0 && (
                      <div className="px-3 py-4 text-center text-stone-600">
                        No projects created yet.
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onCreateNewProject();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl font-semibold transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Create New Project
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section: Landing Page Return, Prominent Electric Violet Create Project Button, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Landing Page Button */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-violet-700 hover:bg-violet-50/80 rounded-2xl border border-stone-200/60 transition-all cursor-pointer shadow-2xs"
              title="Return to Home / Landing Page"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500 hover:text-violet-600" />
              <span className="hidden md:inline">Landing Page</span>
            </button>
          )}

          {/* Prominent Electric Violet Create Project Button */}
          <button
            type="button"
            onClick={onCreateNewProject}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all cursor-pointer ring-1 ring-white/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Create Project</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Notifications Icon with popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setDropdownOpen(false);
                setProfileOpen(false);
              }}
              className="p-2.5 text-stone-600 hover:text-stone-900 bg-white/90 hover:bg-white border border-stone-200/70 rounded-2xl transition-all shadow-2xs relative"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600 ring-2 ring-white animate-pulse" />
            </button>

            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200/80 rounded-2xl shadow-xl z-50 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 px-1">
                    <span className="font-bold text-stone-900">Sprint Alerts</span>
                    <span className="text-[10px] text-stone-600 font-medium">Live Activity</span>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {notifications.map(n => {
                      const Icon = n.icon;
                      return (
                        <div key={n.id} className="p-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-start gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${n.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-stone-900 leading-snug">{n.title}</p>
                            <p className="text-[11px] text-stone-600 line-clamp-1">{n.desc}</p>
                            <span className="text-[9px] text-stone-600 mt-1 block">{n.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Avatar with popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setDropdownOpen(false);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-2xl bg-white/90 border border-stone-200/70 hover:border-violet-300 transition-all shadow-2xs group"
              aria-label="User profile menu"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-500 via-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                HB
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-600 mr-1 group-hover:text-stone-900" />
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200/80 rounded-2xl shadow-xl z-50 p-3 text-xs space-y-2">
                  <div className="pb-2 border-b border-stone-100">
                    <p className="font-bold text-stone-900">Hackathon Builder</p>
                    <p className="text-[11px] text-stone-600">Local-First Workspace</p>
                  </div>
                  <div className="text-[11px] text-stone-600 space-y-1 py-1">
                    <p className="flex items-center justify-between">
                      <span>Persistence:</span>
                      <span className="text-emerald-700 font-semibold">Active (LocalStorage)</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Workflow:</span>
                      <span className="text-violet-700 font-semibold">Voice-to-Ship Sprint</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
