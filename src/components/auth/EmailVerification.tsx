import { useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function EmailVerificationScreen() {
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email ?? "");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
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
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="mb-3 text-2xl font-bold text-white">Check your email</h1>

        <p className="mb-6 text-slate-300">
          We've sent a verification link to your email address. Open the email
          and follow the link to verify your account.
        </p>

        <label
          htmlFor="verification-email"
          className="mb-2 block text-left text-sm text-slate-300"
        >
          Email address
        </label>

        <input
          id="verification-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mb-4 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
          required
        />

        {errors.general && (
          <p className="mb-4 text-sm text-red-400">{errors.general}</p>
        )}

        {message && <p className="mb-4 text-sm text-green-400">{message}</p>}

        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading}
          className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Resend verification email"}
        </button>
      </div>
    </main>
  );
}
