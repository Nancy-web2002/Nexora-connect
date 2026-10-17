import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Opportunity } from '../../types';
import {
  Search,
  Filter,
  Sparkles,
  Bookmark,
  Calendar,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

export const DiscoveryScreen: React.FC = () => {
  const {
    opportunities,
    savedOpportunityIds,
    toggleSaveOpportunity,
    viewOpportunityDetails,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedVerificationStatus,
    setSelectedVerificationStatus,
  } = useApp();

  const [selectedFunding, setSelectedFunding] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'deadline' | 'recent'>('relevance');
  const [isSearchingAi, setIsSearchingAi] = useState<boolean>(false);
  const [searchStep, setSearchStep] = useState<string>('');

  const quickPresets = [
    {
      label: 'Nigerian University AI & Tech',
      query: 'Find fully funded AI scholarships and internships for Nigerian university students',
      category: 'All',
      verification: 'All',
    },
    {
      label: 'Fully Funded Scholarships',
      query: 'fully funded mastercard foundation tuition living stipend',
      category: 'Scholarship',
      verification: 'Verified',
    },
    {
      label: 'Free Cloud Vouchers (GADS)',
      query: 'Google Africa Developer cloud certification',
      category: 'Certification',
      verification: 'Verified',
    },
    {
      label: 'Paid Fintech Internships',
      query: 'Interswitch Emerging Engineers paid backend internship Lagos',
      category: 'Internship',
      verification: 'All',
    },
    {
      label: 'Flagged / Unverified Traps',
      query: 'FastTrack Cloud fee review upfront payment',
      category: 'All',
      verification: 'Unverified',
    },
  ];

  const handleRunPreset = (preset: typeof quickPresets[0]) => {
    setSearchQuery(preset.query);
    setSelectedCategory(preset.category);
    setSelectedVerificationStatus(preset.verification);

    // Trigger AI gathering state
    setIsSearchingAi(true);
    setSearchStep('Querying verified institutional registries...');
    setTimeout(() => {
      setSearchStep('Cross-referencing domain certificates & fee policies...');
    }, 450);
    setTimeout(() => {
      setSearchStep('Synthesizing eligibility constraints...');
    }, 900);
    setTimeout(() => {
      setIsSearchingAi(false);
      setSearchStep('');
    }, 1300);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingAi(true);
    setSearchStep('Parsing natural language criteria...');
    setTimeout(() => {
      setSearchStep('Scanning 9 corroborated opportunity records...');
    }, 400);
    setTimeout(() => {
      setIsSearchingAi(false);
      setSearchStep('');
    }, 850);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedVerificationStatus('All');
    setSelectedFunding('All');
    setSelectedRegion('All');
  };

  // Filter logic
  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Search query match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = opp.title.toLowerCase().includes(q);
          const matchesProvider = opp.provider.toLowerCase().includes(q);
          const matchesDesc = opp.description.toLowerCase().includes(q);
          const matchesFunding = opp.funding.toLowerCase().includes(q);
          const matchesLocation = opp.location.toLowerCase().includes(q);
          const matchesCategory = opp.category.toLowerCase().includes(q);
          const matchesStatus = opp.verificationStatus.toLowerCase().includes(q);
          if (
            !matchesTitle &&
            !matchesProvider &&
            !matchesDesc &&
            !matchesFunding &&
            !matchesLocation &&
            !matchesCategory &&
            !matchesStatus
          ) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && opp.category !== selectedCategory) {
          return false;
        }

        // Verification filter
        if (
          selectedVerificationStatus !== 'All' &&
          opp.verificationStatus !== selectedVerificationStatus
        ) {
          return false;
        }

        // Region filter
        if (selectedRegion !== 'All' && opp.regionTag !== selectedRegion) {
          return false;
        }

        // Funding filter
        if (selectedFunding !== 'All') {
          if (selectedFunding === 'Fully Funded' && !opp.funding.includes('Fully Funded') && !opp.funding.includes('100% Free')) {
            return false;
          }
          if (selectedFunding === 'Paid' && !opp.funding.includes('Paid')) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return a.deadlineTimestamp - b.deadlineTimestamp;
        }
        if (sortBy === 'recent') {
          return b.id.localeCompare(a.id);
        }
        // default relevance: verified first
        if (a.verificationStatus === 'Verified' && b.verificationStatus !== 'Verified') return -1;
        if (b.verificationStatus === 'Verified' && a.verificationStatus !== 'Verified') return 1;
        return 0;
      });
  }, [
    opportunities,
    searchQuery,
    selectedCategory,
    selectedVerificationStatus,
    selectedFunding,
    selectedRegion,
    sortBy,
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Opportunity Discovery
          </h1>
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md tabular-nums">
            {filteredOpportunities.length} Available
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Search with natural language queries across verified academic scholarships, apprenticeships, and certified curricula. Each opportunity displays audited verification status and evidence provenance.
        </p>
      </div>

      {/* Large Natural-Language Search Field */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <form onSubmit={handleManualSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type natural language query (e.g. Find fully funded AI scholarships and internships for Nigerian university students)..."
            className="w-full pl-11 pr-32 py-3.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 focus:border-[#3867F6]"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#3867F6] hover:bg-[#2D55D8] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Example Query Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Quick Test Prompts:</span>
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleRunPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium border border-slate-200/60"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Multi-Dimensional Filter Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#3867F6]"
            >
              <option value="All">All Categories</option>
              <option value="Scholarship">Scholarships</option>
              <option value="Internship">Internships</option>
              <option value="Certification">Certifications</option>
              <option value="Course">Courses</option>
              <option value="Mentorship">Mentorship</option>
              <option value="Fellowship">Fellowships</option>
            </select>

            {/* Verification Status Filter */}
            <select
              value={selectedVerificationStatus}
              onChange={(e) => setSelectedVerificationStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#3867F6]"
            >
              <option value="All">All Verification</option>
              <option value="Verified">Verified Only</option>
              <option value="Partially Verified">Partially Verified</option>
              <option value="Unverified">Unverified / Caution</option>
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-[#3867F6]"
            >
              <option value="All">All Regions</option>
              <option value="Nigeria / Africa">Nigeria & Africa</option>
              <option value="Global">Global / Remote</option>
            </select>

            {/* Reset Button */}
            {(searchQuery || selectedCategory !== 'All' || selectedVerificationStatus !== 'All' || selectedRegion !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium px-2 py-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="relevance">Credibility & Relevance</option>
              <option value="deadline">Approaching Deadline</option>
              <option value="recent">Recently Audited</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Gathering & Verification State */}
      {isSearchingAi && (
        <div className="p-6 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-center gap-4 text-center">
          <div className="w-6 h-6 border-2 border-[#3867F6] border-t-transparent rounded-full animate-spin shrink-0" />
          <div className="text-left">
            <div className="text-sm font-bold text-slate-900">
              Nexora AI Engine Evaluating Opportunities...
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {searchStep}
            </div>
          </div>
        </div>
      )}

      {/* Search Results List */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No matching opportunities found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Try broadening your query keywords or clearing the category and verification status filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-[#3867F6] text-white rounded-lg hover:bg-[#2D55D8] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredOpportunities.map((opp) => {
            const isSaved = savedOpportunityIds.includes(opp.id);
            return (
              <div
                key={opp.id}
                className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Clean Unboxed Metadata Header (Zero-Pill Discipline) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    <span className="text-slate-900">{opp.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{opp.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Deadline {opp.deadline}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Audited {opp.lastCheckedDate}</span>
                  </div>
                  <StatusBadge status={opp.verificationStatus} size="md" />
                </div>

                {/* Main Info */}
                <div>
                  <h3
                    onClick={() => viewOpportunityDetails(opp.id)}
                    className="text-lg font-bold text-slate-900 hover:text-[#3867F6] cursor-pointer transition-colors leading-snug"
                  >
                    {opp.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-600 mt-1">
                    Provider: <span className="text-slate-900">{opp.provider}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                {/* Funding & Eligibility Callout Strip */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      Funding & Benefits:
                    </span>
                    <span className="text-slate-700 leading-relaxed">
                      {opp.funding}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      Eligibility Highlights:
                    </span>
                    <span className="text-slate-700 line-clamp-2 leading-relaxed">
                      {opp.eligibility.slice(0, 2).join(' · ')}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSaveOpportunity(opp.id)}
                      className={`text-xs font-medium px-3.5 py-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
                        isSaved
                          ? 'bg-blue-50 border-blue-200 text-[#3867F6]'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      <span>{isSaved ? 'Saved in Tracker' : 'Save Opportunity'}</span>
                    </button>

                    <a
                      href={opp.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 flex items-center gap-1.5"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>

                  <button
                    onClick={() => viewOpportunityDetails(opp.id)}
                    className="text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View Evidence & Audit Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transparent Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-500 leading-relaxed">
        <strong>Transparency & Sandbox Prototype Note:</strong> Nexora Connect synthesizes public records and verified institutional announcements. While verified badges indicate authenticated domains and non-fee confirmations, applicants must review official guidelines directly on provider portals prior to submission.
      </div>
    </div>
  );
};
