import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function EmailVerificationScreen() {
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email ?? "");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setMessage("");

    if (!email.trim()) {
      setErrors({ general: "Please enter your email address." });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      setMessage("Verification email sent. Check your inbox and spam folder.");
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col justify-between py-8 px-4 sm:px-6 selection:bg-[#3867F6]/15 selection:text-[#101828]">
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

      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Check your email
        </h1>

        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          We've sent a verification link to your email address. Open the email
          and follow the link to verify your account.
        </p>
        <form onSubmit={handleResend} className="space-y-4">
          <label
            htmlFor="verification-email"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Email address
          </label>

          <input
            id="verification-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 ${
              errors.email
                ? "border-rose-400 focus:border-rose-500"
                : "border-slate-300 focus:border-[#3867F6]"
            }`}
            required
          />

          {errors.general && (
            <p className="text-xs text-rose-600">{errors.general}</p>
          )}

          {message && <p className="text-xs text-emerald-700">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#3867F6] hover:bg-[#2D55D8] text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending</span>
              </>
            ) : (
              <>
                <span>Resending verification email</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
