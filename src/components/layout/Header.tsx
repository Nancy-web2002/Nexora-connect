import React from "react";
import { Menu, Sparkles, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();

  const isPlanTab =
    location.pathname === "/ai-assistant" &&
    new URLSearchParams(location.search).get("tab") === "plan";

  const getBreadcrumbs = () => {
    if (isPlanTab) {
      return ["Action Plan", "Interactive Milestones & Tasks"];
    }

    switch (location.pathname) {
      case "/":
        return ["Nexora Connect", "Get Started"];
      case "/signup":
        return ["Authentication", "Create Account"];
      case "/signin":
        return ["Authentication", "Sign In"];
      case "/welcome":
        return ["Nexora Connect", "Welcome & Goal Personalization"];
      case "/dashboard":
        return ["Nexora Connect", "Overview Dashboard"];
      case "/discover":
        return ["Opportunities", "Search & Evidence Discovery"];
      case "/opportunity/details":
        return ["Opportunities", "Evidence Audit & Verification"];
      case "/ai-assistant":
        return ["AI Advisory", "Community Chat & Recommendations"];
      case "/opportunity":
        return ["Tracker", "Saved Opportunities & Deadlines"];
      case "/settings":
        return ["Account", "Profile & Discovery Preferences"];
      default:
        return ["Nexora Connect", "Dashboard"];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-18 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="font-medium text-slate-900">{breadcrumbs[0]}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium truncate">
            {breadcrumbs[1]}
          </span>
        </nav>
      </div>

      {/* Zone 2: Fast Navigation Shortcuts (Desktop) */}
      <div className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600 shrink-0">
        <Link
          to={"/discover"}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
            location.pathname === "/discover"
              ? "text-[#3867F6] font-semibold"
              : ""
          }`}
        >
          Explore All (9)
        </Link>
        <Link
          to={"/opportunity/details"}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
            location.pathname === "/opportunity/details"
              ? "text-[#3867F6] font-semibold"
              : ""
          }`}
        >
          Audit Panel
        </Link>
        <Link
          to={"/ai-assistant"}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
            location.pathname === "/ai-assistant" && !isPlanTab
              ? "text-[#3867F6] font-semibold"
              : ""
          }`}
        >
          AI Advisor
        </Link>
        <Link
          to={"/ai-assistant?tab=plan"}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
            isPlanTab ? "text-[#3867F6] font-semibold" : ""
          }`}
        >
          Action Plan
        </Link>
      </div>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {location.pathname !== "/ai-assistant" ? (
          <Link
            to={"/ai-assistant"}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#3867F6] hover:bg-[#2D55D8] rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI Advisor</span>
          </Link>
        ) : (
          <Link
            to={"/discover"}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap border border-slate-200"
          >
            <span>Search Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </header>
  );
};
