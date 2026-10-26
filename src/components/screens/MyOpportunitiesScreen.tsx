import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { StatusBadge } from "../ui/StatusBadge";
import { ApplicationStage, Opportunity } from "../../types";
import {
  BookMarked,
  Calendar,
  Clock,
  ExternalLink,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  FileCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export const MyOpportunitiesScreen: React.FC = () => {
  const {
    opportunities,
    savedOpportunityIds,
    opportunityStages,
    setOpportunityStage,
    toggleSaveOpportunity,
    viewOpportunityDetails,
    actionTasks,
    toggleTaskCompleted,
  } = useApp();

  const navigate = useNavigate();

  const [activeStageFilter, setActiveStageFilter] = useState<string>("All");

  // Track saved opportunities
  const myOpportunities = opportunities.filter((o) =>
    savedOpportunityIds.includes(o.id),
  );

  const filteredOpportunities = myOpportunities.filter((opp) => {
    if (activeStageFilter === "All") return true;
    const currentStage = opportunityStages[opp.id] || "saved";
    return currentStage === activeStageFilter;
  });

  const stages: { id: ApplicationStage; label: string; count: number }[] = [
    {
      id: "saved",
      label: "Bookmarked / Saved",
      count: myOpportunities.filter(
        (o) => (opportunityStages[o.id] || "saved") === "saved",
      ).length,
    },
    {
      id: "exploring",
      label: "Reviewing Evidence",
      count: myOpportunities.filter(
        (o) => opportunityStages[o.id] === "exploring",
      ).length,
    },
    {
      id: "preparing",
      label: "Preparing Application",
      count: myOpportunities.filter(
        (o) => opportunityStages[o.id] === "preparing",
      ).length,
    },
    {
      id: "applied",
      label: "Application Submitted",
      count: myOpportunities.filter(
        (o) => opportunityStages[o.id] === "applied",
      ).length,
    },
  ];

  const completedTasks = actionTasks.filter((t) => t.completed).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Title & Progress Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Opportunities & Progress
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Organize bookmarked programs, track your preparation milestones, and
            monitor upcoming official intake deadlines.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-3 shadow-xs shrink-0 font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">
              Tracked Items
            </span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {myOpportunities.length}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500 block text-[11px]">
              In Preparation
            </span>
            <span className="text-base font-bold text-[#3867F6] tabular-nums">
              {
                myOpportunities.filter(
                  (o) => opportunityStages[o.id] === "preparing",
                ).length
              }
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500 block text-[11px]">Submitted</span>
            <span className="text-base font-bold text-emerald-600 tabular-nums">
              {
                myOpportunities.filter(
                  (o) => opportunityStages[o.id] === "applied",
                ).length
              }
            </span>
          </div>
        </div>
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveStageFilter("All")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeStageFilter === "All"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Tracked ({myOpportunities.length})
        </button>

        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setActiveStageFilter(stage.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeStageFilter === stage.id
                ? "bg-[#3867F6] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{stage.label}</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded-sm ${
                activeStageFilter === stage.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {stage.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tracked Opportunity Cards */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No opportunities currently in this stage
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Explore verified opportunities in the directory and click "Save
              Opportunity" to track deadlines and assemble requirements here.
            </p>
            <button
              onClick={() => navigate("/discover")}
              className="mt-2 px-4 py-2 text-xs font-semibold bg-[#3867F6] text-white rounded-lg hover:bg-[#2D55D8] transition-colors"
            >
              Explore Verified Opportunities
            </button>
          </div>
        ) : (
          filteredOpportunities.map((opp) => {
            const currentStage = opportunityStages[opp.id] || "saved";

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2 text-slate-500 font-medium">
                    <span className="text-slate-900 font-semibold">
                      {opp.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{opp.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums text-slate-700 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {opp.deadline}
                    </span>
                  </div>
                  <StatusBadge status={opp.verificationStatus} size="sm" />
                </div>

                {/* Opportunity Title & Provider */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h3
                      onClick={() => viewOpportunityDetails(opp.id)}
                      className="text-lg font-bold text-slate-900 hover:text-[#3867F6] cursor-pointer transition-colors leading-snug"
                    >
                      {opp.title}
                    </h3>
                    <div className="text-xs text-slate-600 mt-1 font-medium">
                      Provider:{" "}
                      <span className="text-slate-900">{opp.provider}</span>
                    </div>
                  </div>

                  {/* Stage Selector Dropdown */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span className="text-xs text-slate-500 font-medium">
                      Stage:
                    </span>
                    <select
                      value={currentStage}
                      onChange={(e) =>
                        setOpportunityStage(
                          opp.id,
                          e.target.value as ApplicationStage,
                        )
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-[#3867F6]"
                    >
                      <option value="saved">Bookmarked</option>
                      <option value="exploring">Reviewing Evidence</option>
                      <option value="preparing">Preparing Application</option>
                      <option value="applied">Application Submitted</option>
                    </select>
                  </div>
                </div>

                {/* Key Details Strip */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      Funding Summary:
                    </span>
                    <span className="text-slate-700">{opp.funding}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      Submission Portal:
                    </span>
                    <a
                      href={opp.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3867F6] hover:underline flex items-center gap-1 font-medium truncate"
                    >
                      <span>{opp.officialUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewOpportunityDetails(opp.id)}
                      className="text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>View Verification Audit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleSaveOpportunity(opp.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Remove from tracker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    Audited on {opp.lastCheckedDate}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Disclaimer Note */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-800">
            Direct Submission Protocol:
          </span>{" "}
          Nexora Connect never automatically submits applications or charges
          processing fees on behalf of institutions. All candidates must
          complete submissions directly on the verified official host portals
          linked above.
        </div>
      </div>
    </div>
  );
};
