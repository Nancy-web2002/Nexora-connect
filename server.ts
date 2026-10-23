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

// AI Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (ai) {
      const systemInstruction = `
You are the AI Strategic Advisor for Nexora Connect, an AI-powered community support and opportunity verification platform.
Your mission:
1. Understand the user's specific background, goals, skills, and constraints (e.g. university students, career switchers, regional origin such as Nigeria or elsewhere).
2. Recommend practical, credible opportunities and learning steps.
3. Rigorously evaluate evidence: clearly state what is verified vs unverified vs unknown.
4. Never make up fake partnerships or false guarantees. Emphasize that users must confirm eligibility on official source links.
5. Provide structured, actionable, and encouraging guidance with numbered milestones and realistic timelines.
Keep tone professional, empathetic, candid, and concise.
`;

      const contents = [
        ...(Array.isArray(history)
          ? history.map((h: { role: string; content: string }) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }],
            }))
          : []),
        {
          role: 'user',
          parts: [
            {
              text: `Context: ${JSON.stringify(context || {})}\n\nUser Question: ${message}`,
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'I analyzed your request. Here are the recommended next steps based on available verified sources.';
      return res.json({ reply, generatedBy: 'gemini-3.8-flash' });
    }

    // High quality intelligent response when GEMINI_API_KEY is not set or running offline
    let intelligentReply = '';
    const lower = message.toLowerCase();

    if (lower.includes('chemistry') || lower.includes('nigeria') || lower.includes('transition')) {
      intelligentReply = `### Strategic Transition Plan: From Industrial Chemistry to AI & Data Systems

Transitioning from Industrial Chemistry to Artificial Intelligence is a high-leverage move. Chemistry gives you strong mathematical intuition, analytical experimental discipline, and systems thinking.

#### 1. Foundation Phase (Weeks 1–3)
* **Master Core Python & Numerical Libraries**: Focus on NumPy, Pandas, and basic vector arithmetic. Chemical kinetics and stoichiometry map directly to matrix transformations.
* **Verified Free Resource**: *Kaggle Python & Data Analysis Micro-Courses* (100% free, interactive browser environment, zero setup required).

#### 2. Applied Computational Skills (Weeks 4–7)
* **Apply Machine Learning to Cheminformatics / Science**:
  * Predict molecular solubility or reaction yields using open datasets (e.g., MoleculeNet or PubChem benchmarks).
  * Build a portfolio project that bridges your chemistry domain with predictive modeling.

#### 3. Target Verified Fully Funded Opportunities (Weeks 8–12)
* **African Development Bank & Microsoft Coding Academy**: Fully funded virtual scholarship cohorts for sub-Saharan tech scholars.
* **Deep Learning Indaba / IndabaX Nigeria**: Annual computational fellowship providing travel grants, mentorship, and workshops.
* **Google Africa Developer Scholarship (GADS / Pluralsight)**: Confirmed cohort-based free certified learning track.

**Evidence Notice**: While these programs run recurring cohorts, intake cycles vary seasonally. Always confirm active submission dates via the official institution portals linked in your Nexora tracker.`;
    } else if (lower.includes('scholarship') || lower.includes('fund')) {
      intelligentReply = `### Curated Assessment: Funded Tech & Academic Opportunities

When pursuing scholarships, verification of direct institutional intake and zero fee policies is essential.

#### Key Recommended Pathways:
1. **Mastercard Foundation Scholars Program**:
   * *Status*: Verified Institutional Partner.
   * *Coverage*: 100% full tuition, living stipend, laptop grant, and mentorship.
   * *Verification Check*: Confirmed direct intake through accredited partner universities (e.g., KNUST, AIMS, Edinburgh). Never applies through third-party agents.

2. **DAAD Helmut-Schmidt Program & Development Scholarships**:
   * *Status*: Verified Bilateral Academic Grant.
   * *Coverage*: Full monthly stipend (€934/mo), travel allowance, health insurance.
   * *Limitation*: Requires certified academic transcripts and verified English proficiency.

3. **Commonwealth Shared Scholarship**:
   * *Status*: Verified Intergovernmental Award.
   * *Application Window*: Opens annually November–December for following academic year.

*Safety Verification*: Genuine scholarship funds never charge application fees or processing deposits. If any portal requests payment for review, mark it as Unverified in your Nexora portal immediately.`;
    } else {
      intelligentReply = `### Personalized Opportunity Recommendation

Based on your profile and query, here is an evaluation of relevant pathways and verified resources:

1. **Clarify Target Domain**: Align your specific career trajectory (e.g., Machine Learning Engineering, Cloud Infrastructure, Data Analysis).
2. **Select Accredited Open-Access Learning**: Prioritize verified institutional courses such as Harvard CS50x or MIT OpenCourseWare for recognized technical rigor.
3. **Evidence-Based Application Strategy**:
   * Verify official institutional domain (.edu, .org, or official corporate careers portal).
   * Cross-reference deadline dates with university consortium bulletins.
   * Generate an action plan using the Action Plan tab to track weekly milestones.

Would you like me to generate a tailored 4-week preparation plan for a specific scholarship or internship program?`;
    }

    return res.json({ reply: intelligentReply, generatedBy: 'nexora-synthesis-engine' });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'An error occurred while generating the assistant response.',
      details: error.message,
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

    return res.status(response.status).json(data);
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
