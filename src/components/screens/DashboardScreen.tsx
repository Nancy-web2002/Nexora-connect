import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import {
  Search,
  Sparkles,
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  Users,
  Compass,
  ListTodo,
  TrendingUp,
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const {
    userProfile,
    opportunities,
    savedOpportunityIds,
    toggleSaveOpportunity,
    viewOpportunityDetails,
    setScreen,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    actionTasks,
    toggleTaskCompleted,
  } = useApp();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScreen('discover');
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setScreen('discover');
  };

  const recommendedOpportunities = opportunities.filter((o) => o.featured || o.id === 'opp-1' || o.id === 'opp-2' || o.id === 'opp-3');
  const recentlyVerifiedOpportunities = opportunities.slice(0, 4);

  const completedTasks = actionTasks.filter((t) => t.completed).length;
  const nextTask = actionTasks.find((t) => !t.completed) || actionTasks[0];

  const categories = [
    { label: 'Scholarships', icon: GraduationCap, category: 'Scholarship', count: 2 },
    { label: 'Internships', icon: Briefcase, category: 'Internship', count: 2 },
    { label: 'Courses', icon: BookOpen, category: 'Course', count: 1 },
    { label: 'Certifications', icon: Award, category: 'Certification', count: 2 },
    { label: 'Mentorship', icon: Users, category: 'Mentorship', count: 1 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Good morning, {userProfile.name.split(' ')[0]}
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Track your verified applications, explore high-trust scholarships, and advance your AI roadmap.
          </p>
        </div>

        {/* Quick Progress Summary (Tabular figures) */}
        <div className="flex items-center gap-3 sm:gap-6 bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-xs shrink-0">
          <div className="text-center sm:text-left">
            <div className="text-xs text-slate-500 font-medium">Saved Items</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {savedOpportunityIds.length}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center sm:text-left">
            <div className="text-xs text-slate-500 font-medium">Active Plans</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              2
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center sm:text-left">
            <div className="text-xs text-slate-500 font-medium">Steps Completed</div>
            <div className="text-lg font-bold font-mono text-emerald-600 tabular-nums">
              {completedTasks}/{actionTasks.length}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent AI Assistant Search Bar */}
      <div className="bg-gradient-to-r from-[#101828] to-[#1E293B] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-xs text-blue-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#3867F6]" />
            <span>AI Opportunity & Verification Search</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            What opportunity are you looking for?
          </h2>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Find fully funded AI scholarships and internships for Nigerian university students..."
              className="w-full pl-4 pr-28 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#3867F6] hover:bg-[#2D55D8] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400">Popular queries:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Find fully funded AI scholarships and internships for Nigerian university students');
                setScreen('discover');
              }}
              className="underline hover:text-white transition-colors"
            >
              "Fully funded AI scholarships in Nigeria"
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Google Africa Developer cloud vouchers');
                setScreen('discover');
              }}
              className="underline hover:text-white transition-colors"
            >
              "Free cloud certification vouchers"
            </button>
          </div>
        </div>

        {/* Decorative corner image with subtle overlay */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-80 opacity-25 mix-blend-luminosity pointer-events-none">
          <img
            src="/src/assets/images/campus_innovation_lab_1791809943504.jpg"
            alt="Campus Innovation"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Quick Access Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Explore by Opportunity Category
          </h3>
          <button
            onClick={() => setScreen('discover')}
            className="text-xs font-semibold text-[#3867F6] hover:text-[#2D55D8] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.category)}
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all text-left flex flex-col justify-between group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#3867F6] flex items-center justify-center mb-3 group-hover:bg-[#3867F6] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 group-hover:text-[#3867F6] transition-colors">
                    {cat.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                    {cat.count} verified listings
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue Your Plan Banner */}
      {nextTask && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#3867F6] uppercase tracking-wider">
                  Continue Your Plan
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-medium text-slate-500 font-mono tabular-nums">
                  Due {nextTask.dueDate || 'Soon'}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mt-0.5">
                {nextTask.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {nextTask.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => toggleTaskCompleted(nextTask.id)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Mark Complete</span>
            </button>
            <button
              onClick={() => setScreen('action-plan')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#3867F6] hover:bg-[#2D55D8] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Open Action Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Split Grid: Recommended for You & Recently Verified */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended for You (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Recommended for You
              </h3>
              <p className="text-xs text-slate-500">
                Matched to your profile: {userProfile.experienceLevel} · {userProfile.fieldOfInterest}
              </p>
            </div>
            <button
              onClick={() => setScreen('discover')}
              className="text-xs font-semibold text-[#3867F6] hover:underline"
            >
              Explore all 9
            </button>
          </div>

          <div className="space-y-4">
            {recommendedOpportunities.map((opp) => {
              const isSaved = savedOpportunityIds.includes(opp.id);
              return (
                <div
                  key={opp.id}
                  className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Unboxed Metadata Header (Zero-Pill Discipline) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{opp.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{opp.location}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">Deadline {opp.deadline}</span>
                      </div>
                      <StatusBadge status={opp.verificationStatus} size="sm" />
                    </div>

                    <h4
                      onClick={() => viewOpportunityDetails(opp.id)}
                      className="text-base font-bold text-slate-900 hover:text-[#3867F6] cursor-pointer transition-colors leading-snug"
                    >
                      {opp.title}
                    </h4>

                    <div className="text-xs font-medium text-slate-600 mt-1">
                      Provider: <span className="text-slate-900">{opp.provider}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Funding summary */}
                    <div className="mt-3 py-2 px-3 rounded-lg bg-slate-50 text-xs text-slate-700 flex items-center gap-2 border border-slate-100">
                      <span className="font-semibold text-slate-900 shrink-0">Funding & Benefits:</span>
                      <span className="truncate">{opp.funding}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleSaveOpportunity(opp.id)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                        isSaved
                          ? 'bg-blue-50 border-blue-200 text-[#3867F6]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      <span>{isSaved ? 'Saved to Tracker' : 'Save'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewOpportunityDetails(opp.id)}
                        className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                      >
                        <span>Audit & Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently Verified / Credibility Stream (1 Column) */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Recently Verified
            </h3>
            <p className="text-xs text-slate-500">
              Corroborated evidence audit logs
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100">
            {recentlyVerifiedOpportunities.map((opp) => (
              <div
                key={opp.id}
                onClick={() => viewOpportunityDetails(opp.id)}
                className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-[#3867F6]">
                    {opp.title}
                  </div>
                  <StatusBadge status={opp.verificationStatus} size="sm" />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>{opp.provider}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">Audited {opp.lastCheckedDate}</span>
                </div>
                <div className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {opp.aiExplanation}
                </div>
              </div>
            ))}
          </div>

          {/* Verification Protocol Callout */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-2">
            <div className="font-bold text-[#101828] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#3867F6]" />
              Nexora Verification Standard
            </div>
            <p className="text-slate-600 leading-relaxed">
              We audit SSL certificates, institutional domain ownership, and zero-fee policies. Opportunities flagged with upfront review fees are classified as Unverified to protect candidates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
