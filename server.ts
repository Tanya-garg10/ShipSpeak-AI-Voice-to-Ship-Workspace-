/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasFeatherlessKey: Boolean(process.env.FEATHERLESS_API_KEY),
    mode: isProd ? 'production' : 'development',
    timestamp: new Date().toISOString()
  });
});

// Secure server-side brief analysis route using Featherless API (if key available)
app.post('/api/analyze-brief', async (req, res) => {
  try {
    const { briefText } = req.body;
    if (!briefText || typeof briefText !== 'string' || briefText.trim().length === 0) {
      return res.status(400).json({ error: 'briefText string is required in request body.' });
    }

    const apiKey = process.env.FEATHERLESS_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        fallbackToDeterministic: true,
        message: 'No FEATHERLESS_API_KEY configured on server. Deterministic parser will be used.'
      });
    }

    const openai = new OpenAI({
      baseURL: 'https://api.featherless.ai/v1',
      apiKey: apiKey
    });

    const systemPrompt = `You are a strict, precise competition brief analyzer for hackathon builders.
Extract ONLY explicit facts from the provided competition brief.
Do not fabricate or guess any rules, deadlines, judging percentages, or prize amounts.
If a detail is missing or unspecified in the text, you MUST mark it as "Not specified in brief".
For each item, cite exact brief phrases where applicable.
Return the response as a valid JSON object with the following structure:
{
  "competitionName": "string",
  "problemStatement": "string",
  "targetAudience": "string",
  "registrationDeadline": "string",
  "submissionDeadline": "string",
  "eligibilityRules": ["string"],
  "requiredTechTools": ["string"],
  "requiredDeliverables": ["string"],
  "judgingCriteria": [{"criterion": "string", "weightOrDescription": "string"}],
  "demoVideoRequirements": "string",
  "workingProjectLinkRequirements": "string",
  "documentationRequirements": "string",
  "submissionInstructions": "string",
  "prizeInformation": "string"
}`;

    const response = await openai.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Analyze this competition brief:\n\n${briefText.slice(0, 15000)}`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const outputText = response.choices[0]?.message?.content;
    if (!outputText) {
      throw new Error('Featherless API returned an empty response.');
    }

    // Parse JSON from the response (handle potential markdown code blocks)
    const jsonMatch = outputText.match(/```json\s*([\s\S]*?)\s*```/) || outputText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : outputText;
    const parsedData = JSON.parse(jsonString);

    return res.json({
      success: true,
      data: parsedData,
      parserMode: 'ai-enhanced'
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-brief:', error);
    return res.status(500).json({
      success: false,
      fallbackToDeterministic: true,
      error: error?.message || 'Failed to analyze brief with AI.'
    });
  }
});

// Configure Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShipSpeak AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
