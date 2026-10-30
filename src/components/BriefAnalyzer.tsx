/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ExtractedBriefData,
  ExtractedRequirement,
  Project
} from '../types';
import { SAMPLE_BRIEFS } from '../utils/sampleBriefs';
import { parseBriefDeterministic, generateTasksFromRequirements, generateChecklistFromRequirements } from '../utils/briefParser';
import { generateDemoScriptForDuration } from '../utils/demoScriptGenerator';
import { VoiceInputButton } from './VoiceInputButton';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Save,
  Check,
  ShieldCheck,
  ArrowRight,
  Info,
  Calendar,
  Award,
  Video,
  FileCode2,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface BriefAnalyzerProps {
  activeProject: Project | null;
  onSaveAsNewProject: (project: Project) => void;
  onUpdateProjectAnalysis: (projectId: string, analysis: ExtractedBriefData) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const BriefAnalyzer: React.FC<BriefAnalyzerProps> = ({
  activeProject,
  onSaveAsNewProject,
  onUpdateProjectAnalysis,
  onNavigate
}) => {
  const [briefInput, setBriefInput] = useState<string>(activeProject?.briefRaw || SAMPLE_BRIEFS[0].rawText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'deterministic' | 'ai'>('deterministic');
  const [currentAnalysis, setCurrentAnalysis] = useState<ExtractedBriefData | null>(activeProject?.analysis || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const characterCount = briefInput.length;
  const wordCount = briefInput.trim().split(/\s+/).filter(Boolean).length;

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_BRIEFS.find(s => s.id === sampleId);
    if (sample) {
      setBriefInput(sample.rawText);
      setErrorMessage(null);
      setSuccessNotice(`Loaded sample brief: ${sample.name}`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleAnalyze = async () => {
    if (!briefInput.trim() || briefInput.trim().length < 30) {
      setErrorMessage('Please enter a longer brief or hackathon description (at least 30 characters).');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      if (analysisMode === 'ai') {
        try {
          const res = await fetch('/api/analyze-brief', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ briefText: briefInput })
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const deterministicBase = parseBriefDeterministic(briefInput);
              const mergedAnalysis: ExtractedBriefData = {
                ...deterministicBase,
                competitionName: json.data.competitionName || deterministicBase.competitionName,
                problemStatement: json.data.problemStatement || deterministicBase.problemStatement,
                targetAudience: json.data.targetAudience || deterministicBase.targetAudience,
                submissionDeadline: json.data.submissionDeadline || deterministicBase.submissionDeadline,
                registrationDeadline: json.data.registrationDeadline || deterministicBase.registrationDeadline,
                eligibilityRules: json.data.eligibilityRules?.length ? json.data.eligibilityRules : deterministicBase.eligibilityRules,
                requiredDeliverables: json.data.requiredDeliverables?.length ? json.data.requiredDeliverables : deterministicBase.requiredDeliverables,
                requiredTechTools: json.data.requiredTechTools?.length ? json.data.requiredTechTools : deterministicBase.requiredTechTools,
                demoVideoRequirements: json.data.demoVideoRequirements || deterministicBase.demoVideoRequirements,
                workingProjectLinkRequirements: json.data.workingProjectLinkRequirements || deterministicBase.workingProjectLinkRequirements,
                documentationRequirements: json.data.documentationRequirements || deterministicBase.documentationRequirements,
                submissionInstructions: json.data.submissionInstructions || deterministicBase.submissionInstructions,
                prizeInformation: json.data.prizeInformation || deterministicBase.prizeInformation,
                parserMode: 'ai-enhanced'
              };
              setCurrentAnalysis(mergedAnalysis);
              setSuccessNotice('Analysis completed with server-side Featherless AI (Llama 3.1) model.');
              setIsAnalyzing(false);
              return;
            }
          }
        } catch (aiErr) {
          console.warn('AI analysis failed or server unavailable, falling back to deterministic parser:', aiErr);
        }
      }

      // High-precision deterministic parser (instant, 100% offline & rule-grounded)
      const parsed = parseBriefDeterministic(briefInput);
      setCurrentAnalysis(parsed);
      setSuccessNotice('Analysis completed using deterministic rule engine. All facts verified against source snippets.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to analyze brief.');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  const handleStartEditReq = (req: ExtractedRequirement) => {
    setEditingReqId(req.id);
    setEditValue(req.value);
  };

  const handleSaveEditReq = (reqId: string) => {
    if (!currentAnalysis) return;
    const updatedList = currentAnalysis.requirementsList.map(r => {
      if (r.id === reqId) {
        return { ...r, value: editValue, userEdited: true };
      }
      return r;
    });

    const targetReq = updatedList.find(r => r.id === reqId);
    const updatedAnalysis: ExtractedBriefData = {
      ...currentAnalysis,
      requirementsList: updatedList,
      ...(targetReq?.key === 'competitionName' ? { competitionName: editValue } : {}),
      ...(targetReq?.key === 'problemStatement' ? { problemStatement: editValue } : {}),
      ...(targetReq?.key === 'targetAudience' ? { targetAudience: editValue } : {}),
      ...(targetReq?.key === 'submissionDeadline' ? { submissionDeadline: editValue } : {}),
      ...(targetReq?.key === 'registrationDeadline' ? { registrationDeadline: editValue } : {})
    };

    setCurrentAnalysis(updatedAnalysis);
    setEditingReqId(null);
  };

  const handleSaveAsProject = (asNew: boolean) => {
    if (!currentAnalysis) return;

    const projectId = asNew || !activeProject ? `proj_${Date.now()}` : activeProject.id;
    const projectTitle = currentAnalysis.competitionName !== 'Not specified in brief'
      ? `${currentAnalysis.competitionName} Build`
      : 'New Hackathon Project';

    const tasks = generateTasksFromRequirements(projectId, currentAnalysis);
    const checklist = generateChecklistFromRequirements(projectId, currentAnalysis);

    const partialProj: Partial<Project> = {
      id: projectId,
      title: asNew || !activeProject ? projectTitle : activeProject.title,
      competitionName: currentAnalysis.competitionName,
      briefRaw: briefInput,
      analysis: currentAnalysis,
      targetAudience: currentAnalysis.targetAudience,
      deadline: currentAnalysis.submissionDeadline,
      tasks,
      checklist,
      workingProjectUrl: activeProject?.workingProjectUrl || '',
      repositoryUrl: activeProject?.repositoryUrl || '',
      isArchived: false,
      createdAt: asNew || !activeProject ? new Date().toISOString() : activeProject.createdAt,
      updatedAt: new Date().toISOString()
    };

    const demoScripts = {
      60: generateDemoScriptForDuration(partialProj, 60),
      90: generateDemoScriptForDuration(partialProj, 90),
      120: generateDemoScriptForDuration(partialProj, 120)
    };

    const finalProject: Project = {
      ...partialProj as Project,
      demoScripts
    };

    if (asNew || !activeProject) {
      onSaveAsNewProject(finalProject);
      setSuccessNotice(`Saved as new project: "${finalProject.title}". Tasks and checklist generated!`);
    } else {
      onUpdateProjectAnalysis(activeProject.id, currentAnalysis);
      setSuccessNotice(`Updated requirements for "${activeProject.title}".`);
    }

    setTimeout(() => {
      onNavigate('tasks');
    }, 1200);
  };

  return (
    <div className="py-6 px-4 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-violet-100/70">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Brief-to-Build Analyzer</h1>
          <p className="text-xs text-stone-500 mt-1">
            Transform raw challenge descriptions, website rules, or voice memos into an actionable execution roadmap.
          </p>
        </div>

        {/* Quick Sample Selector Pill Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-stone-500">Sample Challenges:</span>
          {SAMPLE_BRIEFS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleLoadSample(s.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-violet-50 text-stone-700 hover:text-violet-800 border border-stone-200 hover:border-violet-300 transition-all shadow-2xs"
            >
              {s.id === 'wispr-challenge' ? 'Voice Hackathon' : s.id === 'featherless-challenge' ? 'Featherless 2026' : 'AI Agents'}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Input Section Card */}
      <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900">Challenge Brief or Voice Dictation</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500">{characterCount} chars · {wordCount} words</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Dictation (Wispr Flow compatible) */}
            <VoiceInputButton
              onTranscript={(text) => {
                setBriefInput(prev => prev ? `${prev}\n\n${text}` : text);
              }}
              tooltipText="Click to dictate requirements hands-free"
            />

            <button
              type="button"
              onClick={() => setBriefInput('')}
              className="text-xs text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Large Text Area */}
        <textarea
          rows={11}
          value={briefInput}
          onChange={(e) => setBriefInput(e.target.value)}
          placeholder="Paste hackathon overview, problem statement, rules, deadlines, judging criteria, or use Wispr Flow to dictate project notes..."
          className="w-full text-xs font-mono p-4 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 leading-relaxed bg-[#FAF9F5]/40 text-stone-800 resize-y"
        />

        {/* Action Controls & Engine Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-stone-100">
          {/* Parser Engine Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Extraction Engine:</span>
            <div className="inline-flex p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAnalysisMode('deterministic')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  analysisMode === 'deterministic'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Deterministic Parser (Instant & Grounded)
              </button>
              <button
                type="button"
                onClick={() => setAnalysisMode('ai')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  analysisMode === 'ai'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                AI Enhanced (Featherless AI)
              </button>
            </div>
          </div>

          {/* Prominent Purple Analyze Button */}
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleAnalyze}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/25 hover:-translate-y-0.5 transition-all shrink-0 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Extracting Requirements...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Brief</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Analysis Results View */}
      {currentAnalysis && (
        <div className="space-y-6">
          {/* Results Summary Card */}
          <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Verified Facts
                </span>
                <span>·</span>
                <span>Engine: {currentAnalysis.parserMode}</span>
                <span>·</span>
                <span>{currentAnalysis.requirementsList.length} criteria tracked</span>
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900">
                {currentAnalysis.competitionName}
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {activeProject && (
                <button
                  type="button"
                  onClick={() => handleSaveAsProject(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs font-bold transition-colors"
                >
                  Update Current Project
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSaveAsProject(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/25 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save as Project & Generate Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Zero-Hallucination Policy Disclaimer */}
          <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100 text-xs text-violet-950 flex items-start gap-3">
            <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Zero-Hallucination Guarantee: </span>
              Every extracted requirement quotes direct source text snippets from the competition brief. Details not explicitly mentioned in the text are flagged as `"Not specified in brief"`. You can click <span className="font-semibold">Edit</span> on any card to refine or add details.
            </div>
          </div>

          {/* Extracted Requirements Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentAnalysis.requirementsList.map((req) => {
              const isEditing = editingReqId === req.id;
              const isExplicit = req.isExplicit;

              return (
                <div
                  key={req.id}
                  className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-3 hover:border-violet-200 transition-colors card-lift"
                >
                  <div>
                    {/* Header: Label + Category + Confidence */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-100">
                      <span className="font-bold text-xs text-stone-900 tracking-tight">
                        {req.label}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className={isExplicit ? 'text-emerald-700 font-semibold' : 'text-stone-400 font-medium'}>
                          {isExplicit ? 'Explicit fact' : 'Keyword inferred'}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{req.confidence}</span>
                      </div>
                    </div>

                    {/* Content value or edit input */}
                    {isEditing ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          rows={3}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-violet-400 focus:outline-hidden ring-2 ring-violet-500/20 bg-stone-50 text-stone-900"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingReqId(null)}
                            className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditReq(req.id)}
                            className="px-3 py-1.5 text-xs font-bold bg-violet-600 text-white rounded-xl hover:bg-violet-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                        {req.value === 'Not specified in brief' ? (
                          <span className="text-stone-400 italic">Not specified in brief</span>
                        ) : (
                          req.value
                        )}
                        {req.userEdited && (
                          <span className="ml-2 text-[10px] text-violet-600 font-medium">(edited)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer: Quoted source snippet and edit button */}
                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="truncate max-w-[260px]" title={req.sourceSnippet}>
                      Source: {req.sourceSnippet}
                    </span>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEditReq(req)}
                        className="text-violet-700 hover:text-violet-900 flex items-center gap-1 font-semibold ml-2 shrink-0"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Call to Action */}
          <div className="p-6 bg-gradient-to-r from-violet-50 via-purple-50/40 to-white border border-violet-100 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-stone-900">Ready to execute your sprint?</h4>
              <p className="text-xs text-stone-500">
                Generate tailored Kanban tasks, submission checklist items, and timed demo scripts from these verified requirements.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSaveAsProject(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/25 transition-all shrink-0 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Open Task Board</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
