/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, StorageDataV1, Task, TaskStatus, ChecklistItem, DemoScript } from './types';
import { loadStorageData, saveStorageData, createInitialSampleProject } from './utils/storage';
import { parseBriefDeterministic, generateTasksFromRequirements, generateChecklistFromRequirements } from './utils/briefParser';
import { generateDemoScriptForDuration } from './utils/demoScriptGenerator';
import { SAMPLE_BRIEFS } from './utils/sampleBriefs';

import { Navbar } from './components/Navbar';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { BriefAnalyzer } from './components/BriefAnalyzer';
import { TaskBoard } from './components/TaskBoard';
import { SubmissionChecklist } from './components/SubmissionChecklist';
import { DemoStudio } from './components/DemoStudio';
import { ProjectManager } from './components/ProjectManager';
import { SettingsView } from './components/SettingsView';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';

import { Plus, X, Sparkles, FolderPlus } from 'lucide-react';

export default function App() {
  const [storageData, setStorageData] = useState<StorageDataV1>(() => loadStorageData());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('landing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // New project modal form state
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectBrief, setNewProjectBrief] = useState('');
  const [selectedSamplePreset, setSelectedSamplePreset] = useState('');

  // Persist state to localStorage on every change
  useEffect(() => {
    saveStorageData(storageData);
  }, [storageData]);

  const activeProject = storageData.projects.find(p => p.id === storageData.activeProjectId) || storageData.projects[0] || null;

  // Navigation and project select
  const handleSelectProject = (projectId: string) => {
    setStorageData(prev => ({
      ...prev,
      activeProjectId: projectId
    }));
  };

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Task handlers
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!activeProject) return;
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now
    };

    setStorageData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            tasks: [newTask, ...p.tasks],
            updatedAt: now
          };
        }
        return p;
      })
    }));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    if (!activeProject) return;
    const now = new Date().toISOString();
    setStorageData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
            updatedAt: now
          };
        }
        return p;
      })
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    if (!activeProject) return;
    const now = new Date().toISOString();
    setStorageData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            tasks: p.tasks.filter(t => t.id !== taskId),
            updatedAt: now
          };
        }
        return p;
      })
    }));
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (!activeProject) return;
    const now = new Date().toISOString();
    setStorageData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            tasks: p.tasks.map(t => t.id === taskId ? { ...t, status, updatedAt: now } : t),
            updatedAt: now
          };
        }
        return p;
      })
    }));
  };

  // Checklist handlers
  const handleUpdateChecklist = (items: ChecklistItem[]) => {
    if (!activeProject) return;
    const now = new Date().toISOString();
    setStorageData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            checklist: items,
            updatedAt: now
          };
        }
        return p;
      })
    }));
  };

  const handleUpdateProjectLinks = (workingProjectUrl: string, repositoryUrl: string) => {
    if (!activeProject) return;
    const now = new Date().toISOString();
    setStorageData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            workingProjectUrl,
            repositoryUrl,
            updatedAt: now
          };
        }
        return p;
      })
    }));
  };

  // Project Meta Updates
  const handleUpdateProjectMeta = (projectId: string, updates: Partial<Project>) => {
    const now = new Date().toISOString();
    setStorageData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            ...updates,
            updatedAt: now
          };
        }
        return p;
      })
    }));
  };

  const handleDeleteProject = (projectId: string) => {
    setStorageData(prev => {
      const remaining = prev.projects.filter(p => p.id !== projectId);
      const nextActiveId = prev.activeProjectId === projectId
        ? (remaining[0]?.id || null)
        : prev.activeProjectId;
      return {
        ...prev,
        projects: remaining,
        activeProjectId: nextActiveId
      };
    });
  };

  // Brief Analyzer Save
  const handleSaveAsNewProject = (project: Project) => {
    setStorageData(prev => ({
      ...prev,
      projects: [project, ...prev.projects],
      activeProjectId: project.id
    }));
  };

  const handleUpdateProjectAnalysis = (projectId: string, analysis: any) => {
    const now = new Date().toISOString();
    setStorageData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            analysis,
            competitionName: analysis.competitionName,
            targetAudience: analysis.targetAudience,
            deadline: analysis.submissionDeadline,
            updatedAt: now
          };
        }
        return p;
      })
    }));
  };

  // Demo Script handler
  const handleSaveDemoScript = (duration: 60 | 90 | 120, script: DemoScript) => {
    if (!activeProject) return;
    const now = new Date().toISOString();
    setStorageData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            demoScripts: {
              ...p.demoScripts,
              [duration]: script
            },
            updatedAt: now
          };
        }
        return p;
      })
    }));
  };

  // Create Project Modal Submission
  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const briefRaw = newProjectBrief.trim() || (selectedSamplePreset ? (SAMPLE_BRIEFS.find(s => s.id === selectedSamplePreset)?.rawText || '') : '');
    const analysis = parseBriefDeterministic(briefRaw || newProjectTitle);

    const projectId = `proj_${Date.now()}`;
    const title = newProjectTitle.trim() || analysis.competitionName || 'Untitled Hackathon Build';
    const tasks = generateTasksFromRequirements(projectId, analysis);
    const checklist = generateChecklistFromRequirements(projectId, analysis);

    const partialProj: Partial<Project> = {
      id: projectId,
      title,
      competitionName: analysis.competitionName !== 'Not specified in brief' ? analysis.competitionName : title,
      briefRaw,
      analysis,
      targetAudience: analysis.targetAudience,
      deadline: analysis.submissionDeadline,
      tasks,
      checklist,
      workingProjectUrl: '',
      repositoryUrl: '',
      isArchived: false,
      createdAt: new Date().toISOString(),
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

    handleSaveAsNewProject(finalProject);
    setIsNewProjectModalOpen(false);
    setNewProjectTitle('');
    setNewProjectBrief('');
    setSelectedSamplePreset('');
    setCurrentTab('tasks');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col font-sans selection:bg-violet-200">
      {currentTab === 'landing' ? (
        /* Dedicated SaaS Landing Page */
        <>
          <LandingPage
            onEnterWorkspace={(targetTab) => handleSelectTab(targetTab || 'overview')}
            activeProject={activeProject}
          />
          <Footer onNavigate={handleSelectTab} />
        </>
      ) : (
        /* Interior Hackathon Workspace */
        <>
          {/* Top Navbar with Competition Selector & Landing Page shortcut */}
          <Navbar
            projects={storageData.projects}
            activeProject={activeProject}
            onSelectProject={handleSelectProject}
            onCreateNewProject={() => setIsNewProjectModalOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onNavigate={handleSelectTab}
          />

          {/* Main Layout Area */}
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            {/* Left Sidebar */}
            <Sidebar
              currentTab={currentTab}
              onSelectTab={handleSelectTab}
              activeProject={activeProject}
              isOpenMobile={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            {/* Dynamic Content View */}
            <main className="flex-1 min-w-0 pb-16">
              {currentTab === 'overview' && (
                <OverviewDashboard
                  projects={storageData.projects}
                  activeProject={activeProject}
                  onNavigate={handleSelectTab}
                  onSelectProject={handleSelectProject}
                  onCreateNewProject={() => setIsNewProjectModalOpen(true)}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                />
              )}

              {currentTab === 'analyzer' && (
                <BriefAnalyzer
                  activeProject={activeProject}
                  onSaveAsNewProject={handleSaveAsNewProject}
                  onUpdateProjectAnalysis={handleUpdateProjectAnalysis}
                  onNavigate={handleSelectTab}
                />
              )}

              {currentTab === 'tasks' && (
                <TaskBoard
                  activeProject={activeProject}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onCreateNewProject={() => setIsNewProjectModalOpen(true)}
                />
              )}

              {currentTab === 'checklist' && (
                <SubmissionChecklist
                  activeProject={activeProject}
                  onUpdateChecklist={handleUpdateChecklist}
                  onUpdateProjectLinks={handleUpdateProjectLinks}
                  onCreateNewProject={() => setIsNewProjectModalOpen(true)}
                />
              )}

              {currentTab === 'demo' && (
                <DemoStudio
                  activeProject={activeProject}
                  onSaveDemoScript={handleSaveDemoScript}
                  onCreateNewProject={() => setIsNewProjectModalOpen(true)}
                />
              )}

              {currentTab === 'projects' && (
                <ProjectManager
                  projects={storageData.projects}
                  activeProject={activeProject}
                  onSelectProject={handleSelectProject}
                  onCreateNewProject={() => setIsNewProjectModalOpen(true)}
                  onUpdateProjectMeta={handleUpdateProjectMeta}
                  onDeleteProject={handleDeleteProject}
                  onNavigate={handleSelectTab}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  storageData={storageData}
                  onDataReload={(newData) => setStorageData(newData)}
                />
              )}
            </main>
          </div>

          {/* Modern SaaS Footer */}
          <Footer onNavigate={handleSelectTab} />
        </>
      )}

      {/* Global "Create Project" Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-violet-600" />
                <span>Create New Hackathon Project</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. ShipSpeak AI, VoiceSprint, DocuVoice"
                  className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-800">Quick-Load Competition Brief</label>
                  <span className="text-[11px] text-stone-400">Optional preset</span>
                </div>
                <select
                  aria-label="Preset brief template"
                  value={selectedSamplePreset}
                  onChange={(e) => {
                    const presetId = e.target.value;
                    setSelectedSamplePreset(presetId);
                    const found = SAMPLE_BRIEFS.find(s => s.id === presetId);
                    if (found) {
                      setNewProjectBrief(found.rawText);
                      if (!newProjectTitle) setNewProjectTitle(`${found.name} Build`);
                    }
                  }}
                  className="w-full p-2.5 rounded-2xl border border-stone-200 bg-white text-stone-700"
                >
                  <option value="">Start from blank brief...</option>
                  {SAMPLE_BRIEFS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Competition Brief / Raw Rules</label>
                <textarea
                  rows={5}
                  value={newProjectBrief}
                  onChange={(e) => setNewProjectBrief(e.target.value)}
                  placeholder="Paste competition text or challenge instructions here. ShipSpeak will automatically parse deadlines, deliverables, and judging rubrics..."
                  className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-900 font-mono text-[11px] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-violet-500/25 transition-all cursor-pointer"
                >
                  Create & Launch Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
