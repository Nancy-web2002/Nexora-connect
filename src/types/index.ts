export type OpportunityCategory =
  | "Scholarship"
  | "Internship"
  | "Course"
  | "Certification"
  | "Mentorship"
  | "Fellowship";

export type VerificationStatus =
  | "Verified"
  | "Partially Verified"
  | "Unverified";

export type EvidenceCheckStatus = "confirmed" | "caution" | "missing";

export interface EvidenceCheck {
  id: string;
  name: string;
  status: EvidenceCheckStatus;
  evidence: string;
  uncertaintyOrLimitation?: string;
}

export interface OpportunitySource {
  title: string;
  type:
    | "Official Institution Portal"
    | "Academic Consortium Registry"
    | "Government / Ministry Notice"
    | "Accreditation Body"
    | "Direct Corporate Careers"
    | "Third-Party Listing";
  publisher: string;
  dateAccessed: string;
  supports: string;
  url: string;
  isPrimary: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  category: OpportunityCategory;
  description: string;
  funding: string;
  location: string;
  regionTag:
    | "Global"
    | "Nigeria / Africa"
    | "North America"
    | "Europe"
    | "Remote";
  eligibility: string[];
  deadline: string;
  deadlineTimestamp: number | null;
  verificationStatus: VerificationStatus;
  lastCheckedDate: string;
  officialUrl: string;
  applicationMethod: string;
  evidenceChecks: EvidenceCheck[];
  sources: OpportunitySource[];
  aiExplanation: string;
  limitationsNotice: string;
  featured?: boolean;
}

export type ApplicationStage = "saved" | "exploring" | "preparing" | "applied";

export interface UserOpportunityState {
  opportunityId: string;
  stage: ApplicationStage;
  notes?: string;
  savedAt: string;
  updatedAt: string;
}

export interface ActionPlanTask {
  id: string;
  opportunityId?: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  timeline: string;
  category: string;
  sourceName?: string;
  sourceUrl?: string;
  completed: boolean;
  dueDate?: string;
}

export interface ActionPlan {
  id: string;
  goal: string;
  targetOpportunityTitle?: string;
  timeline: string;
  createdAt: string;
  tasks: ActionPlanTask[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  recommendedOpportunityIds?: string[];
  suggestedPrompts?: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  primaryGoal: string;
  fieldOfInterest: string;
  experienceLevel:
    | "Undergraduate"
    | "Recent Graduate"
    | "Early-Career Professional"
    | "Career Switcher";
  location: string;
  avatarUrl: string;
}
