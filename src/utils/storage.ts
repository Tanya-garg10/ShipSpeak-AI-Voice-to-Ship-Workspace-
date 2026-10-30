/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, StorageDataV1 } from '../types';
import { SAMPLE_BRIEFS } from './sampleBriefs';
import {
  parseBriefDeterministic,
  generateTasksFromRequirements,
  generateChecklistFromRequirements
} from './briefParser';
import { generateDemoScriptForDuration } from './demoScriptGenerator';

const STORAGE_KEY = 'SHIPSPIAK_AI_STORAGE_V1';

export function createInitialSampleProject(): Project {
  const wisprBrief = SAMPLE_BRIEFS[0];
  const analysis = parseBriefDeterministic(wisprBrief.rawText);
  const projectId = 'proj_wispr_challenge_sample';
  const tasks = generateTasksFromRequirements(projectId, analysis);
  const checklist = generateChecklistFromRequirements(projectId, analysis);

  // Set first task to in-progress, second task to done for realistic demo state
  if (tasks.length > 1) {
    tasks[0].status = 'done';
    tasks[1].status = 'in-progress';
  }
  if (checklist.length > 0) {
    checklist[0].isCompleted = true;
    checklist[0].verifiedAt = new Date().toISOString();
  }

  const projectPartial: Partial<Project> = {
    id: projectId,
    title: 'ShipSpeak AI — Voice-to-Ship Workspace',
    competitionName: analysis.competitionName,
    briefRaw: wisprBrief.rawText,
    analysis,
    targetAudience: analysis.targetAudience,
    deadline: analysis.submissionDeadline,
    tasks,
    checklist,
    workingProjectUrl: 'https://ais-dev-kujmcnjwzo6usu3li5prge-545677529876.asia-southeast1.run.app',
    repositoryUrl: 'https://github.com/example/shipspeak-ai',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const demoScripts = {
    60: generateDemoScriptForDuration(projectPartial, 60),
    90: generateDemoScriptForDuration(projectPartial, 90),
    120: generateDemoScriptForDuration(projectPartial, 120)
  };

  return {
    ...projectPartial as Project,
    demoScripts
  };
}

export function getDefaultStorageData(): StorageDataV1 {
  const sampleProject = createInitialSampleProject();
  return {
    version: 1,
    projects: [sampleProject],
    activeProjectId: sampleProject.id,
    settings: {
      userName: 'Hackathon Builder',
      enableSpeechRecognition: true,
      theme: 'light',
      wisprFlowApiKey: ''
    }
  };
}

export function loadStorageData(): StorageDataV1 {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return getDefaultStorageData();
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultStorageData();
      saveStorageData(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.projects)) {
      console.warn('Storage format mismatch, initializing fresh schema v1');
      const fallback = getDefaultStorageData();
      saveStorageData(fallback);
      return fallback;
    }

    return parsed as StorageDataV1;
  } catch (err) {
    console.error('Failed to load storage data from localStorage:', err);
    return getDefaultStorageData();
  }
}

export function saveStorageData(data: StorageDataV1): boolean {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return true;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

export function exportProjectDataJSON(data: StorageDataV1): string {
  return JSON.stringify(data, null, 2);
}

export function validateAndImportProjectData(jsonString: string): { success: boolean; data?: StorageDataV1; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'File is not a valid JSON object.' };
    }
    if (!Array.isArray(parsed.projects)) {
      return { success: false, error: 'Invalid schema: missing "projects" array.' };
    }
    // Basic verification of project items
    for (const proj of parsed.projects) {
      if (!proj.id || !proj.title) {
        return { success: false, error: 'One or more projects are missing required id or title.' };
      }
    }

    const imported: StorageDataV1 = {
      version: 1,
      projects: parsed.projects,
      activeProjectId: parsed.activeProjectId || (parsed.projects[0] ? parsed.projects[0].id : null),
      settings: parsed.settings || {
        userName: 'Builder',
        enableSpeechRecognition: true,
        theme: 'light',
        wisprFlowApiKey: ''
      }
    };

    saveStorageData(imported);
    return { success: true, data: imported };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to parse JSON file.' };
  }
}

export function clearAllStorageData(): StorageDataV1 {
  const fresh: StorageDataV1 = {
    version: 1,
    projects: [],
    activeProjectId: null,
    settings: {
      userName: 'Builder',
      enableSpeechRecognition: true,
      theme: 'light',
      wisprFlowApiKey: ''
    }
  };
  saveStorageData(fresh);
  return fresh;
}
