import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  X,
  KeyRound,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  // Forgot password flow
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ProtectedRoute can pass the page the user originally wanted
  const from = (
    location.state as { from?: { pathname: string; search?: string } } | null
  )?.from;
  const destination = from
    ? `${from.pathname}${from.search ?? ""}`
    : "/dashboard";

  // Close the recovery modal with Escape
  useEffect(() => {
    if (!isForgotPasswordOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsForgotPasswordOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isForgotPasswordOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Only require a value here. Length rules belong to sign-up / reset,
    // otherwise existing users with older passwords get blocked client-side.
    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGoogleNotice(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const code = (error as { code?: string }).code;

        // Account exists but the email was never confirmed:
        // send them to the verification page so they can resend the link.
        if (
          code === "email_not_confirmed" ||
          /not confirmed/i.test(error.message)
        ) {
          navigate("/verification", { state: { email: email.trim() } });
          return;
        }

        setErrors({ message: error.message });
        return;
      }

      if (data.session) {
        // The user profile is loaded by AppContext when the session changes.
        navigate(destination, { replace: true });
      }
    } catch (error) {
      setErrors({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setGoogleNotice(
      "Google authentication requires a configured OAuth Client ID in your cloud provider environment. Please sign in using your email address and password above.",
    );
  };

  const openRecovery = () => {
    setRecoveryEmail(email);
    setRecoverySent(false);
    setRecoveryError("");
    setIsForgotPasswordOpen(true);
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");

    if (!recoveryEmail.trim() || !EMAIL_PATTERN.test(recoveryEmail.trim())) {
      setRecoveryError("Please enter a valid email address.");
      return;
    }

    setIsRecoveryLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        recoveryEmail.trim(),
        { redirectTo: `${window.location.origin}/signin/resetpassword` },
      );

      if (error) {
        setRecoveryError(error.message);
        return;
      }

      setRecoverySent(true);
    } catch (error) {
      setRecoveryError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col justify-between py-8 px-4 sm:px-6 selection:bg-[#3867F6]/15 selection:text-[#101828]">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <Link
          to={"/"}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>

        <div>
          <Link
            to={"/"}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#101828] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#3867F6]" />
            </div>
            <span className="font-bold text-sm text-[#101828]">
              Nexora Connect
            </span>
          </Link>
        </div>

        <Link
          to={"/signup"}
          className="text-xs font-semibold text-[#3867F6] hover:text-[#2D55D8]"
        >
          Sign Up
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Sign in to continue discovering opportunities and tracking your
            progress.
          </p>
        </div>

        {/* Informational Google OAuth Configuration Notice */}
        {googleNotice && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#3867F6] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold">Provider Notice: </span>
              {googleNotice}
            </div>
          </div>
        )}

        {errors.message && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errors.message}</div>
          </div>
        )}

        <form onSubmit={handleSignIn} noValidate className="space-y-4">
          {/* Email Address */}
          <div>
            <label
              className="block text-xs font-semibold text-slate-700 mb-1.5"
              htmlFor="signin-email"
            >
              Email Address
            </label>
            <input
              type="email"
              id="signin-email"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              placeholder="you@domain.com"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 ${
                errors.email
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-300 focus:border-[#3867F6]"
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="signin-password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <button
                type="button"
                onClick={openRecovery}
                className="text-xs text-[#3867F6] hover:text-[#2D55D8] font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                placeholder="Enter your password"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 ${
                  errors.password
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-slate-300 focus:border-[#3867F6]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#3867F6] hover:bg-[#2D55D8] text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">
              or continue with
            </span>
          </div>
        </div>

        {/* Google Authentication Option */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2.5 shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-slate-500">
          Don’t have an account?{" "}
          <Link
            to={"/signup"}
            className="font-semibold text-[#3867F6] hover:text-[#2D55D8] transition-colors"
          >
            Create one
          </Link>
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      {isForgotPasswordOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="recovery-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div
                id="recovery-title"
                className="flex items-center gap-2 text-sm font-bold text-slate-900"
              >
                <KeyRound className="w-4 h-4 text-[#3867F6]" />
                <span>Password Recovery</span>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                aria-label="Close password recovery"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {recoverySent ? (
              <div className="space-y-4">
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    If an account exists for that email, you will receive a
                    password reset link. Check your inbox and spam folder.
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-4 py-1.5 text-xs font-semibold bg-[#3867F6] text-white rounded-lg hover:bg-[#2D55D8] transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={handleRecoverySubmit}
                className="space-y-3"
              >
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered email address to receive password reset
                  instructions.
                </p>
                <div>
                  <label
                    htmlFor="recovery-email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    value={recoveryEmail}
                    autoComplete="email"
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden focus:border-[#3867F6]"
                    required
                  />
                  {recoveryError && (
                    <p
                      role="alert"
                      className="text-[11px] text-rose-600 mt-1 font-medium"
                    >
                      {recoveryError}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRecoveryLoading}
                    className="px-4 py-1.5 text-xs font-semibold bg-[#3867F6] text-white rounded-lg hover:bg-[#2D55D8] transition-colors disabled:opacity-60"
                  >
                    {isRecoveryLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="text-center text-[11px] text-slate-400 mt-6">
        Protected by Nexora Connect Evidence Standards · Zero Spam Guarantee
      </div>
    </div>
  );
};
