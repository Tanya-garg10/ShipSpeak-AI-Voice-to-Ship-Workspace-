/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, ChecklistItem, ChecklistCategory } from '../types';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ShieldCheck,
  Info,
  X,
  ExternalLink,
  Github,
  Video,
  FileCode2,
  Volume2
} from 'lucide-react';

interface SubmissionChecklistProps {
  activeProject: Project | null;
  onUpdateChecklist: (items: ChecklistItem[]) => void;
  onUpdateProjectLinks: (workingUrl: string, repoUrl: string) => void;
  onCreateNewProject: () => void;
}

export const SubmissionChecklist: React.FC<SubmissionChecklistProps> = ({
  activeProject,
  onUpdateChecklist,
  onUpdateProjectLinks,
  onCreateNewProject
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | ChecklistCategory>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ChecklistItem | null>(null);

  // Quick link inputs state
  const [workingUrl, setWorkingUrl] = useState(activeProject?.workingProjectUrl || '');
  const [repoUrl, setRepoUrl] = useState(activeProject?.repositoryUrl || '');
  const [savedLinksNotice, setSavedLinksNotice] = useState(false);

  // New/edit item form
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: ChecklistCategory;
    isRequired: boolean;
  }>({
    title: '',
    description: '',
    category: 'deliverable',
    isRequired: true
  });

  if (!activeProject) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-10 shadow-xs">
          <ClipboardCheck className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-stone-900 mb-1">No Active Project Selected</h2>
          <p className="text-xs text-stone-500 mb-5">Please create or select a project to manage submission deliverables.</p>
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

  const checklist = activeProject.checklist || [];
  const completedItems = checklist.filter(c => c.isCompleted);
  const pendingItems = checklist.filter(c => !c.isCompleted);
  const requiredMissing = checklist.filter(c => c.isRequired && !c.isCompleted);

  const totalCount = checklist.length;
  const completedCount = completedItems.length;
  const readinessPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredItems = checklist.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  const handleToggleItem = (itemId: string) => {
    const updated = checklist.map(item => {
      if (item.id === itemId) {
        const nextState = !item.isCompleted;
        return {
          ...item,
          isCompleted: nextState,
          verifiedAt: nextState ? new Date().toISOString() : undefined
        };
      }
      return item;
    });
    onUpdateChecklist(updated);
  };

  const handleSaveLinks = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectLinks(workingUrl.trim(), repoUrl.trim());
    setSavedLinksNotice(true);
    setTimeout(() => setSavedLinksNotice(false), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'deliverable',
      isRequired: true
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: ChecklistItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      isRequired: item.isRequired
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingItem) {
      const updated = checklist.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            isRequired: formData.isRequired
          };
        }
        return item;
      });
      onUpdateChecklist(updated);
    } else {
      const newItem: ChecklistItem = {
        id: `chk_${Date.now()}`,
        projectId: activeProject.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        isRequired: formData.isRequired,
        isCompleted: false
      };
      onUpdateChecklist([...checklist, newItem]);
    }

    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      const updated = checklist.filter(i => i.id !== itemToDelete.id);
      onUpdateChecklist(updated);
      setItemToDelete(null);
    }
  };

  // 1-Click Markdown Submission Summary
  const handleCopySubmissionSummary = () => {
    const summary = `### Project Submission Summary: ${activeProject.title}
**Competition:** ${activeProject.competitionName}
**Deadline:** ${activeProject.deadline}
**Target Audience:** ${activeProject.targetAudience}

**Problem Statement:**
${activeProject.analysis?.problemStatement || 'N/A'}

**Live Application URL:** ${activeProject.workingProjectUrl || '[Not specified]'}
**Public GitHub Repository:** ${activeProject.repositoryUrl || '[Not specified]'}

**Deliverables Audit:** (${completedCount}/${totalCount} completed · ${readinessPercentage}% readiness)
${checklist.map(c => `- [${c.isCompleted ? 'x' : ' '}] ${c.title}${c.isRequired ? ' *(Required)*' : ''}`).join('\n')}

*Generated with ShipSpeak AI — Speak. Build. Ship.*`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="py-6 px-4 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-violet-100/70">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>Deliverables Gate</span>
            <span>·</span>
            <span className="font-semibold text-stone-900">{activeProject.title}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Submission Checklist</h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopySubmissionSummary}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Submission Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl shadow-md shadow-violet-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Deliverable Item
          </button>
        </div>
      </div>

      {/* Missing Required Warning Banner (if any) */}
      {requiredMissing.length > 0 ? (
        <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Attention: {requiredMissing.length} Mandatory Deliverable{requiredMissing.length === 1 ? '' : 's'} Incomplete: </span>
            {requiredMissing.map(r => r.title).join(', ')}. Ensure all are completed before submitting to the portal.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-3xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">All Mandatory Deliverables Complete! </span>
            Your project meets all extracted competition submission requirements.
          </div>
        </div>
      )}

      {/* Readiness Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs card-lift">
          <div className="text-xs text-stone-500 font-semibold mb-1">Readiness Score</div>
          <div className="text-3xl font-black text-stone-900">{readinessPercentage}%</div>
          <div className="h-2 w-full bg-stone-100 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                readinessPercentage >= 80 ? 'bg-emerald-500' : readinessPercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${readinessPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs card-lift">
          <div className="text-xs text-stone-500 font-semibold mb-1">Completed Items</div>
          <div className="text-3xl font-black text-emerald-600">{completedCount}</div>
          <p className="text-[11px] text-stone-500 mt-1">Verified deliverables</p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs card-lift">
          <div className="text-xs text-stone-500 font-semibold mb-1">Pending Items</div>
          <div className="text-3xl font-black text-amber-600">{pendingItems.length}</div>
          <p className="text-[11px] text-stone-500 mt-1">Remaining to verify</p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs card-lift">
          <div className="text-xs text-stone-500 font-semibold mb-1">Missing Required</div>
          <div className={`text-3xl font-black ${requiredMissing.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {requiredMissing.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {requiredMissing.length > 0 ? 'Mandatory items' : 'All mandatory fulfilled'}
          </p>
        </div>
      </div>

      {/* Public URLs Card */}
      <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Submission URLs & Repository</h3>
            <p className="text-xs text-stone-500">Provide the public hosted URL and repository required by hackathon judges.</p>
          </div>
          {savedLinksNotice && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-xl">
              <Check className="w-3.5 h-3.5" /> URLs Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveLinks} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-stone-800 block mb-1">Live Web Deployment URL *</label>
            <input
              type="url"
              value={workingUrl}
              onChange={(e) => setWorkingUrl(e.target.value)}
              placeholder="https://my-app.vercel.app"
              className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-800"
            />
          </div>

          <div>
            <label className="font-bold text-stone-800 block mb-1">Public GitHub Code Repository *</label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/my-user/my-project"
              className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-800"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Save Project URLs
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl w-fit text-xs flex-wrap">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'deliverable', label: 'Required Deliverables' },
          { id: 'functionality', label: 'Functionality & Testing' },
          { id: 'wispr', label: 'Voice & Evidence' },
          { id: 'documentation', label: 'Documentation' },
          { id: 'review', label: 'Final Review' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilterCategory(cat.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              filterCategory === cat.id
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Checklist Grouped Cards */}
      <div className="bg-white border border-stone-200/80 rounded-3xl divide-y divide-stone-100 shadow-xs overflow-hidden">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
              item.isCompleted ? 'bg-emerald-50/25' : 'hover:bg-stone-50/60'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <input
                type="checkbox"
                id={`chk_${item.id}`}
                checked={item.isCompleted}
                onChange={() => handleToggleItem(item.id)}
                className="mt-1 w-5 h-5 rounded-lg text-violet-600 focus:ring-violet-500 border-stone-300 cursor-pointer"
              />
              <div>
                <label
                  htmlFor={`chk_${item.id}`}
                  className={`text-xs font-bold cursor-pointer ${
                    item.isCompleted ? 'text-stone-400 line-through' : 'text-stone-900'
                  }`}
                >
                  {item.title}
                </label>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400">
                  <span className={item.isRequired ? 'text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md' : 'text-stone-600 font-medium bg-stone-100 px-2 py-0.5 rounded-md'}>
                    {item.isRequired ? 'MANDATORY' : 'OPTIONAL'}
                  </span>
                  <span>·</span>
                  <span className="capitalize">{item.category}</span>
                  {item.verifiedAt && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold">Verified {new Date(item.verifiedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEditModal(item)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                title="Edit item"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setItemToDelete(item)}
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="p-10 text-center text-xs text-stone-500">
            No deliverables found for this category filter.
          </div>
        )}
      </div>

      {/* Add / Edit Checklist Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingItem ? 'Edit Deliverable Item' : 'Add Deliverable Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 2-Minute Demo Video Recorded & Uploaded"
                  className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Requirement details or verification criteria..."
                  className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ChecklistCategory })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="deliverable">Required Deliverable</option>
                  <option value="functionality">Functionality & Testing</option>
                  <option value="wispr">Wispr Evidence</option>
                  <option value="documentation">Documentation</option>
                  <option value="review">Final Review</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-req-modal"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="chk-req-modal" className="text-stone-600">
                  Mark as mandatory competition deliverable
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-violet-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Add Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900">Delete Item?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-stone-800">"{itemToDelete.title}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
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
