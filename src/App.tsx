import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { supabase } from "./lib/supabaseClient";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { WelcomeScreen } from "./components/screens/WelcomeScreen";
import { DashboardScreen } from "./components/screens/DashboardScreen";
import { DiscoveryScreen } from "./components/screens/DiscoveryScreen";
import { OpportunityDetailScreen } from "./components/screens/OpportunityDetailScreen";
import { AIAssistantScreen } from "./components/screens/AIAssistantScreen";
import { MyOpportunitiesScreen } from "./components/screens/MyOpportunitiesScreen";
import { SettingsScreen } from "./components/screens/SettingsScreen";
import { GetStartedScreen } from "./components/auth/GetStartedScreen";
import { SignUpScreen } from "./components/auth/SignUpScreen";
import { SignInScreen } from "./components/auth/SignInScreen";
import { EligibilityModal } from "./components/modals/EligibilityModal";
import { CheckCircle2 } from "lucide-react";
import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/auth/protectedRoute";
import EmailVerificationScreen from "./components/auth/EmailVerification";
import type { User } from "@supabase/supabase-js";
import ResetPassword from "./components/auth/ResetPassword";

const AppContent: React.FC = () => {
  const {
    notification,
    isEligibilityModalOpen,
    setIsEligibilityModalOpen,
    eligibilityCheckTarget,
  } = useApp();
  /*const [isSidebarOpen, setIsSidebarOpen] = useState(false);*/

  /*if (isAuthScreen) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#101828] antialiased">
        {renderScreen()}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2.5 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </div>
          </div>
        )}
      </div>
    );
  }*/

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col lg:flex-row antialiased">
      {/* Persistent Left Sidebar */}
      {/*<Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />*/}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/*<Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />*/}

        {/* Global Notification Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2.5 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Eligibility Assessment Modal */}
      <EligibilityModal
        opportunity={eligibilityCheckTarget}
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!error) {
        setUser(data.session?.user ?? null);
      }
    };

    checkUser();
  }, []);

  const location = useLocation();

  const isAuthScreen =
    location.pathname === "/" ||
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname === "/verification";

  console.log(isSidebarOpen);

  return (
    <>
      <AppProvider>
        {/*<AppContent />*/}
        <div className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col lg:flex-row antialiased">
          {!isAuthScreen && (
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          )}

          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            {!isAuthScreen && (
              <Header
                onToggleSidebar={() => {
                  setIsSidebarOpen((prev) => !prev);
                }}
              />
            )}

            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<GetStartedScreen />} />
                <Route path="/signin" element={<SignInScreen />} />
                <Route path="/signup" element={<SignUpScreen />} />
                <Route
                  path="/verification"
                  element={<EmailVerificationScreen />}
                />
                <Route
                  path="/signin/resetpassword"
                  element={<ResetPassword />}
                />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardScreen />} />
                  <Route path="/welcome" element={<WelcomeScreen />} />
                  <Route path="/discover" element={<DiscoveryScreen />} />
                  <Route
                    path="/opportunity/details"
                    element={<OpportunityDetailScreen />}
                  />
                  <Route
                    path="/opportunity"
                    element={<MyOpportunitiesScreen />}
                  />
                  <Route path="/ai-assistant" element={<AIAssistantScreen />} />
                  <Route path="/settings" element={<SettingsScreen />} />
                </Route>
              </Routes>
            </main>
          </div>
        </div>
      </AppProvider>
    </>
  );
}
