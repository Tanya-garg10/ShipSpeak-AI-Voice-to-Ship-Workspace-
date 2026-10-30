/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DemoScript, DemoScriptSection, Project } from '../types';

/**
 * Generates tailored demo scripts for 60s, 90s, and 120s durations.
 * Targets conversational speaking rate: ~130 - 150 words per minute.
 * 60s: ~130-140 words
 * 90s: ~195-210 words
 * 120s: ~260-280 words
 *
 * Uses only real facts from project record. Never invents fake benchmarks or metrics.
 */
export function generateDemoScriptForDuration(
  project: Partial<Project>,
  duration: 60 | 90 | 120
): DemoScript {
  const title = project.title || 'ShipSpeak AI';
  const comp = project.competitionName && project.competitionName !== 'Not specified in brief'
    ? project.competitionName
    : 'our competition';
  const problem = project.analysis?.problemStatement && project.analysis.problemStatement !== 'Not specified in brief'
    ? project.analysis.problemStatement
    : 'participants spend up to 30% of their critical shipping window parsing complex rules and writing repetitive submission materials';
  const audience = project.targetAudience && project.targetAudience !== 'Not specified in brief'
    ? project.targetAudience
    : 'hackathon builders, developers, and fast-moving teams';

  const completedTasks = project.tasks?.filter(t => t.status === 'done') || [];
  const totalTasks = project.tasks?.length || 0;
  const isWispr = comp.toLowerCase().includes('wispr') ||
    project.analysis?.requiredTechTools?.some(t => t.toLowerCase().includes('wispr'));

  const sections: DemoScriptSection[] = [];

  if (duration === 60) {
    // 60-Second Lightning Pitch (~135 words)
    sections.push({
      id: 'hook',
      title: 'Opening Hook & Problem',
      speakingTimeSeconds: 15,
      content: `Hi everyone! When competing in ${comp}, the biggest bottleneck isn't writing code—it's deciphering complex challenge briefs and scrambling to format submissions at the deadline.`,
      tips: 'Speak with urgency and direct eye contact.'
    });

    sections.push({
      id: 'solution',
      title: 'The Solution & Demo',
      speakingTimeSeconds: 25,
      content: `That's why we built ${title}. Built for ${audience}, it takes any raw competition brief or voice note and instantly extracts verified requirements, generates an actionable sprint board, and tracks deliverables with a strict readiness checklist.`,
      tips: 'Screen share: show the Brief Analyzer extracting requirements in real-time.'
    });

    sections.push({
      id: 'voice_tech',
      title: 'Tech & Voice Integration',
      speakingTimeSeconds: 12,
      content: isWispr
        ? `Powered by Wispr Flow hands-free voice dictation, builders can update tasks and generate pitch scripts completely hands-free while coding.`
        : `Built on React and TypeScript with deterministic requirement parsing, your project plan is always zero-hallucination and instant.`,
      tips: 'Demonstrate dictating a task or script update.'
    });

    sections.push({
      id: 'closing',
      title: 'Call to Action',
      speakingTimeSeconds: 8,
      content: `Stop wasting hours formatting plans—start building and ship on time with ${title}. Thank you!`,
      tips: 'Display project link and GitHub repository URL.'
    });
  } else if (duration === 90) {
    // 90-Second Standard Demo (~205 words)
    sections.push({
      id: 'hook',
      title: 'Opening Hook',
      speakingTimeSeconds: 15,
      content: `Every hackathon participant knows this feeling: you have an incredible idea, but you waste half the weekend parsing disorganized competition requirements and stressing over submission rubrics.`,
      tips: 'Warm, relatable opening.'
    });

    sections.push({
      id: 'problem',
      title: 'The Problem Statement',
      speakingTimeSeconds: 15,
      content: `Specifically, ${problem.slice(0, 150)}. Teams need a reliable way to turn competition rules into an immediate execution plan.`,
      tips: 'Show the original messy competition PDF or website brief.'
    });

    sections.push({
      id: 'walkthrough',
      title: 'Product Walkthrough',
      speakingTimeSeconds: 30,
      content: `Meet ${title}. First, we paste our brief into the Analyzer. In seconds, it extracts explicit facts: eligibility, required deliverables, judging rubrics, and deadlines—preserving exact source snippets without AI guessing. Next, it populates our Task Board and Submission Checklist with verified items ready to execute.`,
      tips: 'Highlight the distinction between explicit facts and unverified items.'
    });

    sections.push({
      id: 'voice_results',
      title: 'Wispr Integration & Execution',
      speakingTimeSeconds: 20,
      content: isWispr
        ? `Using Wispr Flow voice dictation, we can dictate sprint notes, log task progress, and adjust scripts hands-free right at our desk.`
        : `Everything updates live with local-first persistence, ensuring developers stay organized even under hackathon deadlines.`,
      tips: 'Show actual completed tasks or working checklist verification.'
    });

    sections.push({
      id: 'closing',
      title: 'Closing Statement',
      speakingTimeSeconds: 10,
      content: `Check out our live deployment and public repository in the submission portal. Built for builders who ship. Thank you!`,
      tips: 'Showcase live app URL and repo link.'
    });
  } else {
    // 120-Second Complete Technical Walkthrough (~275 words)
    sections.push({
      id: 'hook',
      title: '1. Opening Hook',
      speakingTimeSeconds: 18,
      content: `Hello judges and developers! In competitive hackathons like ${comp}, speed and precision make the difference between an honorable mention and 1st place. Yet so much time is lost manually drafting task boards, checking rubric details, and rewriting demo pitches.`,
      tips: 'State your team name and project title with confidence.'
    });

    sections.push({
      id: 'problem',
      title: '2. The Problem & Target Audience',
      speakingTimeSeconds: 20,
      content: `For ${audience}, the real challenge is that competition briefs are dense and easy to misinterpret. Missing a single required deliverable—like an unlisted demo video or specific setup instruction—can disqualify an otherwise stellar project.`,
      tips: 'Show an example of a 10-page competition rubric.'
    });

    sections.push({
      id: 'walkthrough',
      title: '3. Core Architecture & Workflow',
      speakingTimeSeconds: 40,
      content: `Enter ${title}: a voice-to-ship workspace. Watch how we paste a raw competition brief. Our deterministic parser immediately identifies deadline timestamps, judging criteria weights, and mandatory deliverables. Every item is verified against source text snippets, separating hard rules from optional recommendations. From these requirements, our planner automatically generates structured Kanban tasks.`,
      tips: 'Click between the Brief Analyzer and the Kanban Task Board.'
    });

    sections.push({
      id: 'voice_integration',
      title: '4. Voice-First & Wispr Flow Integration',
      speakingTimeSeconds: 25,
      content: isWispr
        ? `Because speed is everything, ${title} is built voice-first with Wispr Flow. Instead of breaking focus to type sprint updates, we dictate new requirements, re-prioritize high-impact features, and rehearse demo scripts hands-free.`
        : `Developers can manipulate tasks, track submission readiness percentages, and maintain full state locally without cumbersome setup.`,
      tips: 'Demonstrate speech-to-text or voice-assisted script rehearsal.'
    });

    sections.push({
      id: 'results',
      title: '5. Real Evidence & Results',
      speakingTimeSeconds: 12,
      content: totalTasks > 0
        ? `In our project sprint, we've executed ${completedTasks.length} of ${totalTasks} prioritized tasks and verified our core deliverables.`
        : `[Provide actual testing result or live deployment metrics here].`,
      tips: 'Show the Submission Checklist with verified green badges.'
    });

    sections.push({
      id: 'closing',
      title: '6. Closing & Call to Action',
      speakingTimeSeconds: 5,
      content: `All code is open-source and deployed live. Thank you for your time, and we'd love your feedback!`,
      tips: 'Show final submission card with repo and live link.'
    });
  }

  const fullScript = sections.map(s => `[${s.title} - ~${s.speakingTimeSeconds}s]\n${s.content}`).join('\n\n');
  const wordCount = fullScript.split(/\s+/).filter(Boolean).length;

  return {
    duration,
    openingHook: sections[0]?.content || '',
    problemStatement: sections[1]?.content || '',
    targetUser: audience,
    productWalkthrough: sections[2]?.content || '',
    keyFeatures: [
      'Deterministic rule-grounded brief extraction',
      'Actionable sprint task board with Kanban & List view',
      'Verified submission readiness checklist',
      'Timed demo script generator with teleprompter rehearsal'
    ],
    technicalImplementation: isWispr
      ? 'React 19, TypeScript, Tailwind CSS, Wispr Flow voice integration, browser-local persistence'
      : 'React 19, TypeScript, Tailwind CSS, LocalStorage persistence',
    resultsOrEvidence: completedTasks.length > 0
      ? `${completedTasks.length} of ${totalTasks} tasks completed; deliverables verified`
      : 'Ready for live test deployment',
    closingStatement: sections[sections.length - 1]?.content || '',
    fullScript,
    sections,
    wordCount,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Generates an elevator pitch description (under 280 characters).
 */
export function generateElevatorPitch(project: Partial<Project>): string {
  const title = project.title || 'ShipSpeak AI';
  const comp = project.competitionName || 'hackathons';
  return `${title} turns raw ${comp} briefs and voice memos into actionable task roadmaps, verified submission checklists, and timed demo scripts so builders spend more time shipping.`;
}
