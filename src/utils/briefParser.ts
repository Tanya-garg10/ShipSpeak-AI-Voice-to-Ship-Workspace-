/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ExtractedBriefData,
  ExtractedRequirement,
  JudgingCriterion,
  Task,
  ChecklistItem
} from '../types';

/**
 * Deterministic, rule-grounded parser for hackathon & competition briefs.
 * It extracts only explicit facts matching patterns, preserves exact source snippets,
 * and sets explicit confidence flags so nothing is hallucinated.
 */
export function parseBriefDeterministic(rawText: string): ExtractedBriefData {
  const text = rawText.trim();
  const requirementsList: ExtractedRequirement[] = [];

  // 1. Competition Name
  let competitionName = 'Not specified in brief';
  let compSnippet = '';
  let compConfidence: ExtractedRequirement['confidence'] = 'low';
  let compExplicit = false;

  const compMatch = text.match(/(?:COMPETITION BRIEF|CHALLENGE BRIEF|HACKATHON|EVENT|CHALLENGE NAME|CHALLENGE):\s*([^\n\r]+)/i)
    || text.match(/^(?:COMPETITION BRIEF:\s*)([^\n\r]+)/im)
    || text.match(/#\s*(?:Welcome to\s+)?([^\n\r#]+hackathon|[^\n\r#]+challenge|[^\n\r#]+competition)/i);

  if (compMatch && compMatch[1]?.trim()) {
    competitionName = compMatch[1].trim().replace(/^[:\-\s]+/, '');
    compSnippet = compMatch[0].trim();
    compConfidence = 'high';
    compExplicit = true;
  } else {
    // Fallback: check first line if it looks like a title
    const firstLine = text.split('\n')[0]?.trim();
    if (firstLine && firstLine.length < 90 && !firstLine.includes('.')) {
      competitionName = firstLine;
      compSnippet = firstLine;
      compConfidence = 'medium';
      compExplicit = false;
    }
  }

  requirementsList.push({
    id: 'req_comp_name',
    category: 'competition',
    key: 'competitionName',
    label: 'Competition Name',
    value: competitionName,
    sourceSnippet: compSnippet || 'No direct title keyword found.',
    confidence: compConfidence,
    isExplicit: compExplicit
  });

  // 2. Deadlines
  let submissionDeadline = 'Not specified in brief';
  let subSnippet = '';
  let subExplicit = false;

  const subDeadlineMatch = text.match(/(?:SUBMISSION DEADLINE|SUBMIT BY|DEADLINE|CLOSING DATE|FINAL SUBMISSION|DUE DATE):\s*([^\n\r]+)/i)
    || text.match(/(?:Submissions close on|Submit before|Submissions due by)\s*([^\n\r.]+)/i);

  if (subDeadlineMatch && subDeadlineMatch[1]?.trim()) {
    submissionDeadline = subDeadlineMatch[1].trim();
    subSnippet = subDeadlineMatch[0].trim();
    subExplicit = true;
  }

  requirementsList.push({
    id: 'req_sub_deadline',
    category: 'deadline',
    key: 'submissionDeadline',
    label: 'Submission Deadline',
    value: submissionDeadline,
    sourceSnippet: subSnippet || 'No explicit submission deadline string matched.',
    confidence: subExplicit ? 'high' : 'low',
    isExplicit: subExplicit
  });

  let registrationDeadline = 'Not specified in brief';
  let regSnippet = '';
  let regExplicit = false;

  const regDeadlineMatch = text.match(/(?:REGISTRATION DEADLINE|REGISTER BY|RSVP BY):\s*([^\n\r]+)/i)
    || text.match(/(?:Registration closes on|Register before)\s*([^\n\r.]+)/i);

  if (regDeadlineMatch && regDeadlineMatch[1]?.trim()) {
    registrationDeadline = regDeadlineMatch[1].trim();
    regSnippet = regDeadlineMatch[0].trim();
    regExplicit = true;
  }

  requirementsList.push({
    id: 'req_reg_deadline',
    category: 'deadline',
    key: 'registrationDeadline',
    label: 'Registration Deadline',
    value: registrationDeadline,
    sourceSnippet: regSnippet || 'No explicit registration deadline string matched.',
    confidence: regExplicit ? 'high' : 'low',
    isExplicit: regExplicit
  });

  // Section boundary keywords for hackathon briefs
  const sectionKeywords = 'ABOUT|PROBLEM|TARGET|ELIGIBILITY|REQUIRED\\s+DELIVERABLES|DELIVERABLES|REQUIRED\\s+TECH|TECHNICAL|TOOLS|JUDGING|PRIZES|AWARDS|SUBMISSION';

  // Helper to extract sections whether formatted with colons or numbers/newlines
  const extractSection = (headerRegexStr: string, stopRegexStr: string = `[0-9]+\\.\\s*(?:${sectionKeywords})|\\b[A-Z\\s]{4,}:`) => {
    const reg = new RegExp(`(?:^|\\n)\\s*(?:[0-9]+\\.\\s*)?(?:${headerRegexStr})(?::|\\s*\\n)([\\s\\S]*?)(?=(?:\\n\\s*(?:${stopRegexStr})|$))`, 'i');
    const match = text.match(reg);
    if (match && match[1]?.trim()) {
      return {
        content: match[1].trim(),
        snippet: match[0].slice(0, 300).trim()
      };
    }
    return null;
  };

  // 3. Problem Statement
  let problemStatement = 'Not specified in brief';
  let probSnippet = '';
  let probExplicit = false;

  const probRes = extractSection('PROBLEM STATEMENT|THE PROBLEM|THE CHALLENGE|CHALLENGE OVERVIEW|CHALLENGE GOAL|ABOUT THE CHALLENGE');
  if (probRes) {
    problemStatement = probRes.content.slice(0, 500);
    probSnippet = probRes.snippet;
    probExplicit = true;
  }

  requirementsList.push({
    id: 'req_problem_stmt',
    category: 'problem',
    key: 'problemStatement',
    label: 'Problem Statement',
    value: problemStatement,
    sourceSnippet: probSnippet || 'No explicit problem section header located.',
    confidence: probExplicit ? 'high' : 'low',
    isExplicit: probExplicit
  });

  // 4. Target Audience
  let targetAudience = 'Not specified in brief';
  let audSnippet = '';
  let audExplicit = false;

  const audRes = extractSection('TARGET AUDIENCE|WHO IS THIS FOR|AUDIENCE|USER BASE');
  if (audRes) {
    targetAudience = audRes.content.slice(0, 300);
    audSnippet = audRes.snippet;
    audExplicit = true;
  }

  requirementsList.push({
    id: 'req_target_audience',
    category: 'problem',
    key: 'targetAudience',
    label: 'Target Audience',
    value: targetAudience,
    sourceSnippet: audSnippet || 'Not explicitly broken out in text.',
    confidence: audExplicit ? 'high' : 'low',
    isExplicit: audExplicit
  });

  // 5. Eligibility Rules
  const eligibilityRules: string[] = [];
  const eligRes = extractSection('ELIGIBILITY(?: RULES)?|WHO CAN ENTER|PARTICIPATION RULES');
  if (eligRes) {
    const lines = eligRes.content
      .split('\n')
      .map(l => l.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter(l => l.length > 5);
    eligibilityRules.push(...lines);
  }

  requirementsList.push({
    id: 'req_eligibility',
    category: 'eligibility',
    key: 'eligibilityRules',
    label: 'Eligibility Rules',
    value: eligibilityRules.length > 0 ? eligibilityRules.join('\n') : 'Not specified in brief',
    sourceSnippet: eligRes ? eligRes.snippet : 'No eligibility header located.',
    confidence: eligibilityRules.length > 0 ? 'high' : 'low',
    isExplicit: eligibilityRules.length > 0
  });

  // 6. Required Deliverables
  const requiredDeliverables: string[] = [];
  const delivRes = extractSection('REQUIRED DELIVERABLES|DELIVERABLES|SUBMISSION REQUIREMENTS|WHAT TO SUBMIT');
  if (delivRes) {
    const lines = delivRes.content
      .split('\n')
      .map(l => l.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter(l => l.length > 4 && !l.endsWith(':') && !l.toLowerCase().startsWith('every participant'));
    requiredDeliverables.push(...lines);
  } else {
    // Keyword scan for common deliverables
    if (/demo video|video walkthrough|loom|youtube/i.test(text)) {
      requiredDeliverables.push('Demo video walkthrough');
    }
    if (/github|repository|repo|open source/i.test(text)) {
      requiredDeliverables.push('Public GitHub repository with README');
    }
    if (/working project|live url|hosted|deployment/i.test(text)) {
      requiredDeliverables.push('Working live project deployment URL');
    }
  }

  requirementsList.push({
    id: 'req_deliverables',
    category: 'deliverables',
    key: 'requiredDeliverables',
    label: 'Required Deliverables',
    value: requiredDeliverables.length > 0 ? requiredDeliverables.join('\n') : 'Not specified in brief',
    sourceSnippet: delivRes ? delivRes.snippet : 'Extracted via keyword matching or not specified.',
    confidence: delivRes ? 'high' : (requiredDeliverables.length > 0 ? 'medium' : 'low'),
    isExplicit: Boolean(delivRes)
  });

  // 7. Required Technology or Tools
  const requiredTechTools: string[] = [];
  const techRes = extractSection('REQUIRED TECH(?:NOLOGY)?(?: & TOOLS)?|TOOLS|STACK|TECHNICAL REQUIREMENTS');
  if (techRes) {
    const lines = techRes.content
      .split('\n')
      .map(l => l.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter(l => l.length > 3);
    requiredTechTools.push(...lines);
  } else {
    // Detect mentions of Wispr, Featherless, React, etc.
    if (/wispr flow/i.test(text)) requiredTechTools.push('Wispr Flow (Voice dictation)');
    if (/featherless/i.test(text)) requiredTechTools.push('Featherless AI API');
    if (/typescript/i.test(text)) requiredTechTools.push('TypeScript');
    if (/react/i.test(text)) requiredTechTools.push('React');
  }

  requirementsList.push({
    id: 'req_tech',
    category: 'tech',
    key: 'requiredTechTools',
    label: 'Required Tech & Tools',
    value: requiredTechTools.length > 0 ? requiredTechTools.join(', ') : 'Not specified in brief',
    sourceSnippet: techRes ? techRes.snippet : 'Detected from brief context keywords.',
    confidence: techRes ? 'high' : (requiredTechTools.length > 0 ? 'medium' : 'low'),
    isExplicit: Boolean(techRes)
  });

  // 8. Judging Criteria
  const judgingCriteria: JudgingCriterion[] = [];
  const judgeRes = extractSection('JUDGING CRITERIA|EVALUATION CRITERIA|SCORING RUBRIC|HOW YOU WILL BE SCORED');
  if (judgeRes) {
    const lines = judgeRes.content
      .split('\n')
      .map(l => l.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter(l => l.length > 4);

    lines.forEach((line, idx) => {
      const parts = line.split(/:\s*|\s*-\s*|\s*\(/);
      const criterion = parts[0]?.replace(/[()]/g, '').trim() || line;
      const weight = line.includes('%')
        ? (line.match(/\d+%/)?.[0] || 'Weighted')
        : (parts[1]?.trim() || 'Evaluated');
      judgingCriteria.push({
        id: `judge_${idx}`,
        criterion,
        weightOrDescription: line,
        sourceSnippet: line
      });
    });
  }

  requirementsList.push({
    id: 'req_judging',
    category: 'judging',
    key: 'judgingCriteria',
    label: 'Judging Criteria',
    value: judgingCriteria.length > 0
      ? judgingCriteria.map(j => `• ${j.criterion} (${j.weightOrDescription})`).join('\n')
      : 'Not specified in brief',
    sourceSnippet: judgeRes ? judgeRes.snippet : 'No scoring section located.',
    confidence: judgingCriteria.length > 0 ? 'high' : 'low',
    isExplicit: judgingCriteria.length > 0
  });

  // 9. Demo Video Requirements
  let demoVideoRequirements = 'Not specified in brief';
  let videoSnippet = '';
  let videoExplicit = false;

  const videoMatch = text.match(/(?:(?:DEMO VIDEO|VIDEO WALKTHROUGH|VIDEO REQUIREMENTS|RECORDING)[:\s]+)([^\n\r]+(?:\n[^\n\r]+)?)/i)
    || text.match(/(?:[0-9]+\s*(?:minute|min|second|sec)\s*demo video[^\n\r.]+)/i);

  if (videoMatch && videoMatch[0]?.trim()) {
    demoVideoRequirements = videoMatch[0].trim();
    videoSnippet = videoMatch[0].trim();
    videoExplicit = true;
  }

  requirementsList.push({
    id: 'req_video',
    category: 'video',
    key: 'demoVideoRequirements',
    label: 'Demo Video Requirements',
    value: demoVideoRequirements,
    sourceSnippet: videoSnippet || 'No video-specific constraint found.',
    confidence: videoExplicit ? 'high' : 'low',
    isExplicit: videoExplicit
  });

  // 10. Working Project Link Requirements
  let workingProjectLinkRequirements = 'Not specified in brief';
  let linkSnippet = '';
  let linkExplicit = false;

  const linkMatch = text.match(/(?:WORKING PROJECT LINK|LIVE URL|DEPLOYMENT|HOSTING REQUIREMENTS)[:\s]+([^\n\r]+)/i)
    || text.match(/(?:Hosted, accessible web or mobile application URL[^\n\r]*)/i);

  if (linkMatch && linkMatch[0]?.trim()) {
    workingProjectLinkRequirements = linkMatch[0].trim();
    linkSnippet = linkMatch[0].trim();
    linkExplicit = true;
  }

  requirementsList.push({
    id: 'req_link',
    category: 'links',
    key: 'workingProjectLinkRequirements',
    label: 'Working Project URL Requirements',
    value: workingProjectLinkRequirements,
    sourceSnippet: linkSnippet || 'No specific hosting restrictions found.',
    confidence: linkExplicit ? 'high' : 'low',
    isExplicit: linkExplicit
  });

  // 11. Documentation & Evidence Requirements
  let documentationRequirements = 'Not specified in brief';
  let docSnippet = '';
  let docExplicit = false;

  const docMatch = text.match(/(?:DOCUMENTATION|EVIDENCE REQUIREMENTS|README REQUIREMENTS|USAGE CARD)[:\s]+([^\n\r]+(?:\n[^\n\r]+)?)/i)
    || text.match(/(?:Wispr Flow Usage Evidence[^\n\r]+(?:\n[^\n\r]+)?)/i);

  if (docMatch && docMatch[0]?.trim()) {
    documentationRequirements = docMatch[0].trim();
    docSnippet = docMatch[0].trim();
    docExplicit = true;
  }

  requirementsList.push({
    id: 'req_docs',
    category: 'docs',
    key: 'documentationRequirements',
    label: 'Documentation & Evidence Requirements',
    value: documentationRequirements,
    sourceSnippet: docSnippet || 'No specific documentation block found.',
    confidence: docExplicit ? 'high' : 'low',
    isExplicit: docExplicit
  });

  // 12. Submission Instructions
  let submissionInstructions = 'Not specified in brief';
  let insSnippet = '';
  let insExplicit = false;

  const insRes = extractSection('SUBMISSION INSTRUCTIONS|HOW TO SUBMIT|SUBMISSION PORTAL|SUBMISSION PROCEDURE');
  if (insRes) {
    submissionInstructions = insRes.content.slice(0, 450);
    insSnippet = insRes.snippet;
    insExplicit = true;
  }

  requirementsList.push({
    id: 'req_instructions',
    category: 'submission',
    key: 'submissionInstructions',
    label: 'Submission Instructions',
    value: submissionInstructions,
    sourceSnippet: insSnippet || 'Not found in provided text.',
    confidence: insExplicit ? 'high' : 'low',
    isExplicit: insExplicit
  });

  // 13. Prize Information
  let prizeInformation = 'Not specified in brief';
  let prizeSnippet = '';
  let prizeExplicit = false;

  const prizeRes = extractSection('PRIZES|PRIZE POOL|AWARDS|AWARDS & PRIZES');
  if (prizeRes) {
    prizeInformation = prizeRes.content.slice(0, 450);
    prizeSnippet = prizeRes.snippet;
    prizeExplicit = true;
  }

  requirementsList.push({
    id: 'req_prize',
    category: 'prize',
    key: 'prizeInformation',
    label: 'Prize Information',
    value: prizeInformation,
    sourceSnippet: prizeSnippet || 'No prizes mentioned.',
    confidence: prizeExplicit ? 'high' : 'low',
    isExplicit: prizeExplicit
  });

  return {
    competitionName,
    problemStatement,
    targetAudience,
    registrationDeadline,
    submissionDeadline,
    eligibilityRules,
    requiredTechTools,
    requiredDeliverables,
    judgingCriteria,
    demoVideoRequirements,
    workingProjectLinkRequirements,
    documentationRequirements,
    submissionInstructions,
    prizeInformation,
    requirementsList,
    analyzedAt: new Date().toISOString(),
    parserMode: 'deterministic'
  };
}

/**
 * Generates an initial actionable task set grounded in the actual extracted requirements.
 */
export function generateTasksFromRequirements(
  projectId: string,
  analysis: ExtractedBriefData
): Task[] {
  const tasks: Task[] = [];
  const now = new Date().toISOString();

  // Task 1: Core problem solution
  tasks.push({
    id: `task_${Date.now()}_1`,
    projectId,
    title: 'Architect & Implement Core Solution Workflow',
    description: analysis.problemStatement !== 'Not specified in brief'
      ? `Solve core problem: ${analysis.problemStatement.slice(0, 160)}...`
      : 'Build the foundational workflow and user interface.',
    priority: 'high',
    status: 'in-progress',
    relatedRequirement: 'Problem Statement',
    isRecommended: false,
    createdAt: now,
    updatedAt: now
  });

  // Task 2: Required Deliverable - Live URL
  tasks.push({
    id: `task_${Date.now()}_2`,
    projectId,
    title: 'Deploy Production Web App with Live URL',
    description: analysis.workingProjectLinkRequirements !== 'Not specified in brief'
      ? analysis.workingProjectLinkRequirements
      : 'Deploy on Vercel or cloud provider and verify public reachability.',
    priority: 'high',
    status: 'todo',
    relatedRequirement: 'Required Deliverables: Live URL',
    isRecommended: false,
    createdAt: now,
    updatedAt: now
  });

  // Task 3: Required Deliverable - Public Repo & README
  tasks.push({
    id: `task_${Date.now()}_3`,
    projectId,
    title: 'Create Public GitHub Repository & Complete README',
    description: 'Ensure open-source license, local setup instructions, build steps, and environment variables (.env.example).',
    priority: 'high',
    status: 'todo',
    relatedRequirement: 'Required Deliverables: Code Repository',
    isRecommended: false,
    createdAt: now,
    updatedAt: now
  });

  // Task 4: Demo Video
  tasks.push({
    id: `task_${Date.now()}_4`,
    projectId,
    title: 'Record & Polish Demo Video Walkthrough',
    description: analysis.demoVideoRequirements !== 'Not specified in brief'
      ? `Adhere to requirement: ${analysis.demoVideoRequirements}`
      : 'Record clear, focused walkthrough covering problem, solution, and live feature demonstration.',
    priority: 'high',
    status: 'todo',
    relatedRequirement: 'Required Deliverables: Demo Video',
    isRecommended: false,
    createdAt: now,
    updatedAt: now
  });

  // Task 5: Wispr / Voice Evidence (if detected)
  if (
    analysis.competitionName.toLowerCase().includes('wispr') ||
    analysis.requiredTechTools.some(t => t.toLowerCase().includes('wispr')) ||
    analysis.documentationRequirements.toLowerCase().includes('wispr')
  ) {
    tasks.push({
      id: `task_${Date.now()}_5`,
      projectId,
      title: 'Capture Wispr Flow Voice Dictation Evidence',
      description: 'Record screen capture or screenshot showing hands-free voice dictation used in building or operating the app.',
      priority: 'high',
      status: 'todo',
      relatedRequirement: 'Documentation: Wispr Flow Usage Evidence',
      isRecommended: false,
      createdAt: now,
      updatedAt: now
    });
  }

  // Task 6: Judging Rubric Alignment Check
  if (analysis.judgingCriteria.length > 0) {
    tasks.push({
      id: `task_${Date.now()}_6`,
      projectId,
      title: 'Review Project Against Judging Criteria Rubric',
      description: `Verify project alignment with: ${analysis.judgingCriteria.map(j => j.criterion).slice(0, 3).join(', ')}.`,
      priority: 'medium',
      status: 'todo',
      relatedRequirement: 'Judging Criteria',
      isRecommended: true,
      createdAt: now,
      updatedAt: now
    });
  }

  // Task 7: Submission Dry Run
  tasks.push({
    id: `task_${Date.now()}_7`,
    projectId,
    title: 'Final Submission Form Dry Run',
    description: `Verify submission portal details before deadline (${analysis.submissionDeadline}). Ensure all required links are public.`,
    priority: 'high',
    status: 'todo',
    dueDate: analysis.submissionDeadline !== 'Not specified in brief' ? analysis.submissionDeadline : undefined,
    relatedRequirement: 'Submission Instructions',
    isRecommended: false,
    createdAt: now,
    updatedAt: now
  });

  return tasks;
}

/**
 * Generates initial submission checklist items tailored to competition deliverables.
 */
export function generateChecklistFromRequirements(
  projectId: string,
  analysis: ExtractedBriefData
): ChecklistItem[] {
  const isWisprChallenge =
    analysis.competitionName.toLowerCase().includes('wispr') ||
    analysis.requiredTechTools.some(t => t.toLowerCase().includes('wispr')) ||
    analysis.documentationRequirements.toLowerCase().includes('wispr');

  const items: ChecklistItem[] = [
    {
      id: `chk_${Date.now()}_1`,
      projectId,
      category: 'functionality',
      title: 'Core Feature Functionality Fully Tested',
      description: 'The core user workflow runs end-to-end without errors or console warnings.',
      isRequired: true,
      isCompleted: false
    },
    {
      id: `chk_${Date.now()}_2`,
      projectId,
      category: 'deliverable',
      title: 'Working Public Deployment URL',
      description: 'App is publicly hosted (e.g. Vercel, Cloud Run) and opens without authentication blocks.',
      isRequired: true,
      isCompleted: false
    },
    {
      id: `chk_${Date.now()}_3`,
      projectId,
      category: 'deliverable',
      title: 'Public GitHub Code Repository',
      description: 'Repository is public, clean, and contains all source code and assets.',
      isRequired: true,
      isCompleted: false
    },
    {
      id: `chk_${Date.now()}_4`,
      projectId,
      category: 'documentation',
      title: 'Comprehensive README & Local Setup Instructions',
      description: 'Clear documentation with architecture overview, environment setup (.env.example), and run commands.',
      isRequired: true,
      isCompleted: false
    },
    {
      id: `chk_${Date.now()}_5`,
      projectId,
      category: 'deliverable',
      title: analysis.demoVideoRequirements !== 'Not specified in brief'
        ? `Demo Video Walkthrough (${analysis.demoVideoRequirements.slice(0, 60)})`
        : 'Demo Video Walkthrough (Under 2 minutes)',
      description: 'Video clearly demonstrates problem solved, live product demo, and technical implementation.',
      isRequired: true,
      isCompleted: false
    }
  ];

  if (isWisprChallenge) {
    items.push({
      id: `chk_${Date.now()}_6`,
      projectId,
      category: 'wispr',
      title: 'Wispr Flow Usage Evidence Card / Recording',
      description: 'Screen recording or screenshot verifying genuine Wispr Flow voice dictation in action.',
      isRequired: true,
      isCompleted: false
    });
  }

  items.push(
    {
      id: `chk_${Date.now()}_7`,
      projectId,
      category: 'review',
      title: 'Project Description & Problem Statement Aligned',
      description: 'Submission text matches competition themes and clearly highlights target audience.',
      isRequired: true,
      isCompleted: false
    },
    {
      id: `chk_${Date.now()}_8`,
      projectId,
      category: 'review',
      title: 'Final Submission Form Verified & Submitted',
      description: 'All portal fields filled and submitted prior to official deadline cutoff.',
      isRequired: true,
      isCompleted: false
    }
  );

  return items;
}
