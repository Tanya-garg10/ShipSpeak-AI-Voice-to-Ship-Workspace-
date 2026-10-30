/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project, Task } from '../types';
import {
  FolderGit2,
  ListTodo,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  Plus,
  Play,
  ClipboardCheck,
  Clock,
  ExternalLink,
  Github,
  Mic,
  FileText,
  Volume2,
  Flame,
  Check,
  ArrowUpRight
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface OverviewDashboardProps {
  projects: Project[];
  activeProject: Project | null;
  onNavigate: (tab: NavigationTab) => void;
  onSelectProject: (id: string) => void;
  onCreateNewProject: () => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  projects,
  activeProject,
  onNavigate,
  onSelectProject,
  onCreateNewProject,
  onUpdateTaskStatus
}) => {
  // Aggregate real metrics
  const totalProjects = projects.length;
  const allTasks = projects.flatMap(p => p.tasks);
  const openTasks = allTasks.filter(t => t.status !== 'done').length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;

  // Active project metrics
  const activeTasks = activeProject?.tasks || [];
  const activeTotalTasks = activeTasks.length;
  const activeCompletedTasks = activeTasks.filter(t => t.status === 'done').length;
  const activeTaskProgress = activeTotalTasks > 0 ? Math.round((activeCompletedTasks / activeTotalTasks) * 100) : 0;

  const activeChecklist = activeProject?.checklist || [];
  const activeTotalChecklist = activeChecklist.length;
  const activeCompletedChecklist = activeChecklist.filter(c => c.isCompleted).length;
  const activeReadiness = activeTotalChecklist > 0 ? Math.round((activeCompletedChecklist / activeTotalChecklist) * 100) : 0;

  // Circular progress calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (activeReadiness / 100) * circumference;

  // Dynamic progress message based on real data
  const getProgressMessage = (pct: number) => {
    if (pct === 100) return 'All mandatory deliverables verified! Ready to ship and submit.';
    if (pct >= 75) return 'Final review underway — almost ready for submission.';
    if (pct >= 50) return 'Halfway there! Core features and documentation verified.';
    if (pct >= 25) return 'Sprint gaining momentum — continuing deliverable checks.';
    return 'Sprint initialized — begin testing features and verifying deliverables.';
  };

  // Next upcoming tasks / milestones
  const pendingTasks = activeTasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5);

  if (projects.length === 0) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto">
        <div className="text-center bg-white border border-violet-100 rounded-3xl p-8 sm:p-14 shadow-sm relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl -z-10" />

          {/* Tasteful microphone & waveform icon */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/25 ring-4 ring-violet-50">
            <Mic className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Welcome to ShipSpeak AI</h2>
          <p className="text-sm font-semibold text-violet-700 mb-3">Speak. Build. Ship.</p>
          <p className="text-xs text-stone-600 max-w-md mx-auto mb-8 leading-relaxed">
            Turn lengthy hackathon briefs and voice memos into structured sprint tasks, submission checklists, and timed demo scripts — without repetitive planning.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('analyzer')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/25 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Analyze a Competition Brief
            </button>
            <button
              type="button"
              onClick={onCreateNewProject}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-2xl text-xs font-bold shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Blank Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* DASHBOARD HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-100/70 via-purple-50/60 to-orange-50/50 border border-violet-100/80 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-violet-200/60 text-xs font-semibold text-violet-800 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>Voice-to-Ship Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Hey there, builder!
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Turn lengthy briefs into shippable projects — just by speaking.
            </p>
          </div>

          {/* Tasteful Microphone Illustration with Subtle Audio Waveforms */}
          <div className="flex items-center gap-4 bg-white/75 backdrop-blur-md p-4 rounded-3xl border border-white/80 shadow-sm shrink-0 self-start md:self-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 ring-4 ring-violet-50">
              <Mic className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 h-4">
                <span className="w-1 h-3 bg-violet-500 rounded-full animate-wave-1" />
                <span className="w-1 h-5 bg-violet-600 rounded-full animate-wave-2" />
                <span className="w-1 h-2 bg-purple-400 rounded-full animate-wave-3" />
                <span className="w-1 h-4 bg-indigo-500 rounded-full animate-wave-4" />
                <span className="w-1 h-3 bg-violet-500 rounded-full animate-wave-5" />
                <span className="w-1 h-5 bg-violet-600 rounded-full animate-wave-2" />
                <span className="w-1 h-2 bg-purple-400 rounded-full animate-wave-3" />
              </div>
              <span className="text-[11px] font-bold text-stone-800 block">Voice Dictation Ready</span>
              <span className="text-[10px] text-stone-500 block">Hands-free speech input</span>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-white border border-stone-200/70 rounded-3xl p-5 shadow-xs card-lift">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-stone-500 font-medium">Total Projects</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-2xs">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 tracking-tight">{totalProjects}</div>
          <p className="text-[11px] text-stone-500 mt-1 truncate">
            {activeProject ? `Active: ${activeProject.title}` : 'None active'}
          </p>
        </div>

        {/* Open Tasks */}
        <div className="bg-white border border-stone-200/70 rounded-3xl p-5 shadow-xs card-lift">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-stone-500 font-medium">Open Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 tracking-tight">{openTasks}</div>
          <p className="text-[11px] text-stone-500 mt-1">
            Across all competition boards
          </p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white border border-stone-200/70 rounded-3xl p-5 shadow-xs card-lift">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-stone-500 font-medium">Completed Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 tracking-tight">{completedTasks}</div>
          <p className="text-[11px] text-stone-500 mt-1">
            Verified sprint actions shipped
          </p>
        </div>

        {/* Upcoming Deadline */}
        <div className="bg-white border border-stone-200/70 rounded-3xl p-5 shadow-xs card-lift">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-stone-500 font-medium">Next Deadline</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-stone-900 truncate">
            {activeProject?.deadline !== 'Not specified in brief'
              ? activeProject?.deadline
              : 'None scheduled'}
          </div>
          <p className="text-[11px] text-stone-500 mt-1 truncate">
            {activeProject?.competitionName || 'No competition assigned'}
          </p>
        </div>
      </div>

      {/* MIDDLE SECTION: MAIN FEATURE CARD + PROGRESS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN FEATURE CARD: "Analyze a Hackathon Brief" (2 Spans) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white via-white to-violet-50/40 border border-violet-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-6 card-lift relative overflow-hidden">
          {/* Subtle ambient light */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100/30 rounded-full blur-2xl -z-10" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Core Engine</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                Analyze a Hackathon Brief
              </h2>
              <p className="text-xs text-stone-600 max-w-md leading-relaxed">
                Paste any dense competition PDF, webpage rules, or voice memo. ShipSpeak parses explicit deadlines, judging rubrics, and deliverables with zero hallucination.
              </p>
            </div>

            {/* Elegant Illustration: Document + Mic + Waveform */}
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-tr from-violet-50 to-purple-100/60 border border-violet-200/50 flex items-center justify-center shadow-inner shrink-0">
              <FileText className="w-10 h-10 text-violet-400 stroke-1" />
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/30">
                <Mic className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => onNavigate('analyzer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/20 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('analyzer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-2xl text-xs font-semibold shadow-2xs hover:border-stone-300 transition-all cursor-pointer"
            >
              <span>View Sample Brief</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </div>

        {/* PROGRESS PANEL: Circular indicator calculated from actual submission checklist */}
        <div className="bg-white border border-stone-200/70 rounded-3xl p-6 shadow-xs flex flex-col justify-between card-lift">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold text-stone-800">Submission Readiness</span>
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-stone-500">
              Calculated from verified competition checklist
            </p>
          </div>

          {/* Circular Progress Gauge */}
          <div className="my-4 flex items-center justify-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-stone-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Animated progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-violet-600 transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-stone-900">{activeReadiness}%</span>
                <span className="text-[10px] text-stone-500 font-medium">Ready</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeCompletedChecklist} of {activeTotalChecklist}</span>
              </div>
              <p className="text-[11px] text-stone-500">Items verified</p>
            </div>
          </div>

          {/* Dynamic real-time status message */}
          <div className="p-3 bg-violet-50/60 rounded-2xl border border-violet-100/70 text-[11px] text-stone-700 leading-snug">
            {getProgressMessage(activeReadiness)}
          </div>
        </div>
      </div>

      {/* LOWER DASHBOARD: Recent Projects, Upcoming Milestones, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Spans: Upcoming Milestones & Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Milestones */}
          <div className="bg-white border border-stone-200/70 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">Upcoming Sprint Milestones</h3>
                <p className="text-xs text-stone-500">Prioritized actionable tasks for {activeProject?.title}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="text-xs font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1"
              >
                Task Board <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 bg-stone-50/60 rounded-2xl border border-dashed border-stone-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-stone-800">All prioritized tasks are marked done!</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Your project deliverables are ready for submission audit.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl border border-stone-200/70 hover:border-violet-200 bg-white hover:bg-violet-50/20 transition-all flex items-start justify-between gap-3 shadow-2xs group"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onUpdateTaskStatus(task.id, 'done')}
                        className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors"
                        title="Mark complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <p className="text-xs font-bold text-stone-900 group-hover:text-violet-950 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{task.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                          <span className={
                            task.priority === 'high'
                              ? 'text-rose-600 font-bold'
                              : task.priority === 'medium'
                              ? 'text-amber-600 font-bold'
                              : 'text-stone-500'
                          }>
                            {task.priority.toUpperCase()} PRIORITY
                          </span>
                          {task.relatedRequirement && (
                            <>
                              <span className="text-stone-300">·</span>
                              <span className="text-stone-600">{task.relatedRequirement}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUpdateTaskStatus(task.id, task.status === 'in-progress' ? 'todo' : 'in-progress')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-xl transition-colors ${
                        task.status === 'in-progress'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {task.status === 'in-progress' ? 'In Progress' : 'Start'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Projects Cards */}
          <div className="bg-white border border-stone-200/70 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">Recent Projects</h3>
                <p className="text-xs text-stone-500">Quickly switch between hackathon workspaces</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('projects')}
                className="text-xs font-bold text-violet-700 hover:text-violet-800"
              >
                Manage All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.slice(0, 4).map(p => {
                const isCurrent = p.id === activeProject?.id;
                const pDone = p.tasks.filter(t => t.status === 'done').length;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectProject(p.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                      isCurrent
                        ? 'border-violet-300 bg-violet-50/40 shadow-xs ring-1 ring-violet-200'
                        : 'border-stone-200/70 hover:border-stone-300 bg-white hover:bg-stone-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-violet-700 font-semibold truncate max-w-[140px]">{p.competitionName}</span>
                        {isCurrent && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 truncate">{p.title}</h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                      <span>{pDone}/{p.tasks.length} tasks</span>
                      <span className="truncate max-w-[110px]">{p.deadline !== 'Not specified in brief' ? p.deadline : 'No deadline'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Span: Quick Actions & Pitch Preview */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white border border-stone-200/70 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-stone-900">Quick Actions</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-violet-50/60 border border-stone-200/60 hover:border-violet-200 text-xs font-semibold text-stone-800 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                    <ListTodo className="w-4 h-4" />
                  </div>
                  <span>Open Task Kanban</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-violet-700 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('demo')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-violet-50/60 border border-stone-200/60 hover:border-violet-200 text-xs font-semibold text-stone-800 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Play className="w-4 h-4" />
                  </div>
                  <span>Rehearsal Teleprompter</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-violet-700 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('checklist')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-violet-50/60 border border-stone-200/60 hover:border-violet-200 text-xs font-semibold text-stone-800 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <span>Submission Gate Audit</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-violet-700 transition-colors" />
              </button>
            </div>
          </div>

          {/* Submission Gate Summary Card */}
          {activeProject && (
            <div className="bg-white border border-stone-200/70 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">Submission Checklist</span>
                <span className="text-xs font-semibold text-emerald-700">{activeReadiness}% Verified</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ensure all required competition items are checked before submitting to {activeProject.competitionName}.
              </p>

              <div className="space-y-1.5 text-xs pt-1">
                {activeProject.checklist?.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-stone-700">
                    <span className={c.isCompleted ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                      {c.isCompleted ? '✓' : '○'}
                    </span>
                    <span className={`truncate text-xs ${c.isCompleted ? 'line-through text-stone-400' : ''}`}>
                      {c.title}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('checklist')}
                className="w-full mt-3 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-colors cursor-pointer"
              >
                Review Full Checklist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
