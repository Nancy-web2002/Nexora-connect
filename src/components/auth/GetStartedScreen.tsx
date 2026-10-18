import React from "react";
import {
  ShieldCheck,
  ArrowRight,
  LogIn,
  CheckCircle2,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export const GetStartedScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col justify-between selection:bg-[#3867F6]/15 selection:text-[#101828]">
      {/* Top Header */}
      <header className="h-20 px-6 sm:px-12 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-xs sticky top-0 z-20">
        <div>
          <Link
            className="flex items-center gap-3 cursor-pointer select-none"
            to={"/"}
          >
            <div className="w-10 h-10 rounded-xl bg-[#101828] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#3867F6]" />
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[#101828]">
                Nexora Connect
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Verified Opportunity Platform
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={"/signin"}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            to={"/signup"}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#3867F6] hover:bg-[#2D55D8] rounded-lg transition-colors shadow-xs"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Welcome Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-[#3867F6] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Opportunity Verification</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#101828] tracking-tight leading-[1.15] text-balance">
              Your next opportunity starts here.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Discover opportunities, verify information, and take meaningful
              steps toward your goals with AI-powered guidance.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                to={"/signup"}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3867F6] hover:bg-[#2D55D8] text-white font-semibold text-sm transition-colors shadow-sm group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to={"/signin"}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 transition-colors shadow-xs"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Sign In</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Evidence-backed audits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero application review fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Direct official portals</span>
              </div>
            </div>
          </div>

          {/* Right Column: Subtle Visual Element */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              {/* Subtle accent glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#3867F6]/15 to-blue-200/30 rounded-2xl blur-lg pointer-events-none" />

              {/* Elevated Card Preview fitting Nexora design */}
              <div className="relative bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#3867F6] flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Verification Engine
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Status: Verified Official
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Confirmed
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                      Target Pathway
                    </span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      Fully Funded Global STEM Scholars Program
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">
                        Fee Policy
                      </span>
                      <span className="font-semibold text-emerald-600">
                        Zero Fee Guaranteed
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">
                        Registry Check
                      </span>
                      <span className="font-semibold text-slate-900">
                        TLS & DNSSEC Valid
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    Nexora Connect evaluates official records to ensure every
                    opportunity is authentic, active, and actionable.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Ready to explore?</span>
                  <Link
                    to={"/signup"}
                    className="font-semibold text-[#3867F6] hover:text-[#2D55D8] flex items-center gap-1"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 sm:px-12 border-t border-slate-200/80 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Nexora Connect</span>
          <span>·</span>
          <span>AI-Powered Opportunity Verification Platform</span>
        </div>
        <div>© 2026 Nexora Connect. All rights reserved.</div>
      </footer>
    </div>
  );
};
