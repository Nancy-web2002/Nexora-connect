import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Bell, Save } from "lucide-react";

export const SettingsScreen: React.FC = () => {
  const { userProfile, updateUserProfile, showNotification } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [role, setRole] = useState(userProfile.role);
  const [primaryGoal, setPrimaryGoal] = useState(userProfile.primaryGoal);
  const [fieldOfInterest, setFieldOfInterest] = useState(
    userProfile.fieldOfInterest,
  );
  const [experienceLevel, setExperienceLevel] = useState(
    userProfile.experienceLevel,
  );
  const [location, setLocation] = useState(userProfile.location);

  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifyStatusChanges, setNotifyStatusChanges] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateUserProfile({
      name,
      role,
      primaryGoal,
      fieldOfInterest,
      experienceLevel,
      location,
    });
    if (ok) showNotification("Profile and verification preferences saved.");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Account & Discovery Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Customize your academic background, career trajectory, and
          verification alerts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border border-slate-200"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{name}</h3>
              <p className="text-xs text-slate-500 font-mono">{email}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-[#3867F6] bg-blue-50 px-2 py-0.5 rounded">
                Verified Candidate Profile
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden focus:border-[#3867F6]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden focus:border-[#3867F6]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Background / Experience
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden focus:border-[#3867F6]"
              >
                <option value="Undergraduate">Undergraduate</option>
                <option value="Recent Graduate">Recent Graduate</option>
                <option value="Early-Career Professional">
                  Early-Career Professional
                </option>
                <option value="Career Switcher">Career Switcher</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location / Region
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden focus:border-[#3867F6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Field of Interest
              </label>
              <input
                type="text"
                value={fieldOfInterest}
                onChange={(e) => setFieldOfInterest(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden focus:border-[#3867F6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Goal Description
              </label>
              <textarea
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden focus:border-[#3867F6]"
              />
            </div>
          </div>
        </div>

        {/* Verification Alert Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#3867F6]" />
            <span>Verification & Deadline Alerts</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyDeadlines}
                onChange={(e) => setNotifyDeadlines(e.target.checked)}
                className="mt-0.5 rounded text-[#3867F6]"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-900">
                  Approaching Intake Deadline Reminders
                </div>
                <div className="text-slate-500">
                  Notify me 14 days and 7 days prior to verified application
                  cutoff dates.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyStatusChanges}
                onChange={(e) => setNotifyStatusChanges(e.target.checked)}
                className="mt-0.5 rounded text-[#3867F6]"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-900">
                  Verification Status Audits
                </div>
                <div className="text-slate-500">
                  Alert me if any tracked program updates its intake window or
                  budget allocation.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3867F6] hover:bg-[#2D55D8] text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
