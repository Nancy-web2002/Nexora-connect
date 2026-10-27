import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Opportunity,
  ActionPlanTask,
  ChatMessage,
  UserProfile,
  ApplicationStage,
} from "../types";
import { MOCK_OPPORTUNITIES } from "../data/mockOpportunities";
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
  setOpportunities: (opportunities: Opportunity[]) => void;
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
 const [opportunities, setOpportunities] =
  useState<Opportunity[]>(MOCK_OPPORTUNITIES);

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

 const [actionTasks, setActionTasks] = useState<ActionPlanTask[]>([]);

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
  const [tasksLoadedForUser, setTasksLoadedForUser] = useState<string | null>(
  null,
);

// Load saved tasks whenever the signed-in user changes.
useEffect(() => {
  if (!authUserId) {
    setActionTasks([]);
    setTasksLoadedForUser(null);
    return;
  }

  try {
    const storedTasks = localStorage.getItem(
      `nexora-action-tasks-${authUserId}`,
    );

    if (storedTasks) {
      const parsedTasks: unknown = JSON.parse(storedTasks);

      if (Array.isArray(parsedTasks)) {
        setActionTasks(parsedTasks as ActionPlanTask[]);
      } else {
        setActionTasks([]);
      }
    } else {
      setActionTasks([]);
    }
  } catch (error) {
    console.error("Failed to load saved action tasks:", error);
    setActionTasks([]);
  }

  setTasksLoadedForUser(authUserId);
}, [authUserId]);

// Save tasks for the current signed-in user.
useEffect(() => {
  if (!authUserId || tasksLoadedForUser !== authUserId) {
    return;
  }

  try {
    localStorage.setItem(
      `nexora-action-tasks-${authUserId}`,
      JSON.stringify(actionTasks),
    );
  } catch (error) {
    console.error("Failed to save action tasks:", error);
  }
}, [actionTasks, authUserId, tasksLoadedForUser]);

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
  const officialSource = opp.sources.find((source) => source.isPrimary);
  const sourceUrl = officialSource?.url || opp.officialUrl;
  const sourceName = officialSource?.publisher || `${opp.provider} official portal`;

  const tasks: ActionPlanTask[] = [];
  let nextId = 1;

  const addGeneratedTask = (
    task: Omit<ActionPlanTask, "id" | "opportunityId" | "completed">,
  ) => {
    tasks.push({
      ...task,
      id: `gen-${opp.id}-${Date.now()}-${nextId++}`,
      opportunityId: opp.id,
      completed: false,
    });
  };

  const needsVerification =
    opp.verificationStatus !== "Verified" ||
    opp.evidenceChecks.some((check) => check.status !== "confirmed");

  if (needsVerification) {
    const unresolvedChecks = opp.evidenceChecks.filter(
      (check) => check.status !== "confirmed",
    );

    addGeneratedTask({
      title: `Verify ${opp.title}`,
      description:
        unresolvedChecks.length > 0
          ? `Review these unresolved checks: ${unresolvedChecks
              .map((check) => check.name)
              .join(", ")}. Check the available evidence and limitations before relying on this opportunity.`
          : `The current verification status is ${opp.verificationStatus}. Review the available evidence and limitations before relying on this opportunity.`,
      priority: "high",
      timeline: "Before applying",
      category: "Evidence Verification",
      sourceName,
      sourceUrl,
      dueDate: "Before applying",
    });
  }

  if (opp.eligibility.length > 0) {
    addGeneratedTask({
      title: "Check your eligibility",
      description: `Compare your circumstances against the stated requirements: ${opp.eligibility.join("; ")}. Confirm any unclear requirements with the provider.`,
      priority: "high",
      timeline: "First step",
      category: "Eligibility",
      sourceName,
      sourceUrl,
      dueDate: "Before preparing your application",
    });
  }

  addGeneratedTask({
    title: "Review application instructions",
    description: `Follow the stated application method: ${opp.applicationMethod || "Check the provider's official instructions"}. Confirm the required documents, submission steps, and any fees directly with the provider.`,
    priority: "high",
    timeline: "Before preparing documents",
    category: "Application Preparation",
    sourceName,
    sourceUrl,
    dueDate: "Before submission",
  });

  const deadlineIsKnown =
    opp.deadlineTimestamp !== null &&
    Number.isFinite(opp.deadlineTimestamp) &&
    opp.deadlineTimestamp > 0;

  addGeneratedTask({
    title: deadlineIsKnown
      ? "Prepare and submit your application"
      : "Confirm the deadline before applying",
    description: deadlineIsKnown
      ? `Prepare the documents required by the provider, review your application, and submit using the stated application method. Listed deadline: ${opp.deadline}. Confirm it on the official source before submitting.`
      : `A reliable deadline timestamp is not available. Contact the provider or check its official source for the current deadline before investing time in the application.`,
    priority: "high",
    timeline: deadlineIsKnown ? `Listed deadline: ${opp.deadline}` : "As soon as possible",
    category: "Application Submission",
    sourceName,
    sourceUrl,
    dueDate: deadlineIsKnown ? opp.deadline : "Confirm with provider",
  });

  setActionTasks(tasks);

  showNotification(
    `Generated ${tasks.length}-step action plan for ${opp.title.slice(0, 28)}...`,
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

  const chatSessionId = useRef(crypto.randomUUID());

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
    const message = content.trim();
    if (!message) return;

    setChatError(null);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: message,
      timestamp: "Just now",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) throw sessionError;

  const accessToken = sessionData.session?.access_token;

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
        body: JSON.stringify({
          sessionId: chatSessionId.current,
          message,
          history: chatMessages.slice(-6).map((m) => ({
  role: m.sender === "user" ? "user" : "model",
  content: m.content,
})),
context: {
  userProfile: {
    name: userProfile.name,
    role: userProfile.role,
    primaryGoal: userProfile.primaryGoal,
    fieldOfInterest: userProfile.fieldOfInterest,
    experienceLevel: userProfile.experienceLevel,
    location: userProfile.location,
  },
  activeOpportunity: selectedOpportunity.title,
  latestUserRequest: message,
  useSavedPreferences:
    !/without using my saved preference|ignore my (saved )?preferences|don't use my saved preferences/i.test(message),
},
        }),
      });

      const data = await response.json();
      console.log("CHAT API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          typeof data.reply === "string"
            ? data.reply
            : `Chat request failed: HTTP ${response.status}`,
        );
      }

      
const assistantMsg: ChatMessage = {
  id: `msg-${Date.now()}-assistant`,
  sender: "assistant",
  content:
    typeof data.reply === "string" && data.reply.trim()
      ? data.reply
      : "I couldn't generate a response. Please try again.",
  timestamp: "Just now",
  recommendedOpportunityIds: [],
  suggestedPrompts: Array.isArray(data.suggestedPrompts)
    ? data.suggestedPrompts
        .filter(
          (prompt: unknown): prompt is string =>
            typeof prompt === "string",
        )
        .slice(0, 3)
    : [],
};

setChatMessages((prev) => [...prev, assistantMsg]);

if (
  data.readyToDiscover === true &&
  typeof data.discoverQuery === "string" &&
  data.discoverQuery.trim()
) {
  const discoveryQuery = data.discoverQuery.trim();

  setChatMessages((prev) => [
    ...prev,
    {
      id: `msg-${Date.now()}-discovering`,
      sender: "assistant",
      content: "Searching for relevant opportunities using your saved preferences...",
      timestamp: "Just now",
      recommendedOpportunityIds: [],
      suggestedPrompts: [],
    },
  ]);

  try {
    const discoveryResponse = await fetch("/api/discover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
      },
      body: JSON.stringify({
        sessionId: chatSessionId.current,
        userProfile,
        query: discoveryQuery,
      }),
    });

    const discoveryData = await discoveryResponse.json();

    if (!discoveryResponse.ok) {
      throw new Error(
        discoveryData?.error?.message ||
          `Discovery failed: HTTP ${discoveryResponse.status}`,
      );
    }

    if (!Array.isArray(discoveryData?.opportunities)) {
      throw new Error("Discovery returned an invalid opportunities list.");
    }

    const foundOpportunities = discoveryData.opportunities;
    setOpportunities(foundOpportunities);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-results`,
        sender: "assistant",
        content:
          foundOpportunities.length > 0
            ? `I found ${foundOpportunities.length} opportunities. Review the results below and check each opportunity's verification evidence before applying.`
            : "The discovery service returned no opportunities for this search. Try adjusting your search.",
        timestamp: "Just now",
        recommendedOpportunityIds: foundOpportunities
          .map((opp: { id?: string }) => opp.id)
          .filter(
            (id: unknown): id is string =>
              typeof id === "string" && id.length > 0,
          ),
        suggestedPrompts: [],
      },
    ]);
  } catch (discoveryError) {
    console.error("Chat-triggered discovery failed:", discoveryError);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-discovery-error`,
        sender: "assistant",
        content:
          "I couldn't retrieve the opportunities this time. Please open Discover and try again.",
        timestamp: "Just now",
        recommendedOpportunityIds: [],
        suggestedPrompts: [],
      },
    ]);
  }
}
    } catch (err) {
      console.error("AI chat request failed:", err);
      setChatError(
        err instanceof Error
          ? err.message
          : "I couldn't get a response from the AI service.",
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
        setOpportunities,
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
