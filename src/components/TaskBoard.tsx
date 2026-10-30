/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, Task, TaskPriority, TaskStatus } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import {
  Kanban,
  List,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  X,
  ArrowRight
} from 'lucide-react';

interface TaskBoardProps {
  activeProject: Project | null;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onCreateNewProject: () => void;
  wisprFlowApiKey?: string;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  activeProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateTaskStatus,
  onCreateNewProject,
  wisprFlowApiKey
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'created'>('priority');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    relatedRequirement: string;
    isRecommended: boolean;
  }>({
    title: '',
    description: '',
    priority: 'high',
    status: 'todo',
    dueDate: '',
    relatedRequirement: '',
    isRecommended: false
  });

  if (!activeProject) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-10 shadow-xs">
          <Kanban className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-stone-900 mb-1">No Active Project Selected</h2>
          <p className="text-xs text-stone-500 mb-5">Select an existing project or analyze a new brief to generate sprint tasks.</p>
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

  const tasks = activeProject.tasks || [];
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchReq = t.relatedRequirement?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchReq) return false;
    }
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const map: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
      return map[a.priority] - map[b.priority];
    }
    if (sortBy === 'deadline') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  const openAddModal = (status: TaskStatus = 'todo') => {
    setFormData({
      title: '',
      description: '',
      priority: 'high',
      status,
      dueDate: activeProject.deadline !== 'Not specified in brief' ? activeProject.deadline : '',
      relatedRequirement: 'Deliverable',
      isRecommended: false
    });
    setEditingTask(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || '',
      relatedRequirement: task.relatedRequirement || '',
      isRecommended: Boolean(task.isRecommended)
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || undefined,
        relatedRequirement: formData.relatedRequirement || undefined,
        isRecommended: formData.isRecommended,
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddTask({
        projectId: activeProject.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || undefined,
        relatedRequirement: formData.relatedRequirement || undefined,
        isRecommended: formData.isRecommended
      });
    }

    setIsAddModalOpen(false);
    setEditingTask(null);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const handleSuggestTasks = () => {
    const unfulfilledDeliverables = activeProject.analysis?.requiredDeliverables?.filter(d => {
      return !tasks.some(t => t.title.toLowerCase().includes(d.toLowerCase().slice(0, 15)));
    }) || [];

    if (unfulfilledDeliverables.length === 0) {
      alert('All major extracted competition deliverables already have corresponding sprint tasks!');
      return;
    }

    unfulfilledDeliverables.forEach(d => {
      onAddTask({
        projectId: activeProject.id,
        title: `Deliverable: ${d.slice(0, 60)}`,
        description: `Implement and verify: ${d}`,
        priority: 'high',
        status: 'todo',
        relatedRequirement: 'Required Deliverable',
        isRecommended: false
      });
    });
  };

  const kanbanColumns: Array<{ status: TaskStatus; label: string; count: number; accent: string }> = [
    { status: 'todo', label: 'To Do', count: sortedTasks.filter(t => t.status === 'todo').length, accent: 'bg-stone-400' },
    { status: 'in-progress', label: 'In Progress', count: sortedTasks.filter(t => t.status === 'in-progress').length, accent: 'bg-amber-500' },
    { status: 'done', label: 'Done', count: sortedTasks.filter(t => t.status === 'done').length, accent: 'bg-emerald-500' }
  ];

  return (
    <div className="py-6 px-4 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-violet-100/70">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>Project Tasks</span>
            <span>·</span>
            <span className="font-semibold text-stone-900">{activeProject.title}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Smart Task Planner</h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleSuggestTasks}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-violet-50 text-violet-800 hover:bg-violet-100 rounded-2xl transition-all border border-violet-200/60 shadow-2xs cursor-pointer"
            title="Scan brief for missing deliverable tasks"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Suggest Tasks from Brief
          </button>
          <button
            type="button"
            onClick={() => openAddModal('todo')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl shadow-md shadow-violet-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Progress & Filters Card */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
            <span className="font-bold text-stone-800">Sprint Progress</span>
            <span className="font-semibold">{completedCount} of {tasks.length} tasks completed ({progressPercent}%)</span>
          </div>
          <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-stone-100">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, requirements..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Status Filter */}
            <select
              aria-label="Filter tasks by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 text-xs shadow-2xs"
            >
              <option value="all">Status: All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            {/* Priority Filter */}
            <select
              aria-label="Filter tasks by priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 text-xs shadow-2xs"
            >
              <option value="all">Priority: All</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Sort Filter */}
            <select
              aria-label="Sort tasks by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 text-xs shadow-2xs"
            >
              <option value="priority">Sort: Priority</option>
              <option value="deadline">Sort: Due Date</option>
              <option value="created">Sort: Created Date</option>
            </select>

            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg text-xs transition-colors ${
                  viewMode === 'kanban' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs transition-colors ${
                  viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kanbanColumns.map(col => {
            const colTasks = sortedTasks.filter(t => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-[#FAF8F5]/80 border border-violet-100/70 rounded-3xl p-4 flex flex-col min-h-[520px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200/80">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.accent}`} />
                    <span className="font-bold text-xs text-stone-900">{col.label}</span>
                    <span className="text-[11px] text-stone-500">· {col.count}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddModal(col.status)}
                    className="p-1.5 text-stone-500 hover:text-stone-800 rounded-xl hover:bg-stone-200/60 transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-stone-600 border border-dashed border-stone-200 rounded-2xl">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div
                        key={task.id}
                        className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between gap-3 group card-lift"
                      >
                        <div>
                          {/* Priority header */}
                          <div className="flex items-center justify-between text-[10px] mb-1.5">
                            <span className={
                              task.priority === 'high'
                                ? 'text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md'
                                : task.priority === 'medium'
                                ? 'text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md'
                                : 'text-stone-600 font-medium bg-stone-100 px-2 py-0.5 rounded-md'
                            }>
                              {task.priority.toUpperCase()}
                            </span>
                            {task.isRecommended && (
                              <span className="text-violet-700 font-semibold text-[9px] bg-violet-50 px-2 py-0.5 rounded-md">
                                Recommendation
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-stone-900 leading-snug group-hover:text-violet-950 transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Footer info: Related requirement and controls */}
                        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                          <span className="truncate max-w-[130px]" title={task.relatedRequirement}>
                            {task.relatedRequirement || 'General Task'}
                          </span>

                          <div className="flex items-center gap-1">
                            {col.status !== 'todo' && (
                              <button
                                type="button"
                                onClick={() => onUpdateTaskStatus(task.id, col.status === 'done' ? 'in-progress' : 'todo')}
                                className="px-1.5 py-0.5 rounded-md hover:bg-stone-100 text-stone-600"
                                title="Move back"
                              >
                                ←
                              </button>
                            )}
                            {col.status !== 'done' && (
                              <button
                                type="button"
                                onClick={() => onUpdateTaskStatus(task.id, col.status === 'todo' ? 'in-progress' : 'done')}
                                className="px-1.5 py-0.5 rounded-md hover:bg-stone-100 text-stone-600 font-bold"
                                title="Move forward"
                              >
                                →
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditModal(task)}
                              className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                              title="Edit task"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskToDelete(task)}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded-md"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white border border-stone-200/80 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Task Details</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {sortedTasks.map(task => (
                  <tr key={task.id} className="hover:bg-violet-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <select
                        aria-label="Change task status"
                        value={task.status}
                        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${
                          task.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : task.status === 'in-progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-bold text-stone-900">{task.title}</div>
                      <div className="text-[11px] text-stone-500 line-clamp-1">{task.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={
                        task.priority === 'high'
                          ? 'text-rose-600 font-bold'
                          : task.priority === 'medium'
                          ? 'text-amber-600 font-bold'
                          : 'text-stone-500'
                      }>
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-[11px]">
                      {task.relatedRequirement || 'General'}
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-[11px]">
                      {task.dueDate || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(task)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingTask ? 'Edit Sprint Task' : 'Add New Sprint Task'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-800">Task Title *</label>
                  <VoiceInputButton
                    onTranscript={(text) => {
                      setFormData(prev => ({ ...prev, title: prev.title ? `${prev.title} ${text}` : text }));
                    }}
                    tooltipText="Dictate task title"
                    wisprFlowApiKey={wisprFlowApiKey}
                  />
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Implement Voice Dictation Teleprompter"
                  className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-800">Description</label>
                  <VoiceInputButton
                    onTranscript={(text) => {
                      setFormData(prev => ({ ...prev, description: prev.description ? `${prev.description} ${text}` : text }));
                    }}
                    tooltipText="Dictate task description"
                    wisprFlowApiKey={wisprFlowApiKey}
                  />
                </div>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specific details, technical steps, or acceptance criteria..."
                  className="w-full p-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Related Requirement</label>
                  <input
                    type="text"
                    value={formData.relatedRequirement}
                    onChange={(e) => setFormData({ ...formData, relatedRequirement: e.target.value })}
                    placeholder="e.g. Demo Video / Live URL"
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Due Date</label>
                  <input
                    type="text"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    placeholder="e.g. Nov 15, 2026"
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-rec-modal"
                  checked={formData.isRecommended}
                  onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="chk-rec-modal" className="text-stone-600">
                  Mark as general recommendation (not an explicit competition rule)
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
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900">Delete Task?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-stone-800">"{taskToDelete.title}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
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
