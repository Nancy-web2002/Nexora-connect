import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="mb-3 text-2xl font-bold text-white">
          Create a new password
        </h1>

        <p className="mb-6 text-slate-300">Enter your new password below.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="new-password"
            className="mb-2 block text-sm text-slate-300"
          >
            New password
          </label>

          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
            className="mb-4 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
          />

          <label
            htmlFor="confirm-password"
            className="mb-2 block text-sm text-slate-300"
          >
            Confirm new password
          </label>

          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Enter your password again"
            required
            autoComplete="new-password"
            className="mb-4 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
          />

          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          {message && <p className="mb-4 text-sm text-green-400">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update password"}
          </button>
        </form>

        {message && (
          <Link
            to="/signin"
            className="mt-4 block text-center text-sm text-red-400 hover:underline"
          >
            Return to sign in
          </Link>
        )}
      </div>
    </main>
  );
}
