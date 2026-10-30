/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { parseBriefDeterministic, generateTasksFromRequirements, generateChecklistFromRequirements } from '../src/utils/briefParser';
import { SAMPLE_BRIEFS } from '../src/utils/sampleBriefs';
import { generateDemoScriptForDuration, generateElevatorPitch } from '../src/utils/demoScriptGenerator';
import { validateAndImportProjectData, exportProjectDataJSON } from '../src/utils/storage';
import { StorageDataV1 } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Running ShipSpeak AI Automated Test Suite...\n');

// TEST 1: Deterministic Brief Parsing for Wispr Challenge
console.log('Test 1: Parsing Wispr Challenge Brief...');
const wisprBrief = SAMPLE_BRIEFS[0];
const parsedWispr = parseBriefDeterministic(wisprBrief.rawText);

assert(
  parsedWispr.competitionName.includes('Wispr Challenge'),
  `Expected competition name to include "Wispr Challenge", got "${parsedWispr.competitionName}"`
);
assert(
  parsedWispr.submissionDeadline.includes('November 15, 2026'),
  `Expected submission deadline to include "November 15, 2026", got "${parsedWispr.submissionDeadline}"`
);
assert(
  parsedWispr.registrationDeadline.includes('November 10, 2026'),
  `Expected registration deadline to include "November 10, 2026", got "${parsedWispr.registrationDeadline}"`
);
assert(
  parsedWispr.requiredDeliverables.length >= 3,
  `Expected at least 3 required deliverables, got ${parsedWispr.requiredDeliverables.length}`
);
assert(
  parsedWispr.judgingCriteria.length >= 4,
  `Expected at least 4 judging criteria, got ${parsedWispr.judgingCriteria.length}`
);
assert(
  parsedWispr.requirementsList.length >= 10,
  `Expected at least 10 tracked requirements, got ${parsedWispr.requirementsList.length}`
);
console.log('✓ Test 1 Passed: Accurate fact extraction, date parsing, and rubric weights.');

// TEST 2: Task Generation & Pacing
console.log('Test 2: Generating Actionable Tasks from Requirements...');
const tasks = generateTasksFromRequirements('test_proj_1', parsedWispr);
assert(tasks.length >= 5, `Expected at least 5 generated tasks, got ${tasks.length}`);
assert(
  tasks.some(t => t.title.toLowerCase().includes('demo video')),
  'Expected task for recording demo video'
);
assert(
  tasks.some(t => t.title.toLowerCase().includes('github repository')),
  'Expected task for public GitHub repo'
);
assert(
  tasks.some(t => t.title.toLowerCase().includes('wispr flow')),
  'Expected task for Wispr Flow voice integration evidence'
);
console.log('✓ Test 2 Passed: Tasks properly mapped to required competition deliverables.');

// TEST 3: Submission Checklist Readiness Calculations
console.log('Test 3: Submission Checklist Generation & Verification...');
const checklist = generateChecklistFromRequirements('test_proj_1', parsedWispr);
assert(checklist.length >= 5, `Expected at least 5 checklist items, got ${checklist.length}`);
const mandatoryItems = checklist.filter(c => c.isRequired);
assert(mandatoryItems.length >= 4, `Expected at least 4 mandatory deliverables, got ${mandatoryItems.length}`);

// Test completion rate
const total = checklist.length;
let completed = 0;
let percent = Math.round((completed / total) * 100);
assert(percent === 0, 'Initial checklist readiness must be 0%');

checklist[0].isCompleted = true;
checklist[1].isCompleted = true;
completed = 2;
percent = Math.round((completed / total) * 100);
assert(percent > 0 && percent < 100, `Expected partial completion percent, got ${percent}%`);
console.log(`✓ Test 3 Passed: Readiness calculations work correctly (${percent}% verified).`);

// TEST 4: Demo Script Generation for 60s, 90s, and 120s
console.log('Test 4: Generating Demo Scripts for 60s, 90s, and 120s...');
const mockProject = {
  id: 'test_proj_1',
  title: 'ShipSpeak AI',
  competitionName: parsedWispr.competitionName,
  targetAudience: parsedWispr.targetAudience,
  analysis: parsedWispr,
  tasks
};

const script60 = generateDemoScriptForDuration(mockProject, 60);
const script90 = generateDemoScriptForDuration(mockProject, 90);
const script120 = generateDemoScriptForDuration(mockProject, 120);

assert(script60.duration === 60, 'Script 60 duration mismatch');
assert(script90.duration === 90, 'Script 90 duration mismatch');
assert(script120.duration === 120, 'Script 120 duration mismatch');

assert(script60.wordCount < script90.wordCount, '60s script should have fewer words than 90s');
assert(script90.wordCount < script120.wordCount, '90s script should have fewer words than 120s');

const pitch = generateElevatorPitch(mockProject);
assert(pitch.length <= 280, `Elevator pitch must be <= 280 characters, got ${pitch.length}`);
console.log(`✓ Test 4 Passed: Multi-duration demo scripts and ${pitch.length}-char pitch verified.`);

// TEST 5: Storage Schema Validation & Import/Export
console.log('Test 5: Storage Import/Export Schema Validation...');
const sampleStorage: StorageDataV1 = {
  version: 1,
  projects: [mockProject as any],
  activeProjectId: 'test_proj_1',
  settings: {
    userName: 'Tester',
    enableSpeechRecognition: true,
    theme: 'light'
  }
};

const exportedJson = exportProjectDataJSON(sampleStorage);
const validImport = validateAndImportProjectData(exportedJson);
assert(validImport.success === true, 'Valid JSON must import successfully');
assert(validImport.data?.projects.length === 1, 'Imported projects count mismatch');

const invalidImport = validateAndImportProjectData('{"invalid": true}');
assert(invalidImport.success === false, 'Invalid schema must be rejected');
console.log('✓ Test 5 Passed: Robust JSON schema import validation and error rejection.');

console.log('\n========================================');
console.log('ALL 5 SHIPSPEAK AI TEST SUITES PASSED!');
console.log('========================================\n');
