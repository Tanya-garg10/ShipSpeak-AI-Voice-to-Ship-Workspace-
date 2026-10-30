/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { StorageDataV1 } from '../types';
import {
  exportProjectDataJSON,
  validateAndImportProjectData,
  clearAllStorageData
} from '../utils/storage';
import {
  Settings,
  Database,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  Mic,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Zap,
  Key
} from 'lucide-react';

interface SettingsViewProps {
  storageData: StorageDataV1;
  onDataReload: (newData: StorageDataV1) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  storageData,
  onDataReload
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [wisprFlowApiKey, setWisprFlowApiKey] = useState(storageData.settings.wisprFlowApiKey || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectsCount = storageData.projects.length;
  const allTasksCount = storageData.projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
  const allChecklistCount = storageData.projects.reduce((acc, p) => acc + (p.checklist?.length || 0), 0);

  // Approximate storage size
  const storageJson = exportProjectDataJSON(storageData);
  const storageBytes = new Blob([storageJson]).size;
  const storageKb = (storageBytes / 1024).toFixed(1);

  const handleExport = () => {
    try {
      const blob = new Blob([storageJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shipspeak-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setFeedbackNotice({ type: 'success', message: 'Project backup successfully downloaded.' });
    } catch (err: any) {
      setFeedbackNotice({ type: 'error', message: err?.message || 'Export failed.' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = validateAndImportProjectData(content);
      if (res.success && res.data) {
        onDataReload(res.data);
        setFeedbackNotice({
          type: 'success',
          message: `Imported ${res.data.projects.length} project(s) successfully!`
        });
      } else {
        setFeedbackNotice({
          type: 'error',
          message: res.error || 'Failed to import backup JSON.'
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    const fresh = clearAllStorageData();
    onDataReload(fresh);
    setShowClearConfirm(false);
    setFeedbackNotice({
      type: 'success',
      message: 'All workspace data cleared from local browser storage.'
    });
  };

  const handleSaveWisprFlowKey = () => {
    const updatedData: StorageDataV1 = {
      ...storageData,
      settings: {
        ...storageData.settings,
        wisprFlowApiKey: wisprFlowApiKey.trim()
      }
    };
    onDataReload(updatedData);
    setFeedbackNotice({
      type: 'success',
      message: 'Wispr Flow API key saved successfully.'
    });
  };

  return (
    <div className="py-6 px-4 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="pb-2 border-b border-violet-100/70">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Settings & Workspace Storage</h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure local browser storage, export portable backups, and review voice integration tips.
        </p>
      </div>

      {/* Feedback banner */}
      {feedbackNotice && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border ${
          feedbackNotice.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedbackNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackNotice.message}</span>
        </div>
      )}

      {/* Storage Status Card */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4 card-lift">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Local Browser Persistence</h3>
            <p className="text-xs text-stone-500">HTML5 LocalStorage Engine (Version 1 Schema)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5 font-medium">Projects Stored</span>
            <span className="text-xl font-black text-stone-900">{projectsCount}</span>
          </div>
          <div className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5 font-medium">Total Tasks</span>
            <span className="text-xl font-black text-stone-900">{allTasksCount}</span>
          </div>
          <div className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5 font-medium">Checklist Items</span>
            <span className="text-xl font-black text-stone-900">{allChecklistCount}</span>
          </div>
          <div className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5 font-medium">Storage Footprint</span>
            <span className="text-xl font-black text-stone-900">{storageKb} KB</span>
          </div>
        </div>

        <div className="p-4 bg-violet-50/40 rounded-2xl border border-violet-100 text-xs text-stone-600 leading-relaxed">
          <span className="font-bold text-stone-800">Browser Storage Note: </span>
          All data remains locally in your current browser. It does not synchronize automatically across different devices or incognito windows. Create a JSON backup using the export tool below anytime.
        </div>
      </div>

      {/* Wispr Flow API Configuration */}
      <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-xs space-y-4 card-lift">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Wispr Flow API Configuration</h3>
            <p className="text-xs text-violet-700 font-medium">AI-Powered Voice Dictation</p>
          </div>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Add your Wispr Flow API key to enable high-accuracy AI voice dictation with auto-edits, filler word removal, and improved name recognition. Without this key, the app will fall back to browser's built-in speech recognition.
        </p>
        <div className="space-y-3">
          <div>
            <label className="font-bold text-stone-800 text-xs block mb-1.5">Wispr Flow API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={wisprFlowApiKey}
                onChange={(e) => setWisprFlowApiKey(e.target.value)}
                placeholder="Enter your Wispr Flow API key (get it from wisprflow.ai/account/api-keys)"
                className="flex-1 p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-900 text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleSaveWisprFlowKey}
                className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/25 transition-all cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
          <div className="p-3 bg-violet-50/50 rounded-2xl border border-violet-100 text-xs text-stone-600">
            <div className="flex items-start gap-2">
              <Key className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-800">Get your API key:</span>
                <a
                  href="https://wisprflow.ai/account/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-700 hover:text-violet-900 font-semibold ml-1"
                >
                  wisprflow.ai/account/api-keys
                </a>
                <p className="mt-1 text-stone-500">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Restore Card */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4 card-lift">
        <h3 className="text-base font-bold text-stone-900">Backup & Restore</h3>
        <p className="text-xs text-stone-500">Export your entire workspace into a portable JSON file or restore from a past backup.</p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-2xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-stone-500" />
            <span>Import Backup</span>
          </button>
        </div>
      </div>

      {/* Wispr Flow Integration Guide */}
      <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-xs space-y-3.5 card-lift">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Voice Dictation & Hands-Free Guide</h3>
            <p className="text-xs text-violet-700 font-medium">Whisper & Flow Speech Integration</p>
          </div>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          ShipSpeak AI pairs seamlessly with voice dictation:
        </p>
        <ul className="space-y-2 text-xs text-stone-600 list-disc list-inside">
          <li>
            <span className="font-bold text-stone-800">Desktop Voice Dictation:</span> With the Wispr Flow app active on macOS/Windows, click into any input field (Brief Input, Task Title, or Script editor) and speak naturally to dictate without typing.
          </li>
          <li>
            <span className="font-bold text-stone-800">In-Browser Voice Button:</span> Click the violet <span className="font-semibold text-violet-700">"Dictate"</span> button to activate browser speech recognition directly.
          </li>
          <li>
            <span className="font-bold text-stone-800">Hands-Free Script Rehearsal:</span> Use the Demo Studio's teleprompter and SpeechSynthesis readback to rehearse your 120-second demo pacing without looking down at notes.
          </li>
        </ul>
      </div>

      {/* Privacy Guarantee */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-2 card-lift">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Privacy & Zero-Telemetry Guarantee</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          ShipSpeak AI does not collect telemetry, track browsing behavior, or send competition ideas to third-party ad networks. All brief extractions, task roadmaps, and submission checklists remain private in your browser.
        </p>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 space-y-3">
        <h3 className="text-base font-bold text-rose-950">Danger Zone</h3>
        <p className="text-xs text-rose-700">
          Permanently clear all saved hackathons, sprint tasks, and demo scripts from this browser.
        </p>

        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All Workspace Data</span>
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900">Confirm Data Erasure</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to erase all projects and tasks from this browser? Ensure you have exported a JSON backup first.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Yes, Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
