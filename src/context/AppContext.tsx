import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Opportunity,
  ActionPlanTask,
  ChatMessage,
  UserProfile,
  ApplicationStage,
} from "../types";
import {
  MOCK_OPPORTUNITIES,
  INITIAL_ACTION_TASKS,
} from "../data/mockOpportunities";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*  Profile helpers (public.user_profiles <-> UserProfile)                     */
/* -------------------------------------------------------------------------- */

// Shape of a row in public.user_profiles. Everything except id is nullable
// because the signup trigger only fills in id (and name, when available).
interface UserProfileRow {
  id: string;
  name: string | null;
  role: string | null;
  primary_goal: string | null;
  field_of_interest: string | null;
  experience_level: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

type ExperienceLevel = UserProfile["experienceLevel"];

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "Undergraduate",
  "Recent Graduate",
  "Early-Career Professional",
  "Career Switcher",
];

// Placeholder shown until the user picks a real value. It is only written to
// the database if the user saves it (e.g. from Settings).
const DEFAULT_EXPERIENCE_LEVEL: ExperienceLevel = "Undergraduate";

const isExperienceLevel = (value: unknown): value is ExperienceLevel =>
  typeof value === "string" && (EXPERIENCE_LEVELS as string[]).includes(value);

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Used when the profile has no avatar_url, so <img src> never points at nothing.
const makeInitialsAvatar = (name: string): string => {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "N";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="#3867F6"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const buildEmptyProfile = (): UserProfile => ({
  name: "",
  email: "",
  role: "",
  primaryGoal: "",
  fieldOfInterest: "",
  experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
  location: "",
  avatarUrl: makeInitialsAvatar("Nexora User"),
});

// Convert a database row (which may be null / partially filled) into the
// UserProfile the UI expects. Never throws on missing fields.
const mapRowToProfile = (
  row: Partial<UserProfileRow> | null,
  authUser: User,
): UserProfile => {
  const email = authUser.email ?? "";
  const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const metadataName =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    "";

  const name =
    row?.name?.trim() ||
    metadataName.trim() ||
    (email ? email.split("@")[0] : "") ||
    "Nexora User";

  return {
    name,
    email,
    role: row?.role ?? "",
    primaryGoal: row?.primary_goal ?? "",
    fieldOfInterest: row?.field_of_interest ?? "",
    experienceLevel: isExperienceLevel(row?.experience_level)
      ? row.experience_level
      : DEFAULT_EXPERIENCE_LEVEL,
    location: row?.location ?? "",
    avatarUrl: row?.avatar_url || makeInitialsAvatar(name),
  };
};

// Convert a partial UI update into the matching database columns.
// - Only fields that were actually passed are included.
// - email is skipped: it lives in Supabase Auth, not in user_profiles.
// - generated (data:) avatars are skipped so we never store the placeholder.
const toDbPatch = (patch: Partial<UserProfile>): Partial<UserProfileRow> => {
  const db: Partial<UserProfileRow> = {};

  if (patch.name !== undefined) db.name = patch.name.trim() || null;
  if (patch.role !== undefined) db.role = patch.role.trim() || null;
  if (patch.primaryGoal !== undefined)
    db.primary_goal = patch.primaryGoal.trim() || null;
  if (patch.fieldOfInterest !== undefined)
    db.field_of_interest = patch.fieldOfInterest.trim() || null;
  if (patch.experienceLevel !== undefined)
    db.experience_level = patch.experienceLevel;
  if (patch.location !== undefined) db.location = patch.location.trim() || null;
  if (patch.avatarUrl !== undefined && !patch.avatarUrl.startsWith("data:"))
    db.avatar_url = patch.avatarUrl || null;

  return db;
};

/* -------------------------------------------------------------------------- */
/*  Context                                                                    */
/* -------------------------------------------------------------------------- */

interface AppContextType {
  selectedOpportunityId: string;
  setSelectedOpportunityId: (id: string) => void;
  selectedOpportunity: Opportunity;
  viewOpportunityDetails: (id: string) => void;
  opportunities: Opportunity[];
  userProfile: UserProfile;
  isProfileLoading: boolean;
  // Resolves to true when the change was saved, false if saving failed.
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
  savedOpportunityIds: string[];
  opportunityStages: Record<string, ApplicationStage>;
  toggleSaveOpportunity: (id: string) => void;
  setOpportunityStage: (id: string, stage: ApplicationStage) => void;
  actionTasks: ActionPlanTask[];
  toggleTaskCompleted: (taskId: string) => void;
  addTask: (task: Omit<ActionPlanTask, "id">) => void;
  removeTask: (taskId: string) => void;
  generateActionPlanForOpportunity: (opp: Opportunity) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => Promise<void>;
  isAiTyping: boolean;
  chatError: string | null;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [selectedOpportunityId, setSelectedOpportunityId] =
    useState<string>("opp-1");
  const [opportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);

  const [authUser, setAuthUser] = useState<User | null>(null);

  const [userProfile, setUserProfile] =
    useState<UserProfile>(buildEmptyProfile);

  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);

  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>([
    "opp-1",
    "opp-2",
    "opp-5",
  ]);

  const [opportunityStages, setOpportunityStages] = useState<
    Record<string, ApplicationStage>
  >({
    "opp-1": "preparing",
    "opp-2": "exploring",
    "opp-5": "saved",
  });

  const [actionTasks, setActionTasks] =
    useState<ActionPlanTask[]>(INITIAL_ACTION_TASKS);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedVerificationStatus, setSelectedVerificationStatus] =
    useState<string>("All");

  const [isEligibilityModalOpen, setIsEligibilityModalOpen] =
    useState<boolean>(false);
  const [eligibilityCheckTarget, setEligibilityCheckTarget] =
    useState<Opportunity | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Auto-dismiss toast notifications
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  // Track the signed-in auth user
  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Failed to load session:", error.message);
        if (isMounted) setIsProfileLoading(false);
        return;
      }

      if (isMounted) {
        const user = data.session?.user ?? null;
        setAuthUser(user);
        // No session means there is no profile to wait for.
        if (!user) setIsProfileLoading(false);
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load the profile row whenever the signed-in user changes.
  // Keyed on the user id so token refreshes don't trigger a refetch.
  const authUserId = authUser?.id ?? null;

  useEffect(() => {
    // Signed out: clear any previous user's data.
    if (!authUser || !authUserId) {
      setUserProfile(buildEmptyProfile());
      setIsProfileLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setIsProfileLoading(true);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authUserId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Failed to load profile:", error.message);
        // Still show something sensible (name/email from auth).
        setUserProfile(mapRowToProfile(null, authUser));
        setIsProfileLoading(false);
        return;
      }

      // data may be null if the signup trigger hasn't created a row yet.
      // mapRowToProfile handles that; the row is created on first save (upsert).
      setUserProfile(mapRowToProfile(data as UserProfileRow | null, authUser));
      setIsProfileLoading(false);
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUserId]);

  const showNotification = (msg: string) => {
    setNotification(msg);
  };

  const selectedOpportunity =
    opportunities.find((o) => o.id === selectedOpportunityId) ||
    opportunities[0];

  const viewOpportunityDetails = (id: string) => {
    setSelectedOpportunityId(id);
    navigate("/opportunity/details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSaveOpportunity = (id: string) => {
    setSavedOpportunityIds((prev) => {
      const exists = prev.includes(id);
      const opp = opportunities.find((o) => o.id === id);
      if (exists) {
        showNotification(`Removed "${opp?.title.slice(0, 32)}..." from saved`);
        return prev.filter((item) => item !== id);
      } else {
        showNotification(
          `Saved "${opp?.title.slice(0, 32)}..." to your tracker`,
        );
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
      saved: "Saved",
      exploring: "Exploring",
      preparing: "Preparing Application",
      applied: "Applied (Application Submitted)",
    };
    showNotification(`Updated status to: ${labels[stage]}`);
  };

  const toggleTaskCompleted = (taskId: string) => {
    setActionTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    );
  };

  const addTask = (task: Omit<ActionPlanTask, "id">) => {
    const newTask: ActionPlanTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setActionTasks((prev) => [newTask, ...prev]);
    showNotification("New task added to your Action Plan");
  };

  const removeTask = (taskId: string) => {
    setActionTasks((prev) => prev.filter((t) => t.id !== taskId));
    showNotification("Task removed");
  };

  const generateActionPlanForOpportunity = (opp: Opportunity) => {
    const generated: ActionPlanTask[] = [
      {
        id: `gen-${Date.now()}-1`,
        opportunityId: opp.id,
        title: `Verify ${opp.provider} Requirements & Intake Deadlines`,
        description: `Review official documentation on ${opp.officialUrl} to confirm eligibility before preparing files.`,
        priority: "high",
        timeline: "Week 1",
        category: "Official Verification",
        sourceName: `${opp.provider} Portal`,
        sourceUrl: opp.officialUrl,
        completed: false,
        dueDate: "Within 7 Days",
      },
      {
        id: `gen-${Date.now()}-2`,
        opportunityId: opp.id,
        title: "Gather Certified Academic Records & Portfolio Links",
        description:
          "Prepare clean digital copies of transcripts, resume, and GitHub repository proof.",
        priority: "high",
        timeline: "Week 2",
        category: "Documentation",
        completed: false,
        dueDate: "Within 14 Days",
      },
      {
        id: `gen-${Date.now()}-3`,
        opportunityId: opp.id,
        title: "Draft Motivation Essay / Personal Statement",
        description: `Tailor responses specifically to ${opp.title} goals and demonstrate community impact.`,
        priority: "medium",
        timeline: "Week 3–4",
        category: "Application Prep",
        completed: false,
        dueDate: "Within 25 Days",
      },
      {
        id: `gen-${Date.now()}-4`,
        opportunityId: opp.id,
        title: "Submit Application via Official Portal",
        description: `Complete final review and submit directly on verified portal prior to ${opp.deadline}.`,
        priority: "high",
        timeline: "Submission Window",
        category: "Portal Submission",
        sourceName: "Official Submission Gateway",
        sourceUrl: opp.officialUrl,
        completed: false,
        dueDate: opp.deadline,
      },
    ];

    setActionTasks((prev) => [...generated, ...prev]);
    showNotification(
      `Generated 4-step action plan for ${opp.title.slice(0, 28)}...`,
    );
  };

  // Updates the UI immediately, then persists to public.user_profiles.
  // Uses upsert so it also works if the signup trigger didn't create a row.
  // Resolves to true on success, false if the save failed (UI is rolled back).
  const updateUserProfile = async (
    newProps: Partial<UserProfile>,
  ): Promise<boolean> => {
    const previousProfile = userProfile;

    setUserProfile((prev) => ({ ...prev, ...newProps }));

    if (!authUser) return true; // nothing to persist when signed out

    const dbPatch = toDbPatch(newProps);
    if (Object.keys(dbPatch).length === 0) return true; // e.g. email-only change

    const { error } = await supabase.from("user_profiles").upsert(
      {
        id: authUser.id,
        ...dbPatch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("Failed to save profile:", error.message);
      setUserProfile(previousProfile);
      showNotification("Couldn't save your profile. Please try again.");
      return false;
    }

    return true;
  };

  const openEligibilityCheck = (opp: Opportunity) => {
    setEligibilityCheckTarget(opp);
    setIsEligibilityModalOpen(true);
  };

  // Chat conversation state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "user",
      content:
        "Help me find credible learning and career opportunities that match my skills, goals, and experience. What information do you need from me?",
      timestamp: "Today at 09:15",
    },
    {
      id: "msg-2",
      sender: "assistant",
      content: `Welcome to Nexora Connect! I'm your AI opportunity advisor. I can help you discover relevant scholarships, training programmes, certifications, and career opportunities. Tell me about your goals, skills, experience, and location, or share an opportunity you'd like to investigate. I'll help you assess the available evidence, understand eligibility requirements, identify missing information, and decide on practical next steps.
      Important: My assessments depend on the evidence available. Always confirm critical details through the official source before applying.`,
      timestamp: "Today at 09:16",
      recommendedOpportunityIds: ["opp-1", "opp-2", "opp-9"],
      suggestedPrompts: [
        "Generate a 6-week study schedule",
        "How do I verify if a scholarship requires fees?",
        "Show me cheminformatics research grants",
      ],
    },
  ]);

  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const sendChatMessage = async (content: string) => {
    if (!content.trim()) return;
    setChatError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: content.trim(),
      timestamp: "Just now",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: chatMessages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "model",
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
        sender: "assistant",
        content: data.reply,
        timestamp: "Just now",
        recommendedOpportunityIds:
          content.toLowerCase().includes("scholarship") ||
          content.toLowerCase().includes("fund")
            ? ["opp-1", "opp-3"]
            : ["opp-2", "opp-5"],
        suggestedPrompts: [
          "Add these steps to my Action Plan",
          "Check my eligibility for this program",
          "What are the red flags of fake opportunities?",
        ],
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI chat request failed:", err);

      setChatError(
        "I couldn't get a response from the AI service. Your message was not answered. Please check your connection and try again.",
      );
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        selectedOpportunityId,
        setSelectedOpportunityId,
        selectedOpportunity,
        viewOpportunityDetails,
        opportunities,
        userProfile,
        isProfileLoading,
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
        chatError,
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
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
