import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
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
import ProtectedRoute from "./components/auth/protectedRoute";
import EmailVerificationScreen from "./components/auth/EmailVerification";
import ResetPassword from "./components/auth/ResetPassword";

// Pages that render without the sidebar/header
const AUTH_SCREEN_PATHS = [
  "/",
  "/signin",
  "/signin/resetpassword",
  "/signup",
  "/verification",
];

// Pages a signed-in user should be bounced away from.
// (/signin/resetpassword and /verification are deliberately excluded:
// the password-recovery link signs the user in, and they still need that page.)
const REDIRECT_IF_SIGNED_IN = ["/", "/signin", "/signup"];

const AppShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    notification,
    isEligibilityModalOpen,
    setIsEligibilityModalOpen,
    eligibilityCheckTarget,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Redirect signed-in users away from the landing / auth pages only.
  // Runs once on load, so refreshing a deep link (e.g. /discover) stays put.
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) return;

      if (data.session && REDIRECT_IF_SIGNED_IN.includes(location.pathname)) {
        navigate("/dashboard", { replace: true });
      }
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log("No authenticated user found");
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile check failed:", error.message);
        return;
      }

      if (!data) {
        console.log("No profile found for this user");
        return;
      }

      console.log("Profile exists:", data);
    };

    checkProfile();
  }, []);

  const isAuthScreen = AUTH_SCREEN_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col lg:flex-row antialiased">
      {!isAuthScreen && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {!isAuthScreen && (
          <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        )}

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<GetStartedScreen />} />
            <Route path="/signin" element={<SignInScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/verification" element={<EmailVerificationScreen />} />
            <Route path="/signin/resetpassword" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/discover" element={<DiscoveryScreen />} />
              <Route
                path="/opportunity/details"
                element={<OpportunityDetailScreen />}
              />
              <Route path="/opportunity" element={<MyOpportunitiesScreen />} />
              {/* Action Plan is the "plan" tab: /ai-assistant?tab=plan */}
              <Route path="/ai-assistant" element={<AIAssistantScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Route>

            {/* Catch-all: unknown URLs fall back to the dashboard
                (ProtectedRoute sends signed-out users on to /signin) */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global notification toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg flex items-center gap-2.5 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Interactive eligibility assessment modal */}
      <EligibilityModal
        opportunity={eligibilityCheckTarget}
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
