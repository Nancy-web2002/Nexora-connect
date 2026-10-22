import React from "react";
import { useApp } from "../../context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  LayoutDashboard,
  Compass,
  ShieldCheck,
  BotMessageSquare,
  ListTodo,
  BookMarked,
  Sparkles,
  Settings,
  ChevronRight,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { userProfile, savedOpportunityIds, actionTasks } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const isPlanTab =
    location.pathname === "/ai-assistant" &&
    new URLSearchParams(location.search).get("tab") === "plan";

  const completedTasksCount = actionTasks.filter((t) => t.completed).length;

  const navItems: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }[] = [
    { id: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "/discover", label: "Discover Opportunities", icon: Compass },
    {
      id: "/opportunity/details",
      label: "Opportunity Verification",
      icon: ShieldCheck,
    },
    { id: "/ai-assistant", label: "AI Assistant", icon: BotMessageSquare },
    {
      id: "/ai-assistant?tab=plan",
      label: "My Action Plan",
      icon: ListTodo,
      badge: `${completedTasksCount}/${actionTasks.length}`,
    },
    {
      id: "/opportunity",
      label: "My Opportunities & Progress",
      icon: BookMarked,
      badge: savedOpportunityIds.length,
    },
    { id: "/settings", label: "Settings & Profile", icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    navigate(id);
    onClose();
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log(error.message);
      return;
    }

    navigate("/");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#101828] text-white flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800/80">
          <Link
            to={"/dashboard"}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#3867F6] flex items-center justify-center text-white shadow-sm shadow-[#3867F6]/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-white group-hover:text-blue-300 transition-colors">
                Nexora Connect
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Verified Opportunity Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Quick onboarding / kickoff banner */}
        <div className="p-4 mx-4 mt-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Demo
            </span>
            <button
              onClick={() => handleNavClick("/welcome")}
              className="text-[11px] text-slate-300 hover:text-white underline underline-offset-2"
            >
              Start Screen 1
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Personalize goals or walk through the 6-screen connected journey.
          </p>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            Platform Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === "/ai-assistant?tab=plan"
                ? isPlanTab
                : item.id === "/ai-assistant"
                  ? location.pathname === "/ai-assistant" && !isPlanTab
                  : location.pathname === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "bg-[#3867F6] text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div
            onClick={() => handleNavClick("/settings")}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/70 cursor-pointer transition-colors"
          >
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
              onError={(e) => {
                // styled fallback container
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {userProfile.name}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {userProfile.experienceLevel} · {userProfile.location}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs px-2">
            <button
              onClick={() => handleSignOut()}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-[11px]"
              title="Sign Out to Get Started page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={() => handleNavClick("/signin")}
              className="text-[#3867F6] hover:text-blue-300 transition-colors text-[11px] font-medium"
            >
              Auth Pages
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
