/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleBrief {
  id: string;
  name: string;
  tagline: string;
  rawText: string;
}

export const SAMPLE_BRIEFS: SampleBrief[] = [
  {
    id: 'wispr-challenge',
    name: 'No Hands: The Wispr Challenge by WeMakeDevs x Wispr Flow',
    tagline: 'The official voice-first challenge for builders using Wispr Flow',
    rawText: `COMPETITION BRIEF: No Hands: The Wispr Challenge
ORGANIZERS: WeMakeDevs x Wispr Flow
SUBMISSION DEADLINE: November 15, 2026 at 11:59 PM PST
REGISTRATION DEADLINE: November 10, 2026 at 11:59 PM PST

1. ABOUT THE CHALLENGE
Voice is the most natural human interface, yet developers and knowledge workers spend hours typing out repetitive project plans, sprint backlogs, and submission forms. "No Hands: The Wispr Challenge" invites creators and engineers to build innovative productivity, developer tools, or workflow automation applications powered by Wispr Flow's effortless voice dictation.

2. PROBLEM STATEMENT
Hackathon participants and fast-moving teams lose up to 30% of their critical shipping window wrestling with sprawling competition rules, parsing complex criteria, setting up project roadmaps, and creating submission artifacts. We need a voice-first workspace that turns spoken project ideas and long challenge briefs into actionable sprint tasks, submission checklists, and timed demo scripts.

3. TARGET AUDIENCE
Solo hackathon participants, engineering teams, tech student builders, and product developers who want to maximize building time and never miss a competition deadline or rubric requirement.

4. ELIGIBILITY RULES
- Open to individual builders and teams of up to 4 members worldwide.
- Submissions must be original work created during the hackathon timeline.
- Projects must integrate or showcase Wispr Flow voice dictation or hands-free input workflows.
- Submissions must be in English.

5. REQUIRED DELIVERABLES
Every participant must submit:
1. Working Project Link: Hosted, accessible web or mobile application URL.
2. Public GitHub Repository: Clean codebase with open source license and comprehensive README with setup instructions.
3. 2-Minute Demo Video: An unedited or polished video walkthrough (maximum 120 seconds, hosted on YouTube, Loom, or Vimeo) demonstrating the problem, solution, and voice input in action.
4. Wispr Flow Usage Evidence: Screen recording or screenshot showing genuine Wispr Flow usage or voice dictation in the build/planning workflow.
5. Project Documentation: Clear description including problem solved, features implemented, and architecture.

6. REQUIRED TECHNOLOGY & TOOLS
- Wispr Flow for voice dictation and hands-free prompt/input generation.
- Modern web framework (React / Next.js / TypeScript recommended).
- Vercel or Cloud hosting for live web deployment.

7. JUDGING CRITERIA
- Innovation & Voice Integration (25%): How effectively does the project leverage voice and hands-free workflows to solve a real developer problem?
- Technical Execution & Polish (25%): Code quality, responsiveness, robust error handling, and visual design standards.
- Problem Impact & Usability (25%): Does it tangibly accelerate shipping speed and prevent submission mistakes?
- Demo Video & Presentation (25%): Clear, punchy, timed walkthrough adhering strictly to the 2-minute limit.

8. PRIZES
- 1st Place: $5,000 USD + 1 Year Wispr Flow Pro subscription + WeMakeDevs showcase.
- 2nd Place: $3,000 USD + 1 Year Wispr Flow Pro subscription.
- 3rd Place: $1,500 USD + 6 Months Wispr Flow Pro subscription.
- Best Voice UI Innovation: $1,000 USD special award.

9. SUBMISSION INSTRUCTIONS
Submit your project via the official WeMakeDevs portal before November 15, 2026, 11:59 PM PST. Include your live deployment URL, GitHub repository link, demo video link, and Wispr Flow verification asset. Late submissions will not be scored.`
  },
  {
    id: 'featherless-challenge',
    name: 'Featherless AI Developer Challenge 2026',
    tagline: 'Build next-generation AI apps with open-weight models',
    rawText: `COMPETITION BRIEF: Featherless AI Developer Challenge 2026
ORGANIZER: Featherless AI
SUBMISSION DEADLINE: December 1, 2026 at 5:00 PM EST
REGISTRATION DEADLINE: November 25, 2026

1. CHALLENGE OVERVIEW
Developers worldwide are challenged to build multimodal AI web applications that leverage the Featherless AI API to solve pressing workflow bottlenecks for creators, researchers, and engineers.

2. PROBLEM STATEMENT
Modern knowledge workers struggle with context switching across documents, voice memos, and code repositories. We challenge you to build an intuitive workspace that digests multimodal inputs and outputs structured, reliable actions.

3. TARGET AUDIENCE
Developers, students, data analysts, and enterprise knowledge workers.

4. ELIGIBILITY
- Age 18+ worldwide (void where prohibited).
- Solo or teams up to 5 members.
- Free tier Featherless API keys eligible.

5. REQUIRED DELIVERABLES
- Working public application URL.
- Public GitHub repository with open MIT license.
- Video demonstration under 3 minutes (YouTube or Google Drive).
- Architecture diagram and technical README explaining prompt grounding and safety filters.

6. REQUIRED TECH
- Featherless AI API (OpenAI-compatible SDK).
- TypeScript / React / Node or Python backend.

7. JUDGING CRITERIA
- Technical Depth (30%): Proper integration of Featherless structured outputs and system instructions.
- User Experience & Design (25%): Clean, intuitive, accessible user interface.
- Real-World Utility (25%): Practicality and business/developer value.
- Creativity (20%): Originality of the concept.

8. PRIZES
Total prize pool: $50,000 USD distributed across top 5 finalists.`
  },
  {
    id: 'ethglobal-hackathon',
    name: 'Autonomous Agent Buildathon 2026',
    tagline: 'Collaborative autonomous tools for distributed teams',
    rawText: `COMPETITION BRIEF: Autonomous Agent Buildathon 2026
ORGANIZER: Open Dev Alliance
SUBMISSION DEADLINE: October 30, 2026 at 23:59 UTC
REGISTRATION DEADLINE: October 20, 2026

1. CHALLENGE GOAL
Build transparent, verifiable agentic tools that break down ambiguous product requirements into executable engineering sprints.

2. TARGET AUDIENCE
Distributed open source engineering teams and hackathon squads.

3. DELIVERABLES
- Live application demo link
- GitHub repository with automated test suite
- 90-second screen recording showing end-to-end task generation
- Comprehensive README with local setup instructions

4. JUDGING CRITERIA
- Reliability: Zero hallucinated tasks or deadlines.
- Performance: Sub-second response times on client devices.
- Design: Clean modern UI with zero clutter.

5. PRIZES
$10,000 in ecosystem grants and mentorship.`
  }
];
