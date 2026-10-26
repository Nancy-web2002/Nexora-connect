import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  saveOpportunityPreference,
  getOpportunityPreferences,
} from './src/services/preferenceMemory.ts';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function getAuthenticatedUser(req: Request) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// AI Chat endpoint — forwards to the n8n workflow
app.post('/api/chat', async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const { message, history, context } = body;
  const sessionId = body.sessionId;

  const fallbackReply =
    'I can help you assess opportunities and plan next steps, but the AI workflow is temporarily unavailable. Please try again shortly and verify important details through official sources.';

  if (
    typeof message !== 'string' ||
    message.trim().length < 1 ||
    message.length > 2000
  ) {
    return res.status(400).json({
      reply: 'Please enter a message between 1 and 2000 characters.',
      suggestedPrompts: [],
      readyToDiscover: false,
      generatedBy: 'nexora-fallback',
    });
  }

  if (
    typeof sessionId !== 'string' ||
    sessionId.trim().length < 1 ||
    sessionId.trim().length > 64
  ) {
    return res.status(400).json({
      reply: 'Your chat session is missing. Please refresh the page and try again.',
      suggestedPrompts: [],
      readyToDiscover: false,
      generatedBy: 'nexora-fallback',
    });
  }

  const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    console.error('Chat workflow is not configured: webhook URL or secret is missing.');
    return res.json({
      reply: fallbackReply,
      suggestedPrompts: ['Find opportunities for me', 'Help me clarify my career goal'],
      readyToDiscover: false,
      generatedBy: 'nexora-fallback',
    });
  }

  const safeProfile = (() => {
    const profile = context?.userProfile;
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      return undefined;
    }

    const {
      email,
      avatarUrl,
      avatar_url,
      ...safe
    } = profile as Record<string, unknown>;

    return safe;
  })();

  const safeHistory = Array.isArray(history)
    ? history
        .filter(
          (item: any) =>
            item &&
            (item.role === 'user' || item.role === 'model') &&
            typeof item.content === 'string'
        )
        .slice(-6)
        .map((item: any) => ({
          role: item.role,
          content: item.content.slice(0, 2000),
        }))
    : [];

  try {
    const authenticatedUser = await getAuthenticatedUser(req);

    const savedPreferences = authenticatedUser
      ? getOpportunityPreferences(
          authenticatedUser.id,
          message.trim(),
        ).preferences
          .map((item) => item.content)
          .slice(0, 5)
      : [];

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nexora-secret': webhookSecret,
      },
      body: JSON.stringify({
        sessionId: sessionId.trim(),
        message: message.trim(),
        history: safeHistory,
        context: {
            ...(savedPreferences.length > 0
            ? { savedOpportunityPreferences: savedPreferences }
            : {}),
          ...(safeProfile ? { userProfile: safeProfile } : {}),
          ...(typeof context?.activeOpportunity === 'string'
            ? { activeOpportunity: context.activeOpportunity.slice(0, 500) }
            : {}),
        },
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (response.status === 400) {
      console.error('Chat workflow rejected the request with HTTP 400.');
      return res.json({
        reply: fallbackReply,
        suggestedPrompts: ['Find opportunities for me'],
        readyToDiscover: false,
        generatedBy: 'nexora-fallback',
      });
    }

    if (response.status === 401 || response.status === 403) {
      console.error('Chat workflow authentication failed. Check server-side secret configuration.');
      return res.json({
        reply: fallbackReply,
        suggestedPrompts: ['Find opportunities for me'],
        readyToDiscover: false,
        generatedBy: 'nexora-fallback',
      });
    }

    if (!response.ok) {
      console.error(`Chat workflow returned HTTP ${response.status}.`);
      return res.json({
        reply: fallbackReply,
        suggestedPrompts: ['Find opportunities for me'],
        readyToDiscover: false,
        generatedBy: 'nexora-fallback',
      });
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      console.error('Chat workflow returned a non-JSON response.');
      return res.json({
        reply: fallbackReply,
        suggestedPrompts: ['Find opportunities for me'],
        readyToDiscover: false,
        generatedBy: 'nexora-fallback',
      });
    }

    if (
      !data ||
      typeof data.reply !== 'string' ||
      !['ok', 'partial', 'failed'].includes(data.status)
    ) {
     console.error('Chat workflow response contract mismatch:', {
  responseType: Array.isArray(data) ? 'array' : typeof data,
  keys: data && typeof data === 'object' && !Array.isArray(data)
    ? Object.keys(data)
    : [],
  hasReply: typeof data?.reply === 'string',
  status: typeof data?.status === 'string' ? data.status : 'missing or invalid',
});
console.error('Check the n8n workflow response structure; response content was not logged.');
      return res.json({
        reply: fallbackReply,
        suggestedPrompts: ['Find opportunities for me'],
        readyToDiscover: false,
        generatedBy: 'nexora-fallback',
      });
    }

    if (data.status === 'failed') {
      return res.json({
        reply: fallbackReply,
        suggestedPrompts: Array.isArray(data.suggestedPrompts)
          ? data.suggestedPrompts.filter((p: unknown) => typeof p === 'string').slice(0, 3)
          : ['Find opportunities for me'],
        readyToDiscover: false,
        generatedBy: 'nexora-fallback',
      });
    }

    return res.json({
      reply: data.reply,
      suggestedPrompts: Array.isArray(data.suggestedPrompts)
        ? data.suggestedPrompts.filter((p: unknown) => typeof p === 'string').slice(0, 3)
        : [],
      readyToDiscover: data.readyToDiscover === true,
      generatedBy: 'n8n-nemotron',
      meta: data.meta,
      status: data.status,
    });
   } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError');

    console.error(
      timedOut
        ? 'Chat workflow timed out.'
        : 'Chat workflow request failed:',
      error instanceof Error
        ? { name: error.name, message: error.message }
        : 'Unknown error',
    );
    return res.json({
      reply: fallbackReply,
      suggestedPrompts: ['Find opportunities for me'],
      readyToDiscover: false,
      generatedBy: 'nexora-fallback',
    });
  }
});

app.post('/api/discover', async (req, res) => {
  const authenticatedUser = await getAuthenticatedUser(req);

  if (!authenticatedUser) {
    return res.status(401).json({
      status: 'failed',
      error: {
        code: 'UNAUTHORIZED',
        message: 'Please sign in to discover opportunities.',
        retryable: false,
      },
      warnings: [],
      opportunities: [],
      recommendedOpportunityIds: [],
      actionPlan: null,
    });
  }

  const { sessionId, userProfile, query } = req.body ?? {};

  if (
  typeof sessionId !== 'string' ||
  sessionId.trim().length < 1 ||
  sessionId.trim().length > 64
) {
  return res.status(400).json({
    status: 'failed',
    error: {
      code: 'INVALID_REQUEST',
      message: 'sessionId is required and must be between 1 and 64 characters.',
      retryable: false,
    },
    warnings: [],
    opportunities: [],
    recommendedOpportunityIds: [],
    actionPlan: null,
  });
}

  if (
    typeof query !== 'string' ||
    query.trim().length < 3 ||
    query.trim().length > 300
  ) {
    return res.status(400).json({
      status: 'failed',
      error: {
        code: 'INVALID_REQUEST',
        message: 'Query must be between 3 and 300 characters.',
        retryable: false,
      },
      warnings: [],
      opportunities: [],
      recommendedOpportunityIds: [],
      actionPlan: null,
    });
  }

  if (!process.env.N8N_DISCOVER_WEBHOOK_URL) {
    return res.status(503).json({
      status: 'failed',
      error: {
        code: 'WORKFLOW_NOT_CONFIGURED',
        message: 'The discovery workflow is not configured yet.',
        retryable: true,
      },
      warnings: [],
      opportunities: [],
      recommendedOpportunityIds: [],
      actionPlan: null,
    });
  }

  try {
    const response = await fetch(
      process.env.N8N_DISCOVER_WEBHOOK_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Replace with the exact header name confirmed by the AI specialist.
          'x-nexora-secret': process.env.N8N_WEBHOOK_SECRET ?? '',
        },
        body: JSON.stringify({
          sessionId,
          userProfile: (() => {
  const {
    email,
    avatarUrl,
    avatar_url,
    ...safeProfile
  } = userProfile ?? {};

  return safeProfile;
})(),
          query: query.trim(),
        }),
        signal: AbortSignal.timeout(90000),
      }
    );

    let data: any;

    try {
      data = await response.json();
    } catch {
      console.error('Discovery workflow returned a non-JSON response.');

      return res.status(502).json({
        status: 'failed',
        error: {
          code: 'WORKFLOW_INVALID_RESPONSE',
          message: 'Opportunity discovery is temporarily unavailable. Please try again.',
          retryable: true,
        },
        warnings: [],
        opportunities: [],
        recommendedOpportunityIds: [],
        actionPlan: null,
      });
    }

   if (!response.ok) {
  console.error('Discovery workflow returned HTTP status:', response.status);

  return res.status(502).json({
    status: 'failed',
    error: {
      code: 'WORKFLOW_FAILED',
      message: 'Opportunity discovery is temporarily unavailable. Please try again.',
      retryable: true,
    },
    warnings: [],
    opportunities: [],
    recommendedOpportunityIds: [],
    actionPlan: null,
  });
}

return res.json(data);
  } catch (error) {
    console.error('Discovery workflow request failed:', error);

    return res.status(502).json({
      status: 'failed',
      error: {
        code: 'WORKFLOW_UNAVAILABLE',
        message: 'Opportunity discovery is temporarily unavailable. Please try again.',
        retryable: true,
      },
      warnings: [],
      opportunities: [],
      recommendedOpportunityIds: [],
      actionPlan: null,
    });
  }
});

// Generate Action Plan endpoint
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const { goal, opportunityTitle, currentLevel, timeframe } = req.body;

    const defaultTasks = [
      {
        id: 'task-1',
        title: 'Audit Current Skill Baseline & Prerequisites',
        description: `Map out prerequisite math, programming, or domain knowledge needed for ${opportunityTitle || goal || 'your target track'}.`,
        priority: 'high',
        timeline: 'Week 1',
        category: 'Skill Audit',
        sourceName: 'Official Syllabus & Requirements',
        sourceUrl: 'https://ocw.mit.edu',
        completed: false,
      },
      {
        id: 'task-2',
        title: 'Complete Core Foundational Learning Module',
        description: 'Work through beginner-friendly verified modules and complete end-of-unit practical exercises.',
        priority: 'high',
        timeline: 'Week 2–3',
        category: 'Curriculum',
        sourceName: 'Accredited Course Catalog',
        sourceUrl: 'https://cs50.harvard.edu',
        completed: false,
      },
      {
        id: 'task-3',
        title: 'Develop Practical Proof-of-Skill Portfolio Project',
        description: 'Build a tangible project addressing a real problem, document codebase on GitHub with clean README.',
        priority: 'medium',
        timeline: 'Week 4–5',
        category: 'Portfolio',
        sourceName: 'Open Source Reference Standards',
        sourceUrl: 'https://github.com',
        completed: false,
      },
      {
        id: 'task-4',
        title: 'Draft & Verify Application Documents',
        description: 'Assemble academic transcripts, statement of purpose, and reference contacts adhering strictly to official portal guidelines.',
        priority: 'high',
        timeline: 'Week 6',
        category: 'Application Prep',
        sourceName: 'Institutional Submission Guidelines',
        sourceUrl: 'https://daad.de/en',
        completed: false,
      },
      {
        id: 'task-5',
        title: 'Submit via Verified Official Portal',
        description: 'Complete submission directly on the official host platform before the deadline cutoff. Record confirmation number.',
        priority: 'high',
        timeline: 'Week 7',
        category: 'Submission',
        sourceName: 'Verified Direct Portal',
        sourceUrl: '#',
        completed: false,
      },
    ];

    res.json({
      goal: goal || `Excel in ${opportunityTitle || 'Opportunity Application'}`,
      timeline: timeframe || '6–8 Weeks',
      tasks: defaultTasks,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// H-MEM: save an explicit opportunity preference for the authenticated user.
app.post('/api/memory/preferences', async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Please sign in first.' });
    }

    const preference = req.body?.preference;
    if (typeof preference !== 'string' || !preference.trim() || preference.trim().length > 500) {
      return res.status(400).json({
        error: 'preference must contain between 1 and 500 characters.',
      });
    }

    const saved = saveOpportunityPreference(user.id, preference);
    return res.status(201).json({ success: true, preference: saved });
  } catch (error) {
    console.error('Error saving H-MEM preference:', error);
    return res.status(500).json({ error: 'Could not save preference.' });
  }
});

// H-MEM: retrieve relevant preferences belonging only to the authenticated user.
app.get('/api/memory/preferences', async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Please sign in first.' });
    }

    const query = req.query.query;
    if (query !== undefined && (typeof query !== 'string' || query.length > 200)) {
      return res.status(400).json({ error: 'query must be at most 200 characters.' });
    }

    const result = getOpportunityPreferences(
      user.id,
      typeof query === 'string' && query.trim() ? query.trim() : 'opportunity preferences',
    );
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error retrieving H-MEM preferences:', error);
    return res.status(500).json({ error: 'Could not retrieve preferences.' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Nexora Connect server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
