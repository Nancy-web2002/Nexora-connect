import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage("Your password has been updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col justify-between py-8 px-4 sm:px-6 selection:bg-[#3867F6]/15 selection:text-[#101828]">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create a new password
        </h1>

        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="relative">
            <label
              htmlFor="new-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              New password
            </label>

            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 ${
                error
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-300 focus:border-[#3867F6]"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 translate-y-[1px]  text-slate-400 hover:text-slate-600 p-0.5"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="relative">
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Confirm new password
            </label>

            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter your password again"
              required
              autoComplete="new-password"
              className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 ${
                error
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-300 focus:border-[#3867F6]"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 translate-y-[-3px] text-slate-400 hover:text-slate-600 p-0.5"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          {message && <p className="mb-4 text-sm text-green-400">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#3867F6] hover:bg-[#2D55D8] text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? "Updating..." : "Update password"}
          </button>
        </form>

        <Link
          to="/signin"
          className="mt-4 block text-center text-sm text-black-400 hover:underline"
        >
          Return to sign in
        </Link>
      </div>
    </main>
  );
}
