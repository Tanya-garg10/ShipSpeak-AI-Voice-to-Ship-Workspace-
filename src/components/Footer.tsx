/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavigationTab } from './Sidebar';
import { ShieldCheck, ArrowUpRight, Volume2, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#FAF8F5] border-t border-violet-100/80 mt-12 py-10 px-4 lg:px-8 text-xs text-stone-600 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-stone-200/60">
        {/* Brand & Mission */}
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-violet-500/20">
              <div className="flex items-center gap-[2.5px] h-3.5">
                <span className="w-[2.5px] h-2 bg-white rounded-full animate-wave-1" />
                <span className="w-[2.5px] h-3.5 bg-white rounded-full animate-wave-2" />
                <span className="w-[2.5px] h-1.5 bg-white rounded-full animate-wave-3" />
                <span className="w-[2.5px] h-3 bg-white rounded-full animate-wave-4" />
              </div>
            </div>
            <span className="font-bold text-stone-900 text-sm tracking-tight">ShipSpeak AI</span>
          </div>
          <p className="font-semibold text-violet-700 text-xs">Speak. Build. Ship.</p>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Turn your ideas into shipped projects, faster. Voice-to-ship workspace for hackathon builders, engineers, and creators.
          </p>
        </div>

        {/* Quick Navigation Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 text-xs">
          <div>
            <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px] block mb-2.5">Workspace</span>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="hover:text-violet-700 transition-colors font-medium text-stone-700"
                >
                  Landing Page
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('overview')}
                  className="hover:text-violet-700 transition-colors"
                >
                  Workspace Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('analyzer')}
                  className="hover:text-violet-700 transition-colors"
                >
                  Brief Analyzer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('tasks')}
                  className="hover:text-violet-700 transition-colors"
                >
                  Task Board
                </button>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px] block mb-2.5">Delivery</span>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('checklist')}
                  className="hover:text-violet-700 transition-colors"
                >
                  Submission Checklist
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('demo')}
                  className="hover:text-violet-700 transition-colors"
                >
                  Demo Studio & Pitch
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('projects')}
                  className="hover:text-violet-700 transition-colors"
                >
                  My Projects
                </button>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px] block mb-2.5">System</span>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('settings')}
                  className="hover:text-violet-700 transition-colors"
                >
                  Data & Backup
                </button>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Local-First
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
        <p>© 2026 ShipSpeak AI. Built for builders who ship.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-stone-600">
            <Volume2 className="w-3.5 h-3.5 text-violet-600" />
            <span>Voice-first productivity engine</span>
          </span>
          <span>·</span>
          <span>Zero-hallucination planning</span>
        </div>
      </div>
    </footer>
  );
};
