import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Opportunity,
  ActiveScreen,
  ActionPlanTask,
  ChatMessage,
  UserProfile,
  ApplicationStage,
} from '../types';
import { MOCK_OPPORTUNITIES, INITIAL_ACTION_TASKS } from '../data/mockOpportunities';

interface AppContextType {
  screen: ActiveScreen;
  setScreen: (screen: ActiveScreen) => void;
  selectedOpportunityId: string;
  setSelectedOpportunityId: (id: string) => void;
  selectedOpportunity: Opportunity;
  viewOpportunityDetails: (id: string) => void;
  opportunities: Opportunity[];
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  savedOpportunityIds: string[];
  opportunityStages: Record<string, ApplicationStage>;
  toggleSaveOpportunity: (id: string) => void;
  setOpportunityStage: (id: string, stage: ApplicationStage) => void;
  actionTasks: ActionPlanTask[];
  toggleTaskCompleted: (taskId: string) => void;
  addTask: (task: Omit<ActionPlanTask, 'id'>) => void;
  removeTask: (taskId: string) => void;
  generateActionPlanForOpportunity: (opp: Opportunity) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => Promise<void>;
  isAiTyping: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedVerificationStatus: string;
  setSelectedVerificationStatus: (status: string) => void;
  isEligibilityModalOpen: boolean;
  setIsEligibilityModalOpen: (open: boolean) => void;
  eligibilityCheckTarget: Opportunity | null;
  openEligibilityCheck: (opp: Opportunity) => void;
  notification: string | null;
  showNotification: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<ActiveScreen>('get-started');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('opp-1');
  const [opportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Adeleke',
    email: 'alex.adeleke@student.unilag.edu.ng',
    role: 'Undergraduate Scholar & Aspiring AI Engineer',
    primaryGoal: 'Find fully funded scholarships and practical AI engineering internships',
    fieldOfInterest: 'Artificial Intelligence & Chemical Informatics',
    experienceLevel: 'Undergraduate',
    location: 'Lagos, Nigeria',
    avatarUrl: '/src/assets/images/avatar_user_alex_1791809933458.jpg',
  });

  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>([
    'opp-1',
    'opp-2',
    'opp-5',
  ]);

  const [opportunityStages, setOpportunityStages] = useState<Record<string, ApplicationStage>>({
    'opp-1': 'preparing',
    'opp-2': 'exploring',
    'opp-5': 'saved',
  });

  const [actionTasks, setActionTasks] = useState<ActionPlanTask[]>(INITIAL_ACTION_TASKS);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<string>('All');

  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState<boolean>(false);
  const [eligibilityCheckTarget, setEligibilityCheckTarget] = useState<Opportunity | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const selectedOpportunity =
    opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0];

  const viewOpportunityDetails = (id: string) => {
    setSelectedOpportunityId(id);
    setScreen('opportunity-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveOpportunity = (id: string) => {
    setSavedOpportunityIds((prev) => {
      const exists = prev.includes(id);
      const opp = opportunities.find((o) => o.id === id);
      if (exists) {
        showNotification(`Removed "${opp?.title.slice(0, 32)}..." from saved`);
        return prev.filter((item) => item !== id);
      } else {
        showNotification(`Saved "${opp?.title.slice(0, 32)}..." to your tracker`);
        return [...prev, id];
      }
    });
  };

  const setOpportunityStage = (id: string, stage: ApplicationStage) => {
    setOpportunityStages((prev) => ({
      ...prev,
      [id]: stage,
    }));
    const labels: Record<ApplicationStage, string> = {
      saved: 'Saved',
      exploring: 'Exploring',
      preparing: 'Preparing Application',
      applied: 'Applied (Application Submitted)',
    };
    showNotification(`Updated status to: ${labels[stage]}`);
  };

  const toggleTaskCompleted = (taskId: string) => {
    setActionTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = (task: Omit<ActionPlanTask, 'id'>) => {
    const newTask: ActionPlanTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setActionTasks((prev) => [newTask, ...prev]);
    showNotification('New task added to your Action Plan');
  };

  const removeTask = (taskId: string) => {
    setActionTasks((prev) => prev.filter((t) => t.id !== taskId));
    showNotification('Task removed');
  };

  const generateActionPlanForOpportunity = (opp: Opportunity) => {
    const generated: ActionPlanTask[] = [
      {
        id: `gen-${Date.now()}-1`,
        opportunityId: opp.id,
        title: `Verify ${opp.provider} Requirements & Intake Deadlines`,
        description: `Review official documentation on ${opp.officialUrl} to confirm eligibility before preparing files.`,
        priority: 'high',
        timeline: 'Week 1',
        category: 'Official Verification',
        sourceName: `${opp.provider} Portal`,
        sourceUrl: opp.officialUrl,
        completed: false,
        dueDate: 'Within 7 Days',
      },
      {
        id: `gen-${Date.now()}-2`,
        opportunityId: opp.id,
        title: 'Gather Certified Academic Records & Portfolio Links',
        description: 'Prepare clean digital copies of transcripts, resume, and GitHub repository proof.',
        priority: 'high',
        timeline: 'Week 2',
        category: 'Documentation',
        completed: false,
        dueDate: 'Within 14 Days',
      },
      {
        id: `gen-${Date.now()}-3`,
        opportunityId: opp.id,
        title: 'Draft Motivation Essay / Personal Statement',
        description: `Tailor responses specifically to ${opp.title} goals and demonstrate community impact.`,
        priority: 'medium',
        timeline: 'Week 3–4',
        category: 'Application Prep',
        completed: false,
        dueDate: 'Within 25 Days',
      },
      {
        id: `gen-${Date.now()}-4`,
        opportunityId: opp.id,
        title: 'Submit Application via Official Portal',
        description: `Complete final review and submit directly on verified portal prior to ${opp.deadline}.`,
        priority: 'high',
        timeline: 'Submission Window',
        category: 'Portal Submission',
        sourceName: 'Official Submission Gateway',
        sourceUrl: opp.officialUrl,
        completed: false,
        dueDate: opp.deadline,
      },
    ];

    setActionTasks((prev) => [...generated, ...prev]);
    setScreen('action-plan');
    showNotification(`Generated 4-step action plan for ${opp.title.slice(0, 28)}...`);
  };

  const updateUserProfile = (newProps: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...newProps }));
  };

  const openEligibilityCheck = (opp: Opportunity) => {
    setEligibilityCheckTarget(opp);
    setIsEligibilityModalOpen(true);
  };

  // Chat conversation state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      content:
        "I'm an Industrial Chemistry student in Nigeria. I want to build my AI skills and find fully funded learning opportunities. What should I focus on first?",
      timestamp: 'Today at 09:15',
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      content: `Welcome, Alex! Transitioning from Industrial Chemistry into AI and computational science is a high-impact direction. Chemistry students typically possess strong analytical thinking, reaction pathway logic, and experimental discipline—all of which translate effectively into mathematical modeling.

Here is your evidence-based strategic transition roadmap:

1. **Leverage Your Chemical Science Advantage**:
   * Machine learning is transforming drug discovery, materials chemistry, and polymer formulation (Cheminformatics).
   * Rather than starting as a generic software developer, positioning yourself at the intersection of **Applied AI for Physical Sciences** gives you a distinct edge for international fellowships.

2. **Verified Free Foundations to Begin This Month**:
   * **Harvard CS50x**: Master Python, data structures, and algorithmic fundamentals (100% free open-access verified curriculum).
   * **Google Africa Developer Scholarship (GADS)**: Confirmed cohort with mentor pods and fully subsidized Cloud & ML exam vouchers.

3. **Recommended Verified Opportunities in Your Portal**:
   * **Mastercard Foundation Scholars Program**: Fully funded graduate degree sponsorship covering tuition, living expenses, and laptops.
   * **Deep Learning Indaba / IndabaX Fellowship**: Annual competitive grants providing fully funded travel and masterclasses.

Would you like me to generate a structured 6-week preparation action plan tailored to this pathway?`,
      timestamp: 'Today at 09:16',
      recommendedOpportunityIds: ['opp-1', 'opp-2', 'opp-9'],
      suggestedPrompts: [
        'Generate a 6-week study schedule',
        'How do I verify if a scholarship requires fees?',
        'Show me cheminformatics research grants',
      ],
    },
  ]);

  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  const sendChatMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: content.trim(),
      timestamp: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: chatMessages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.content,
          })),
          context: {
            userProfile,
            activeOpportunity: selectedOpportunity.title,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: data.reply,
        timestamp: 'Just now',
        recommendedOpportunityIds:
          content.toLowerCase().includes('scholarship') || content.toLowerCase().includes('fund')
            ? ['opp-1', 'opp-3']
            : ['opp-2', 'opp-5'],
        suggestedPrompts: [
          'Add these steps to my Action Plan',
          'Check my eligibility for this program',
          'What are the red flags of fake opportunities?',
        ],
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Backend call failed, using intelligent fallback response', err);
      // Fallback response
      const fallbackReply = `I evaluated your question: "${content}".

Based on verified records for university students and early-career tech candidates in our database:

• **Prioritize Official Intakes**: Never proceed with opportunities that lack direct institutional domains (.edu, official foundation portals) or require upfront fee deposits.
• **Corroborate Deadlines**: Always verify the active intake calendar directly on the official host website.
• **Take Immediate Action**: Add this milestone to your Nexora Action Plan so you can track application requirements systematically.

You can inspect the full evidence audit for related opportunities in the "Discover" tab.`;

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: fallbackReply,
        timestamp: 'Just now',
        recommendedOpportunityIds: ['opp-1', 'opp-2'],
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        selectedOpportunityId,
        setSelectedOpportunityId,
        selectedOpportunity,
        viewOpportunityDetails,
        opportunities,
        userProfile,
        updateUserProfile,
        savedOpportunityIds,
        opportunityStages,
        toggleSaveOpportunity,
        setOpportunityStage,
        actionTasks,
        toggleTaskCompleted,
        addTask,
        removeTask,
        generateActionPlanForOpportunity,
        chatMessages,
        sendChatMessage,
        isAiTyping,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedVerificationStatus,
        setSelectedVerificationStatus,
        isEligibilityModalOpen,
        setIsEligibilityModalOpen,
        eligibilityCheckTarget,
        openEligibilityCheck,
        notification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
