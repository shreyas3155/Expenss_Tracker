"use client";

import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("shreyas hathiwala");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid username or password.");
        setIsLoading(false);
        return;
      }

      // Also set client storage flag for instant UI reactivity
      localStorage.setItem("spendly_user", JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      // Fallback client check if API route fails
      if (
        (username.trim().toLowerCase() === "shreyas hathiwala" ||
          username.trim().toLowerCase() === "shreyas") &&
        password === "Shreyas@3155"
      ) {
        const fallbackUser = {
          name: "Shreyas Hathiwala",
          email: "shreyas@hathiwala.com",
        };
        localStorage.setItem("spendly_user", JSON.stringify(fallbackUser));
        onLoginSuccess(fallbackUser);
      } else {
        setError("Invalid credentials. Access restricted to Shreyas Hathiwala.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F3EB] flex items-center justify-center p-3.5 sm:p-6 relative overflow-hidden font-sans">
      {/* Soft warm ambient glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-[#F5D547]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -left-36 w-[320px] sm:w-[450px] h-[320px] sm:h-[450px] rounded-full bg-[#F5D547]/15 blur-3xl" />

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-md rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-black/5 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Pill */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="flex items-center gap-2 bg-[#F6F3EB] px-3.5 sm:px-4 py-1.5 rounded-full border border-black/5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#F5D547]" />
            <span className="font-bold text-sm text-[#1A1A1A]">Spendly</span>
            <span className="text-[10px] uppercase font-semibold text-black/40">Secure Access</span>
          </div>
        </div>

        {/* Header Icon + Greeting */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1A1A1A] text-white mx-auto flex items-center justify-center mb-3 shadow-md relative group">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5D547]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F5D547] text-[#1A1A1A] flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
            Welcome, Shreyas
          </h1>
          <p className="text-xs text-black/50 mt-1 font-medium leading-relaxed px-2">
            Enter your master password to access your personal bank expense dashboard.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200/60 text-xs font-semibold text-red-700 animate-in fade-in duration-150 flex items-start gap-2">
            <span className="text-red-500 font-bold shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] mb-1 ml-1">
              Authorized User
            </label>
            <div className="relative flex items-center bg-[#F6F3EB]/80 border border-black/10 focus-within:border-black rounded-2xl px-3.5 py-3 transition-colors">
              <User className="w-4 h-4 text-black/50 shrink-0 mr-2.5" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="shreyas hathiwala"
                className="bg-transparent text-sm sm:text-xs font-semibold text-[#1A1A1A] outline-hidden w-full placeholder-black/40"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1 ml-1">
              <label className="block text-xs font-bold text-[#1A1A1A]">
                Master Password
              </label>
            </div>
            <div className="relative flex items-center bg-[#F6F3EB]/80 border border-black/10 focus-within:border-black rounded-2xl px-3.5 py-3 transition-colors">
              <Lock className="w-4 h-4 text-black/50 shrink-0 mr-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-transparent text-sm sm:text-xs font-semibold text-[#1A1A1A] outline-hidden w-full placeholder-black/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-black/40 hover:text-black w-8 h-8 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#1A1A1A] hover:bg-black active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px]"
          >
            {isLoading ? (
              <span>Verifying credentials...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#F5D547]" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="mt-5 pt-3.5 border-t border-black/5 flex items-center justify-center gap-1.5 text-[11px] text-black/40">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Single-user private encryption active</span>
        </div>
      </div>
    </div>
  );
};
