/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Mic,
  Sparkles,
  ArrowRight,
  Kanban,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Volume2,
  Play,
  Zap,
  Layers,
  ChevronRight,
  FolderGit2
} from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { Project } from '../types';

interface LandingPageProps {
  onEnterWorkspace: (targetTab?: NavigationTab) => void;
  activeProject: Project | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterWorkspace,
  activeProject
}) => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Landing Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-violet-100/70 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <div className="flex items-center gap-[2.5px] h-4">
                <span className="w-[2.5px] h-2 bg-white rounded-full animate-wave-1" />
                <span className="w-[2.5px] h-4 bg-white rounded-full animate-wave-2" />
                <span className="w-[2.5px] h-1.5 bg-white rounded-full animate-wave-3" />
                <span className="w-[2.5px] h-3 bg-white rounded-full animate-wave-4" />
                <span className="w-[2.5px] h-2 bg-white rounded-full animate-wave-5" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-stone-900 text-base tracking-tight block">ShipSpeak AI</span>
              <span className="text-[10px] font-bold text-violet-700 tracking-wider uppercase block">Speak. Build. Ship.</span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <a href="#features" className="hover:text-violet-700 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-violet-700 transition-colors">How It Works</a>
            <a href="#voice-workflow" className="hover:text-violet-700 transition-colors">Voice Workflow</a>
            <a href="#privacy" className="hover:text-violet-700 transition-colors">Privacy</a>
          </nav>

          {/* Right Action: Enter Workspace */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEnterWorkspace('overview')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/25 hover:-translate-y-0.5 transition-all cursor-pointer ring-1 ring-white/20"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-200/40 via-purple-100/30 to-orange-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-violet-200/80 text-xs font-bold text-violet-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Voice-to-Ship Workspace for Hackathon Builders</span>
          </div>

          {/* Big Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
            Speak your ideas. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Ship on time. Every time.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Turn lengthy competition briefs and voice notes into actionable sprint roadmaps, verified submission checklists, and timed 2-minute demo scripts — zero repetitive planning.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => onEnterWorkspace('overview')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-500/25 hover:-translate-y-0.5 transition-all cursor-pointer ring-1 ring-white/20"
            >
              <span>Launch Workspace (Free & Local)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onEnterWorkspace('analyzer')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-2xl text-sm font-semibold shadow-2xs hover:border-violet-300 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-violet-600" />
              <span>Analyze a Hackathon Brief</span>
            </button>
          </div>

          {/* Key Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-stone-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Local Browser Storage</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-violet-600" />
              <span>Voice Dictation Ready</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Zero Hallucinations</span>
            </span>
          </div>

          {/* Hero Interactive App Mockup Preview */}
          <div className="mt-12 p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-white/90 to-white/60 border border-violet-100 shadow-xl max-w-4xl mx-auto backdrop-blur-md text-left">
            {/* Mock Window Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 px-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-stone-500">shipspeak-workspace / {activeProject?.title || 'No Hands Challenge'}</span>
              </div>
              <button
                type="button"
                onClick={() => onEnterWorkspace('overview')}
                className="text-xs font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1"
              >
                <span>Open Interactive Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mock Workspace Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mini Card 1: Brief Extraction */}
              <div
                onClick={() => onEnterWorkspace('analyzer')}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-violet-100 hover:border-violet-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Step 1 · Analyzer</span>
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-violet-900">Extracted Requirements</h4>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  Explicit deadline (Nov 15), 4 weighted judging criteria, and mandatory demo video.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Against Source Text</span>
                </div>
              </div>

              {/* Mini Card 2: Task Kanban */}
              <div
                onClick={() => onEnterWorkspace('tasks')}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-violet-100 hover:border-violet-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Step 2 · Sprint Board</span>
                  <Kanban className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-violet-900">Actionable Kanban Tasks</h4>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  Deploy live web URL, publish GitHub repository, record 2-minute demo video.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-violet-700 font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>Tasks Mapped to Deliverables</span>
                </div>
              </div>

              {/* Mini Card 3: Demo Script & Teleprompter */}
              <div
                onClick={() => onEnterWorkspace('demo')}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-violet-100 hover:border-violet-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Step 3 · Demo Studio</span>
                  <Play className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-violet-900">120s Rehearsal Teleprompter</h4>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  Timed pitch script with director cues, speaking pace meter, and audio readback.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-purple-700 font-semibold">
                  <Volume2 className="w-3 h-3" />
                  <span>Rehearse Before Recording</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-8 border-t border-violet-100/60 bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Everything you need to ship</span>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Built for Hackathons & Fast Sprints</h2>
            <p className="text-xs text-stone-500">Stop wasting critical shipping hours manually formatting backlogs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/80 hover:border-violet-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Brief-to-Build Analyzer</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Extracts explicit deadlines, judging criteria, and mandatory deliverables from raw text or voice dictation with zero guessing.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/80 hover:border-violet-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Smart Task Planner</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Kanban and List sprint boards automatically populated from extracted requirements. Filter by priority and search instantly.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/80 hover:border-violet-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Submission Gate Audit</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tracks public URL, repo link, README, and video verification. Generate one-click Markdown summaries for Devpost.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/80 hover:border-violet-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Demo Studio & Prompter</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                60s, 90s, and 120s script generator with conversational word count metering, teleprompter countdown, and speech readback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 bg-[#FAF8F5] border-t border-violet-100/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">How it works</span>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">From Hackathon PDF to Shipped Demo in 3 Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-2xl font-black text-violet-600">01</span>
              <h4 className="text-base font-bold text-stone-900">Paste or Speak the Brief</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Copy the competition description or speak your idea hands-free. ShipSpeak audits explicit rules, deadlines, and criteria.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-2xl font-black text-violet-600">02</span>
              <h4 className="text-base font-bold text-stone-900">Execute Sprint Tasks</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tasks are automatically mapped to mandatory deliverables. Move items across To Do, In Progress, and Done.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-2xl font-black text-violet-600">03</span>
              <h4 className="text-base font-bold text-stone-900">Rehearse Pitch & Submit</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Verify all submission gates, practice your 2-minute demo with the teleprompter, and copy your final submission summary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Voice-First Workflow & Privacy Section */}
      <section id="voice-workflow" className="py-16 px-4 sm:px-8 bg-white border-t border-violet-100/60">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-violet-50/80 via-purple-50/50 to-orange-50/30 border border-violet-100 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-violet-500/20">
            <Volume2 className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl font-bold text-stone-900">Hands-Free Developer Productivity</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Use voice dictation (Wispr Flow or in-browser speech recognition) to speak task titles, update descriptions, and dictate script revisions without leaving your code editor.
            </p>
          </div>

          <div id="privacy" className="pt-4 border-t border-violet-200/60 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-600">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Local-First Persistence</span>
            </span>
            <span>·</span>
            <span>Zero Third-Party Tracking</span>
            <span>·</span>
            <span>Export & Import JSON Anytime</span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onEnterWorkspace('overview')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-violet-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Enter Workspace Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
