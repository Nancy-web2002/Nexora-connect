import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
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
import { CheckCircle2, X } from "lucide-react";
import { Routes, Route, useLocation } from "react-router-dom";

const AppContent: React.FC = () => {
  const {
    screen,
    notification,
    isEligibilityModalOpen,
    setIsEligibilityModalOpen,
    eligibilityCheckTarget,
  } = useApp();
  /*const [isSidebarOpen, setIsSidebarOpen] = useState(false);*/

  const isAuthScreen =
    screen === "get-started" || screen === "sign-up" || screen === "sign-in";

  // Render active screen
  const renderScreen = () => {
    switch (screen) {
      case "get-started":
        return <GetStartedScreen />;
      case "sign-up":
        return <SignUpScreen />;
      case "sign-in":
        return <SignInScreen />;
      case "welcome":
        return <WelcomeScreen />;
      case "dashboard":
        return <DashboardScreen />;
      case "discover":
        return <DiscoveryScreen />;
      case "opportunity-detail":
        return <OpportunityDetailScreen />;
      case "ai-assistant":
      case "action-plan":
        return <AIAssistantScreen />;
      case "my-opportunities":
        return <MyOpportunitiesScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  if (isAuthScreen) {
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
  }

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

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto">{renderScreen()}</main>
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

  const location = useLocation();

  const isAuthScreen =
    location.pathname === "/" ||
    location.pathname === "/signin" ||
    location.pathname === "/signup";

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
              </Routes>
            </main>
          </div>
        </div>
      </AppProvider>
    </>
  );
}
