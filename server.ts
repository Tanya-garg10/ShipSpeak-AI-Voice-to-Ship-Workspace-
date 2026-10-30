/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

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
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    mode: isProd ? 'production' : 'development',
    timestamp: new Date().toISOString()
  });
});

// Secure server-side brief analysis route using Gemini 3.8 Flash (if key available)
app.post('/api/analyze-brief', async (req, res) => {
  try {
    const { briefText } = req.body;
    if (!briefText || typeof briefText !== 'string' || briefText.trim().length === 0) {
      return res.status(400).json({ error: 'briefText string is required in request body.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        fallbackToDeterministic: true,
        message: 'No GEMINI_API_KEY configured on server. Deterministic parser will be used.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a strict, precise competition brief analyzer for hackathon builders.
Extract ONLY explicit facts from the provided competition brief.
Do not fabricate or guess any rules, deadlines, judging percentages, or prize amounts.
If a detail is missing or unspecified in the text, you MUST mark it as "Not specified in brief".
For each item, cite exact brief phrases where applicable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nAnalyze this competition brief:\n\n${briefText.slice(0, 15000)}`
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            competitionName: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            registrationDeadline: { type: Type.STRING },
            submissionDeadline: { type: Type.STRING },
            eligibilityRules: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            requiredTechTools: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            requiredDeliverables: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            judgingCriteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: { type: Type.STRING },
                  weightOrDescription: { type: Type.STRING }
                },
                required: ['criterion', 'weightOrDescription']
              }
            },
            demoVideoRequirements: { type: Type.STRING },
            workingProjectLinkRequirements: { type: Type.STRING },
            documentationRequirements: { type: Type.STRING },
            submissionInstructions: { type: Type.STRING },
            prizeInformation: { type: Type.STRING }
          },
          required: [
            'competitionName',
            'problemStatement',
            'targetAudience',
            'submissionDeadline',
            'requiredDeliverables'
          ]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsedData = JSON.parse(outputText);
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
