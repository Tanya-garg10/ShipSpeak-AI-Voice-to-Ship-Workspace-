/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RequirementCategory =
  | 'competition'
  | 'problem'
  | 'deadline'
  | 'eligibility'
  | 'tech'
  | 'deliverables'
  | 'judging'
  | 'video'
  | 'links'
  | 'docs'
  | 'submission'
  | 'prize'
  | 'other';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'inferred';

export interface ExtractedRequirement {
  id: string;
  category: RequirementCategory;
  key: string;
  label: string;
  value: string;
  sourceSnippet: string;
  confidence: ConfidenceLevel;
  isExplicit: boolean;
  userEdited?: boolean;
}

export interface JudgingCriterion {
  id: string;
  criterion: string;
  weightOrDescription: string;
  sourceSnippet?: string;
}

export interface ExtractedBriefData {
  competitionName: string;
  problemStatement: string;
  targetAudience: string;
  registrationDeadline: string;
  submissionDeadline: string;
  eligibilityRules: string[];
  requiredTechTools: string[];
  requiredDeliverables: string[];
  judgingCriteria: JudgingCriterion[];
  demoVideoRequirements: string;
  workingProjectLinkRequirements: string;
  documentationRequirements: string;
  submissionInstructions: string;
  prizeInformation: string;
  requirementsList: ExtractedRequirement[];
  analyzedAt: string;
  parserMode: 'deterministic' | 'ai-enhanced';
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  relatedRequirement?: string;
  isRecommended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ChecklistCategory = 'deliverable' | 'functionality' | 'documentation' | 'wispr' | 'review';

export interface ChecklistItem {
  id: string;
  projectId: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  verifiedAt?: string;
  notes?: string;
}

export interface DemoScriptSection {
  id: string;
  title: string;
  speakingTimeSeconds: number;
  content: string;
  tips: string;
}

export interface DemoScript {
  duration: 60 | 90 | 120;
  openingHook: string;
  problemStatement: string;
  targetUser: string;
  productWalkthrough: string;
  keyFeatures: string[];
  technicalImplementation: string;
  resultsOrEvidence: string;
  closingStatement: string;
  fullScript: string;
  sections: DemoScriptSection[];
  wordCount: number;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  competitionName: string;
  briefRaw: string;
  analysis: ExtractedBriefData;
  targetAudience: string;
  deadline: string;
  tasks: Task[];
  checklist: ChecklistItem[];
  demoScripts: {
    60: DemoScript;
    90: DemoScript;
    120: DemoScript;
  };
  workingProjectUrl: string;
  repositoryUrl: string;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StorageDataV1 {
  version: 1;
  projects: Project[];
  activeProjectId: string | null;
  settings: {
    userName: string;
    enableSpeechRecognition: boolean;
    theme: 'light' | 'system';
    lastBackupDate?: string;
    wisprFlowApiKey?: string;
  };
}
