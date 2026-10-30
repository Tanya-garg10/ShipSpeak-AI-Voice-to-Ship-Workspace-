/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Project, DemoScript } from '../types';
import { generateDemoScriptForDuration, generateElevatorPitch } from '../utils/demoScriptGenerator';
import {
  Mic2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Save,
  Volume2,
  VolumeX,
  Sparkles,
  Edit3,
  FileText,
  X,
  Volume
} from 'lucide-react';

interface DemoStudioProps {
  activeProject: Project | null;
  onSaveDemoScript: (duration: 60 | 90 | 120, script: DemoScript) => void;
  onCreateNewProject: () => void;
}

export const DemoStudio: React.FC<DemoStudioProps> = ({
  activeProject,
  onSaveDemoScript,
  onCreateNewProject
}) => {
  const [selectedDuration, setSelectedDuration] = useState<60 | 90 | 120>(120);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [elevatorPitch, setElevatorPitch] = useState('');

  // Editable script text
  const currentScriptObj = activeProject?.demoScripts?.[selectedDuration] ||
    (activeProject ? generateDemoScriptForDuration(activeProject, selectedDuration) : null);

  const [scriptText, setScriptText] = useState(currentScriptObj?.fullScript || '');

  // Teleprompter / Rehearsal State
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [fontSize, setFontSize] = useState<number>(20);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const teleprompterScrollRef = useRef<HTMLDivElement>(null);

  // Sync state when project or duration changes
  useEffect(() => {
    if (activeProject) {
      const s = activeProject.demoScripts?.[selectedDuration] || generateDemoScriptForDuration(activeProject, selectedDuration);
      setScriptText(s.fullScript);
      setIsTimerRunning(false);
      setTimerSeconds(0);
    }
  }, [selectedDuration, activeProject]);

  // Rehearsal timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handle SpeechSynthesis (Read Aloud)
  const toggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scriptText.replace(/\[.*?\]/g, ''));
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeakingTTS(false);
      utterance.onerror = () => setIsSpeakingTTS(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingTTS(true);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!activeProject) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-10 shadow-xs">
          <Mic2 className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-stone-900 mb-1">No Active Project Selected</h2>
          <p className="text-xs text-stone-500 mb-5">Please create or select a project to generate demo scripts.</p>
          <button
            type="button"
            onClick={onCreateNewProject}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/20"
          >
            Create Project
          </button>
        </div>
      </div>
    );
  }

  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  // Conversational pacing ~140 words per minute
  const estimatedSeconds = Math.round((wordCount / 140) * 60);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleSaveScript = () => {
    if (!currentScriptObj) return;
    const updated: DemoScript = {
      ...currentScriptObj,
      duration: selectedDuration,
      fullScript: scriptText,
      wordCount,
      updatedAt: new Date().toISOString()
    };
    onSaveDemoScript(selectedDuration, updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleRegenerate = () => {
    const freshlyGenerated = generateDemoScriptForDuration(activeProject, selectedDuration);
    setScriptText(freshlyGenerated.fullScript);
    onSaveDemoScript(selectedDuration, freshlyGenerated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleGenerateElevatorPitch = () => {
    const pitch = generateElevatorPitch(activeProject);
    setElevatorPitch(pitch);
    setShowPitchModal(true);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="py-6 px-4 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-violet-100/70">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>Demo Studio</span>
            <span>·</span>
            <span className="font-semibold text-stone-900">{activeProject.title}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Demo Script & Rehearsal Studio</h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleGenerateElevatorPitch}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>280-Char Pitch</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTeleprompterOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl shadow-md shadow-violet-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch Rehearsal Teleprompter</span>
          </button>
        </div>
      </div>

      {/* Duration Selectors & Pacing Information */}
      <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">Select Target Video Duration</h3>
            <p className="text-xs text-stone-500">
              Paced for conversational speech (~130–150 words/min). Grounded strictly in your verified project record.
            </p>
          </div>

          {/* Duration Tabs */}
          <div className="inline-flex p-1 bg-stone-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedDuration(60)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDuration === 60
                  ? 'bg-white text-violet-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              60 Seconds (Lightning)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDuration(90)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDuration === 90
                  ? 'bg-white text-violet-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              90 Seconds (Standard)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDuration(120)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDuration === 120
                  ? 'bg-white text-violet-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              120 Seconds (Full Demo)
            </button>
          </div>
        </div>

        {/* Word Count and Pacing Meter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="p-3.5 bg-stone-50/70 rounded-2xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5 font-medium">Word Count</span>
            <span className="text-lg font-black text-stone-900">{wordCount} words</span>
          </div>

          <div className="p-3.5 bg-stone-50/70 rounded-2xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5 font-medium">Estimated Speaking Time</span>
            <span className={`text-lg font-black ${estimatedSeconds > selectedDuration ? 'text-rose-600' : 'text-emerald-700'}`}>
              ~{estimatedSeconds}s / {selectedDuration}s target
            </span>
          </div>

          <div className="p-3.5 bg-stone-50/70 rounded-2xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5 font-medium">Speaking Pace</span>
            <span className="text-lg font-black text-stone-900">
              {estimatedSeconds > selectedDuration + 10 ? 'Trim ~15 words' : 'Ideal conversational pace'}
            </span>
          </div>
        </div>
      </div>

      {/* Script Sections & Live Editor */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-stone-900">
              {selectedDuration}-Second Pitch Script
            </span>
            {savedNotice && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={toggleTTS}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isSpeakingTTS
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="Audibly rehearse with browser SpeechSynthesis"
            >
              {isSpeakingTTS ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-violet-600" />}
              <span>{isSpeakingTTS ? 'Stop Audio' : 'Listen Readback'}</span>
            </button>

            <button
              type="button"
              onClick={handleRegenerate}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
            >
              Regenerate
            </button>

            <button
              type="button"
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveScript}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Script Editor Text Area */}
        <textarea
          rows={14}
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          className="w-full text-xs font-mono p-4 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 leading-relaxed bg-[#FAF9F5]/40 text-stone-800 resize-y"
          placeholder="Script content with section headers and timestamps..."
        />

        {/* Pacing Breakdown Overview Cards */}
        {currentScriptObj?.sections && (
          <div className="pt-3 space-y-3">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Script Structure & Director Walkthrough Cues
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentScriptObj.sections.map((sec) => (
                <div key={sec.id} className="p-4 bg-stone-50/70 border border-stone-200/70 rounded-2xl text-xs space-y-1.5 card-lift">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span className="truncate">{sec.title}</span>
                    <span className="text-[11px] text-violet-700 shrink-0 font-semibold">~{sec.speakingTimeSeconds}s</span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">{sec.content}</p>
                  <p className="text-[10px] text-stone-400 italic pt-1.5 border-t border-stone-200/60">
                    Cue: {sec.tips}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rehearsal Teleprompter Modal */}
      {isTeleprompterOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/95 text-white p-6 sm:p-10 flex flex-col justify-between backdrop-blur-xl">
          {/* Teleprompter Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Teleprompter Rehearsal</h2>
              <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                <span>Target: {selectedDuration}s</span>
                <span>·</span>
                <span className={timerSeconds > selectedDuration ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  Elapsed: {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isTimerRunning ? 'bg-amber-400 hover:bg-amber-500 text-stone-950' : 'bg-emerald-400 hover:bg-emerald-500 text-stone-950'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'Pause Timer' : 'Start Timer'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="p-2.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Font size control */}
              <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-stone-900 px-3 py-2 rounded-xl border border-stone-800">
                <span>Size:</span>
                <button
                  type="button"
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="px-1.5 hover:text-white font-bold"
                >
                  -
                </button>
                <span>{fontSize}px</span>
                <button
                  type="button"
                  onClick={() => setFontSize(Math.min(40, fontSize + 2))}
                  className="px-1.5 hover:text-white font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsTeleprompterOpen(false)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-2xl text-xs font-bold cursor-pointer"
              >
                Close Teleprompter
              </button>
            </div>
          </div>

          {/* Scrolling Script Text View */}
          <div
            ref={teleprompterScrollRef}
            className="flex-1 my-6 overflow-y-auto px-4 max-w-4xl mx-auto w-full space-y-6"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.65' }}
          >
            {scriptText.split('\n\n').map((para, i) => (
              <p
                key={i}
                className={para.startsWith('[') ? 'text-violet-400 font-bold text-sm tracking-wide' : 'text-stone-200 font-medium'}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Bottom Teleprompter Bar */}
          <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-800">
            <span>Tip: Speak with steady pacing. Rehearse with your screen recording tool open.</span>
            <span>Word count: {wordCount}</span>
          </div>
        </div>
      )}

      {/* 280-char Elevator Pitch Modal */}
      {showPitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Elevator Pitch (Under 280 Chars)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPitchModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Short summary for Twitter/X announcements, Devpost tagline, or competition forms.
            </p>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-900 font-mono leading-relaxed">
              {elevatorPitch}
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>{elevatorPitch.length} / 280 characters</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(elevatorPitch);
                  setCopiedPitch(true);
                  setTimeout(() => setCopiedPitch(false), 3000);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
              >
                {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPitch ? 'Copied!' : 'Copy Pitch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
