import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { supabase } from "@/src/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
} from "lucide-react";

export const SignUpScreen: React.FC = () => {
  const { updateUserProfile, showNotification } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters.";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!agreeTerms) {
      newErrors.agreeTerms =
        "You must agree to the Terms of Service and Privacy Policy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleNotice(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            fullName: fullName.trim(),
          },
        },
      });

      if (error) {
        setErrors({ message: error.message });
        return;
      }

      console.log(data);

      if (data.session) {
        showNotification(
          `Welcome to Nexora Connect, ${fullName.trim()}! Your account has been initialized.`,
        );

        navigate("/signin");
      } else {
        navigate("/verification", {
          state: { email: email.trim() },
        });
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setGoogleNotice(
      "Google authentication requires a configured OAuth Client ID in your cloud provider environment. Please register using your email address above.",
    );
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

        <Link
          to={"/signin"}
          className="text-xs font-semibold text-[#3867F6] hover:text-[#2D55D8]"
        >
          Sign In
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Join Nexora Connect to discover trusted opportunities and build your
            path forward.
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

        {submitError && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-red-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#3867F6] shrink-0 mt-0.5" />
            <div className="leading-relaxed">{submitError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: "" });
              }}
              placeholder="e.g. Alex Adeleke"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 ${
                errors.fullName
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-300 focus:border-[#3867F6]"
              }`}
            />
            {errors.fullName && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                placeholder="At least 8 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: "" });
                }}
                placeholder="Re-enter your password"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 ${
                  errors.confirmPassword
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-slate-300 focus:border-[#3867F6]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Checkbox: Terms of Service */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms)
                    setErrors({ ...errors, agreeTerms: "" });
                }}
                className="mt-0.5 rounded text-[#3867F6] focus:ring-[#3867F6]/20 border-slate-300"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the{" "}
                <span className="text-slate-900 font-semibold hover:underline">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-slate-900 font-semibold hover:underline">
                  Privacy Policy
                </span>
                .
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.agreeTerms}</span>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
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
          Already have an account?{" "}
          <Link
            to={"/signin"}
            className="font-semibold text-[#3867F6] hover:text-[#2D55D8] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 mt-6">
        Protected by Nexora Connect Evidence Standards · Zero Spam Guarantee
      </div>
    </div>
  );
};
