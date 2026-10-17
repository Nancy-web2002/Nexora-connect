import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, EvidenceBadge } from '../ui/StatusBadge';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ExternalLink,
  Bookmark,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  ArrowRight,
  Info,
  Clock,
  ArrowLeft,
  Check,
  Scale,
} from 'lucide-react';

export const OpportunityDetailScreen: React.FC = () => {
  const {
    selectedOpportunity,
    opportunities,
    setSelectedOpportunityId,
    savedOpportunityIds,
    toggleSaveOpportunity,
    openEligibilityCheck,
    generateActionPlanForOpportunity,
    setScreen,
  } = useApp();

  const isSaved = savedOpportunityIds.includes(selectedOpportunity.id);

  // Status explanation lookup
  const getStatusSummaryCard = () => {
    switch (selectedOpportunity.verificationStatus) {
      case 'Verified':
        return {
          title: 'Verified Official Opportunity',
          colorBorder: 'border-emerald-200',
          colorBg: 'bg-emerald-50/70',
          icon: ShieldCheck,
          iconColor: 'text-emerald-600',
          summaryText:
            'This opportunity has been corroborated across accredited registries. Active intake is live, domain identity is authenticated, and the provider strictly adheres to a zero-fee evaluation guarantee.',
          legalNotice:
            'Verification confirms institutional legitimacy and absence of known deceptive flags. It does not imply guaranteed admission or program placement.',
        };
      case 'Partially Verified':
        return {
          title: 'Partially Verified — Independent Caution Advised',
          colorBorder: 'border-amber-200',
          colorBg: 'bg-amber-50/70',
          icon: ShieldAlert,
          iconColor: 'text-amber-600',
          summaryText:
            'The host entity is registered and authentic, but specific cohort parameters (such as co-matched budget amounts, deadline extensions, or manual intake workflows) lack multi-source corroboration.',
          legalNotice:
            'Applicants should independently verify deadline dates and financial terms with their faculty sponsor or the official institution contact before committing resources.',
        };
      case 'Unverified':
        return {
          title: 'Unverified / Critical Deception Flags Detected',
          colorBorder: 'border-rose-200',
          colorBg: 'bg-rose-50/70',
          icon: ShieldX,
          iconColor: 'text-rose-600',
          summaryText:
            'Critical verification failures detected: Upfront fee demands for application review, recent domain registration (<60 days), unaccredited corporate claims, or absence from official vendor partner directories.',
          legalNotice:
            'High risk warning: Do NOT transfer application review fees, banking information, or sensitive identity documents to this platform.',
        };
    }
  };

  const statusCard = getStatusSummaryCard();
  const StatusIcon = statusCard.icon;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Navigation & Fast Opportunity Switcher for Demo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={() => setScreen('discover')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery Search</span>
        </button>

        {/* Demo Switcher: lets judges quickly inspect Verified vs Partially Verified vs Unverified */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium shrink-0">Demo Quick Switch:</span>
          <select
            value={selectedOpportunity.id}
            onChange={(e) => setSelectedOpportunityId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:outline-hidden focus:border-[#3867F6]"
          >
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                [{opp.verificationStatus}] {opp.title.slice(0, 38)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION A: Opportunity Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-slate-900 font-semibold">{selectedOpportunity.category}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {selectedOpportunity.location}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Deadline: {selectedOpportunity.deadline}
              </span>
            </div>
            <StatusBadge status={selectedOpportunity.verificationStatus} size="lg" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {selectedOpportunity.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
            <Building className="w-4 h-4 text-slate-400" />
            <span>Official Provider:</span>
            <span className="font-bold text-slate-900">{selectedOpportunity.provider}</span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl pt-1">
            {selectedOpportunity.description}
          </p>
        </div>

        {/* Key Parameters Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Funding & Benefits
            </span>
            <span className="text-xs font-bold text-slate-900 leading-relaxed block">
              {selectedOpportunity.funding}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Application Method
            </span>
            <span className="text-xs font-bold text-slate-900 leading-relaxed block">
              {selectedOpportunity.applicationMethod}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Verification Audit Date
            </span>
            <span className="text-xs font-bold font-mono text-slate-900 tabular-nums block">
              {selectedOpportunity.lastCheckedDate}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Multi-source registry scan
            </span>
          </div>
        </div>

        {/* Eligibility Requirements List */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-slate-900">
            Eligibility Requirements & Criteria
          </h2>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {selectedOpportunity.eligibility.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50/70 border border-slate-100 text-xs text-slate-700"
              >
                <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                  {index + 1}
                </div>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION F: Core User Actions Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => toggleSaveOpportunity(selectedOpportunity.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-2 ${
                isSaved
                  ? 'bg-blue-50 border-blue-200 text-[#3867F6]'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved in My Tracker' : 'Save Opportunity'}</span>
            </button>

            <button
              onClick={() => openEligibilityCheck(selectedOpportunity)}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              <span>Check My Eligibility</span>
            </button>

            <button
              onClick={() => generateActionPlanForOpportunity(selectedOpportunity)}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#3867F6] hover:bg-[#2D55D8] text-white transition-colors flex items-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate My Action Plan</span>
            </button>
          </div>

          <a
            href={selectedOpportunity.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-2 shadow-xs"
          >
            <span>Apply on Official Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* SECTION B: Prominent Verification Summary Panel */}
      <div className={`p-6 sm:p-7 rounded-2xl border ${statusCard.colorBorder} ${statusCard.colorBg} space-y-4`}>
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0">
            <StatusIcon className={`w-6 h-6 ${statusCard.iconColor}`} />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Verification Assessment Summary
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {statusCard.title}
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed pt-1">
              {statusCard.summaryText}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 text-xs text-slate-600 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Operational Integrity Principle:</span>{' '}
            {statusCard.legalNotice}
          </div>
        </div>
      </div>

      {/* SECTION C: 6-Point Evidence Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Independent Evidence Checklist
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed audit results across 6 required authenticity factors
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md tabular-nums">
              6 of 6 Audited
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {selectedOpportunity.evidenceChecks.map((check, index) => (
            <div
              key={check.id}
              className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-colors space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    0{index + 1}.
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {check.name}
                  </span>
                </div>
                <EvidenceBadge status={check.status} />
              </div>

              {/* Evidence Found */}
              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900">Evidence Established: </span>
                {check.evidence}
              </div>

              {/* Uncertainty or Limitation if present */}
              {check.uncertaintyOrLimitation && (
                <div className="text-xs text-amber-900 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/70 leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Limitation / Uncertainty: </span>
                    {check.uncertaintyOrLimitation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION D: Source Transparency & Evidence Provenance */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Sources & Evidence Provenance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Primary registry entries, institutional notices, and authoritative URLs accessed by our verification agent
          </p>
        </div>

        <div className="grid gap-4">
          {selectedOpportunity.sources.map((src, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-colors ${
                src.isPrimary
                  ? 'bg-blue-50/30 border-blue-200/80'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {src.isPrimary ? (
                    <span className="font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded text-[11px]">
                      Primary Official Source
                    </span>
                  ) : (
                    <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      Corroborating Third-Party Source
                    </span>
                  )}
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{src.type}</span>
                </div>
                <div className="font-mono text-slate-400 text-[11px] tabular-nums">
                  Accessed: {src.dateAccessed}
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-2">
                {src.title}
              </h4>
              <div className="text-xs text-slate-600 mt-0.5">
                Publisher: <span className="font-semibold text-slate-800">{src.publisher}</span>
              </div>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900">Corroborates: </span>
                {src.supports}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                  {src.url}
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#3867F6] hover:text-[#2D55D8] flex items-center gap-1.5 shrink-0"
                >
                  <span>Visit Official Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION E: AI Explanation */}
      <div className="bg-[#101828] text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#3867F6]">
          <Sparkles className="w-4 h-4" />
          <span>Why this result received this status</span>
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight">
          AI Verification Rationale
        </h3>

        <p className="text-sm text-slate-300 leading-relaxed">
          {selectedOpportunity.aiExplanation}
        </p>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            Limitations & Scope of Verification:
          </div>
          <p className="leading-relaxed">
            {selectedOpportunity.limitationsNotice}
          </p>
        </div>
      </div>
    </div>
  );
};
