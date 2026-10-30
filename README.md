# ShipSpeak AI — Voice-to-Ship Workspace

**Turn Hackathon Briefs and Spoken Memos into Production Roadmaps, Sprint Boards, and Submission Artifacts.**

Built for **"No Hands: The Wispr Challenge by WeMakeDevs x Wispr Flow"**.

---

## 🚀 Overview

Hackathon builders lose up to 30% of their critical shipping window wrestling with sprawling competition PDFs, parsing vague rubrics, setting up sprint backlogs, and rewriting submission checklists at the final deadline.

**ShipSpeak AI** solves this with a voice-first, fact-grounded workspace:
1. **Brief-to-Build Analyzer**: Ingests complete hackathon briefs or spoken voice memos, extracting explicit rules, deadlines, deliverables, and judging criteria with verified source citations (zero AI guessing or fabricated facts).
2. **Smart Task Planner**: Generates actionable sprint tasks directly mapped to mandatory competition deliverables, with Kanban & List views, status transitions, priority filtering, and search.
3. **Submission Readiness Checklist**: Tracks verified deliverables (working URL, public repo, demo video, README, Wispr Flow evidence) with live readiness percentages and one-click Markdown summary generation.
4. **Demo Studio**: Generates 60s, 90s, and 120s paced demo scripts with an interactive rehearsal teleprompter and built-in browser SpeechSynthesis readback.
5. **Local-First & Private**: 100% browser `localStorage` persistence with JSON backup export and restore—no accounts or database setup required.
6. **Wispr Flow Integration**: Hands-free voice dictation supported across all inputs, task titles, and script notes.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion
- **Backend / Optional AI**: Node.js, Express, `@google/genai` (Gemini 3.8 Flash for optional deep brief analysis with seamless deterministic fallback)
- **Persistence**: HTML5 LocalStorage (Version 1 Schema) with JSON import/export
- **Voice / Speech**: Web Speech Recognition API & Web Speech Synthesis API + Wispr Flow desktop dictation compatibility
- **Deployment**: Vercel-ready with `vercel.json` SPA rewrite rules and full-stack Express support

---

## 📦 Getting Started Locally

### Prerequisites
- Node.js (version 20+ or 22+)
- npm (version 10+)

### 1. Installation
```bash
git clone https://github.com/example/shipspeak-ai.git
cd shipspeak-ai
npm install
```

### 2. Environment Setup (Optional)
ShipSpeak AI is **100% functional offline** without an API key using its deterministic parsing engine.
If you wish to enable the optional server-side Gemini 3.8 Flash analysis:
```bash
cp .env.example .env
# Edit .env and set GEMINI_API_KEY
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Tests
```bash
npm test
```
Runs the 5 automated test suites verifying date parsing, rubric weights, task generation, readiness calculation, and JSON storage schema validation.

### 5. Build for Production
```bash
npm run build
```

---

## ☁️ Vercel Deployment Instructions

ShipSpeak AI includes a preconfigured `vercel.json` for instant single-page application deployment:

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your ShipSpeak AI GitHub repository.
4. Keep the default settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Optional)* Add `GEMINI_API_KEY` to Environment Variables if enabling server-side AI parsing.
6. Click **"Deploy"**. Your live URL will be ready in under 60 seconds.

---

## 🎥 2-Minute Hackathon Demo Walkthrough Guide

When recording your 120-second video for the Wispr Challenge:

1. **[0:00 - 0:18] Opening Hook**: State the problem: hackathon participants lose hours parsing rules and scrambling to format submissions at the deadline.
2. **[0:18 - 0:40] Brief-to-Build Analyzer**: Open the Brief Analyzer. Show the "No Hands: The Wispr Challenge" sample brief or dictate a voice memo using Wispr Flow. Click "Analyze Brief" to reveal the extracted deadlines, required deliverables, and judging criteria with quoted source snippets.
3. **[0:40 - 1:05] Smart Task Planner**: Show the generated Kanban board. Move a task to "Done", switch to List view, filter by "High Priority", and dictate a new sprint task hands-free.
4. **[1:05 - 1:30] Submission Checklist**: Open the Submission Checklist. Demonstrate how checking off items updates the internal readiness percentage. Click "Copy Submission Summary" to show the formatted Markdown output.
5. **[1:30 - 1:55] Demo Studio & Teleprompter**: Select the 120-second tab in Demo Studio. Show the director cues, click "Listen Readback" or "Launch Rehearsal Teleprompter" with the live countdown timer.
6. **[1:55 - 2:00] Closing**: Highlight open-source code, local-first privacy, and provide the live URL.

---

## 🔒 Privacy & Zero-Hallucination Policy

- **No AI Slop / Fake Scores**: ShipSpeak AI never fabricates scores, deadlines, or rules. Unmentioned details are explicitly flagged as `"Not specified in brief"`.
- **Private by Design**: Data remains in your local browser storage. No unauthorized telemetry or tracking cookies.

---

## 📄 License
Apache-2.0
