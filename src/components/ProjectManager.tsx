/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../types';
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Calendar,
  Archive,
  ArchiveRestore,
  ArrowRight,
  X
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface ProjectManagerProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (id: string) => void;
  onCreateNewProject: () => void;
  onUpdateProjectMeta: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateNewProject,
  onUpdateProjectMeta,
  onDeleteProject,
  onNavigate
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    competitionName: '',
    targetAudience: '',
    deadline: '',
    workingProjectUrl: '',
    repositoryUrl: ''
  });

  const filteredProjects = projects.filter(p => showArchived ? true : !p.isArchived);

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      competitionName: project.competitionName,
      targetAudience: project.targetAudience,
      deadline: project.deadline,
      workingProjectUrl: project.workingProjectUrl || '',
      repositoryUrl: project.repositoryUrl || ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    onUpdateProjectMeta(editingProject.id, {
      title: formData.title.trim(),
      competitionName: formData.competitionName.trim(),
      targetAudience: formData.targetAudience.trim(),
      deadline: formData.deadline.trim(),
      workingProjectUrl: formData.workingProjectUrl.trim(),
      repositoryUrl: formData.repositoryUrl.trim(),
      updatedAt: new Date().toISOString()
    });

    setEditingProject(null);
  };

  const handleToggleArchive = (project: Project) => {
    onUpdateProjectMeta(project.id, {
      isArchived: !project.isArchived,
      updatedAt: new Date().toISOString()
    });
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="py-6 px-4 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-violet-100/70">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">My Projects</h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage, archive, or configure saved hackathons and competition workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded text-violet-600 focus:ring-violet-500"
            />
            <span>Show archived projects</span>
          </label>

          <button
            type="button"
            onClick={onCreateNewProject}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl shadow-md shadow-violet-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map(p => {
          const isActive = p.id === activeProject?.id;
          const completedTasks = p.tasks.filter(t => t.status === 'done').length;
          const totalTasks = p.tasks.length;
          const completedChecklist = p.checklist.filter(c => c.isCompleted).length;
          const totalChecklist = p.checklist.length;
          const readinessPct = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

          return (
            <div
              key={p.id}
              className={`bg-white border rounded-3xl p-6 shadow-xs transition-all flex flex-col justify-between gap-4 card-lift ${
                isActive
                  ? 'border-violet-300 ring-2 ring-violet-500/15 shadow-md shadow-violet-500/10'
                  : 'border-stone-200/80 hover:border-violet-200'
              } ${p.isArchived ? 'opacity-70 bg-stone-50/60' : ''}`}
            >
              <div>
                {/* Header row: Competition & Active status */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="truncate max-w-[170px] text-violet-700 font-bold">
                    {p.competitionName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {p.isArchived && (
                      <span className="text-[10px] text-stone-400 font-medium">Archived</span>
                    )}
                    {isActive && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Active Workspace
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-extrabold text-stone-900 line-clamp-1 mb-1.5">
                  {p.title}
                </h3>

                {/* Deadline */}
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">
                    {p.deadline !== 'Not specified in brief' ? p.deadline : 'No deadline specified'}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50/80 rounded-2xl text-xs text-stone-600">
                  <div>
                    <span className="text-[10px] text-stone-400 font-medium block">Tasks</span>
                    <span className="font-bold text-stone-900">{completedTasks}/{totalTasks} Done</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-medium block">Readiness</span>
                    <span className="font-bold text-stone-900">{readinessPct}% Verified</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => onSelectProject(p.id)}
                      className="px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-50 rounded-xl transition-colors cursor-pointer"
                    >
                      Make Active
                    </button>
                  )}
                  {isActive && (
                    <button
                      type="button"
                      onClick={() => onNavigate('tasks')}
                      className="px-3 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Sprint</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
                    title="Edit project details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleArchive(p)}
                    className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
                    title={p.isArchived ? 'Restore project' : 'Archive project'}
                  >
                    {p.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(p)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-stone-500 bg-white border border-stone-200 rounded-3xl">
            No projects match your current view. Click "+ New Project" to create one.
          </div>
        )}
      </div>

      {/* Edit Project Details Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Edit Project Information</h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Competition / Hackathon Name</label>
                <input
                  type="text"
                  value={formData.competitionName}
                  onChange={(e) => setFormData({ ...formData, competitionName: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-stone-200 text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Target Audience</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-stone-200 text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Submission Deadline</label>
                <input
                  type="text"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-stone-200 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Live Project URL</label>
                  <input
                    type="url"
                    value={formData.workingProjectUrl}
                    onChange={(e) => setFormData({ ...formData, workingProjectUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={formData.repositoryUrl}
                    onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-violet-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900">Delete Project?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to permanently delete <span className="font-semibold text-stone-800">"{projectToDelete.title}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
