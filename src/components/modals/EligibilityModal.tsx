import React, { useState } from 'react';
import { Opportunity } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, X, AlertCircle, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface EligibilityModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({
  opportunity,
  isOpen,
  onClose,
}) => {
  const { userProfile, generateActionPlanForOpportunity, showNotification } = useApp();

  if (!isOpen || !opportunity) return null;

  // Track user confirmation of each requirement
  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, boolean>>({
    });

    React.useEffect(() =>{
      setCheckedCriteria({});
    }, [opportunity?.id]);
    if (!isOpen || !opportunity) return null;

  const toggleCriterion = (index: number) => {
    setCheckedCriteria((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const totalCriteria = opportunity.eligibility.length;
  const metCriteriaCount = opportunity.eligibility.filter((_, idx) => checkedCriteria[idx]).length;
  const isFullyEligible = metCriteriaCount === totalCriteria;
  const isPartiallyEligible = metCriteriaCount > 0 && metCriteriaCount < totalCriteria;

  const handleGeneratePlan = () => {
    onClose();
    generateActionPlanForOpportunity(opportunity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#3867F6] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Interactive Eligibility Check
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {opportunity.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Provider: {opportunity.provider}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Context Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Comparing against profile: <span className="font-semibold text-slate-800">{userProfile.name}</span> ({userProfile.experienceLevel}, {userProfile.location})
          </div>
        </div>

        {/* Content: Requirements Checklist */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Verify each official requirement below to assess your qualification profile before applying. Check the box if you currently meet the criteria:
          </p>

          <div className="space-y-3">
            {opportunity.eligibility.map((criterion, idx) => {
              const isChecked = Boolean(checkedCriteria[idx]);
              return (
                <div
                  key={idx}
                  onClick={() => toggleCriterion(idx)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-3 select-none ${
                    isChecked
                      ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                      isChecked
                        ? 'bg-[#3867F6] border-[#3867F6] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-xs leading-relaxed flex-1">
                    {criterion}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assessment Result Box */}
          <div
            className={`p-4 rounded-lg border mt-6 ${
              isFullyEligible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isPartiallyEligible
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {isFullyEligible ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Strong Eligibility Match ({metCriteriaCount}/{totalCriteria} Criteria Met)</span>
                </>
              ) : isPartiallyEligible ? (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Partial Eligibility Profile ({metCriteriaCount}/{totalCriteria} Criteria Met)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Prerequisites Unmet (0/{totalCriteria} Criteria Met)</span>
                </>
              )}
            </div>
            <p className="text-xs mt-1.5 leading-relaxed opacity-90">
              {isFullyEligible
                ? 'Your background strongly satisfies published intake criteria. We recommend initiating your application packet and scheduling referee recommendations immediately.'
                : isPartiallyEligible
                ? 'You satisfy key baseline qualifications, but some criteria remain unconfirmed. Generate an action plan to address specific prerequisite gaps.'
                : 'You may not currently meet the mandatory thresholds. Consider foundational skill courses or alternative cohort intakes.'}
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-slate-500 italic">
            Note: Nexora eligibility evaluations are advisory and based on available public guidelines. Official selection committees reserve sole discretion.
          </p>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleGeneratePlan}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#3867F6] hover:bg-[#2D55D8] rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Targeted Action Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
