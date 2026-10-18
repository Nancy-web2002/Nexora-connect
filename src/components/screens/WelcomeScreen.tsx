import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Search, Compass, BookOpen } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { setScreen, updateUserProfile, setSearchQuery, setSelectedCategory, userProfile, showNotification } = useApp();

  const [inputGoal, setInputGoal] = useState<string>(
    'Find fully funded scholarships and practical AI engineering internships'
  );
  const [selectedExperience, setSelectedExperience] = useState<
    'Undergraduate' | 'Recent Graduate' | 'Early-Career Professional' | 'Career Switcher'
  >(userProfile.experienceLevel);
  const [selectedField, setSelectedField] = useState<string>(
    'Artificial Intelligence & Chemical Informatics'
  );
  const [selectedRegion, setSelectedRegion] = useState<string>('Nigeria / Africa');

  const goalSuggestions = [
    { label: 'Find a scholarship', category: 'Scholarship', query: 'fully funded scholarship' },
    { label: 'Learn AI and technology', category: 'Course', query: 'artificial intelligence machine learning' },
    { label: 'Find an internship', category: 'Internship', query: 'paid software internship' },
    { label: 'Discover free certifications', category: 'Certification', query: 'free cloud certification voucher' },
    { label: 'Find a mentor', category: 'Mentorship', query: 'mentorship network' },
  ];

  const experienceOptions: Array<'Undergraduate' | 'Recent Graduate' | 'Early-Career Professional' | 'Career Switcher'> = [
    'Undergraduate',
    'Recent Graduate',
    'Early-Career Professional',
    'Career Switcher',
  ];

  const fieldOptions = [
    'Artificial Intelligence & Chemical Informatics',
    'Software Engineering & Cloud',
    'Data Science & Analytics',
    'Applied Chemistry & Renewable Tech',
    'Product Management & Design',
  ];

  const handleApplyChip = (item: { label: string; category: string; query: string }) => {
    setInputGoal(item.label);
    setSelectedCategory(item.category);
    setSearchQuery(item.query);
  };

  const handleStartDiscovery = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      primaryGoal: inputGoal,
      experienceLevel: selectedExperience,
      fieldOfInterest: selectedField,
      location: selectedRegion,
    });
    showNotification('Preferences updated. Loading personalized opportunity matches...');
    setScreen('dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF]/40 flex flex-col justify-center px-4 sm:px-6 py-12">
      <div className="max-w-3xl mx-auto w-full">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#101828] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#3867F6]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#101828]">
              Nexora Connect
            </h1>
            <p className="text-xs text-slate-500">
              AI-Powered Community Support & Opportunity Verification
            </p>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="space-y-3 mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight text-balance">
            Your next opportunity starts here.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            Nexora Connect cross-references official portals, identifies zero-fee guarantees, verifies active intake periods, and builds actionable step-by-step roadmaps so you never fall for unverified claims.
          </p>
        </div>

        {/* Conversational Goal Input Card */}
        <form
          onSubmit={handleStartDiscovery}
          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6"
        >
          {/* Main Conversational Input */}
          <div>
            <label
              htmlFor="goal-input"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              What are you hoping to achieve?
            </label>
            <div className="relative">
              <input
                id="goal-input"
                type="text"
                value={inputGoal}
                onChange={(e) => setInputGoal(e.target.value)}
                placeholder="e.g. Find fully funded AI scholarships or transitions from chemistry to tech..."
                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 focus:border-[#3867F6] text-sm"
                required
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Sparkles className="w-5 h-5 text-[#3867F6]" />
              </div>
            </div>
          </div>

          {/* Suggested Goal Chips */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">
              Suggested pathways:
            </div>
            <div className="flex flex-wrap gap-2">
              {goalSuggestions.map((item, idx) => {
                const isSelected = inputGoal.toLowerCase().includes(item.label.toLowerCase());
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyChip(item)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                      isSelected
                        ? 'bg-[#3867F6] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 grid sm:grid-cols-2 gap-4">
            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Background
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 focus:border-[#3867F6]"
              >
                {experienceOptions.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            {/* Field of Focus */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Field / Industry
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 focus:border-[#3867F6]"
              >
                {fieldOptions.map((fld) => (
                  <option key={fld} value={fld}>
                    {fld}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Region / Geographic Eligibility */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Region
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Nigeria / Africa', 'Global / Remote', 'North America', 'Europe'].map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-2 text-xs rounded-lg border text-center transition-colors font-medium truncate ${
                    selectedRegion === reg
                      ? 'border-[#3867F6] bg-blue-50 text-[#3867F6]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Evidence-based verification with direct official source citations</span>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3867F6] hover:bg-[#2D55D8] text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <span>Discover My Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Trust & Transparency Pillars */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="p-4 rounded-xl bg-white/70 border border-slate-200/60">
            <div className="text-xs font-bold text-slate-900 mb-1">
              Zero Hallucinated Legitimacy
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Every status is backed by verifiable domain registration, corporate records, and active calls.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-slate-200/60">
            <div className="text-xs font-bold text-slate-900 mb-1">
              Official Source Transparency
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Direct links to primary universities, foundations, and employers—never intermediary scam traps.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-slate-200/60">
            <div className="text-xs font-bold text-slate-900 mb-1">
              Personalized Action Execution
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Turn complex application requirements into realistic weekly milestones and track them effortlessly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
