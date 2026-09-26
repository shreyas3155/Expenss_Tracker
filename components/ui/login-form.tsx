"use client";

import { useState } from "react";
import { Mail, Lock, Maximize2, Sun, RotateCw, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Example({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={cn("min-h-screen w-full flex flex-col md:flex-row bg-[#08080a] text-zinc-100", className)}>
      {/* Left Banner: Art visual with top-left floating control icons */}
      <div className="relative w-full md:w-[48%] lg:w-[44%] xl:w-[42%] h-[400px] md:h-screen shrink-0 overflow-hidden bg-black select-none">
        <img
          className="w-full h-full object-cover object-center"
          src="https://cdn.21st.dev/assets/mirror/f4/f48e20bd4dcdcf2ca40eafe923e1134d17f43dce1c5bff8f1b96b7301e126ec3.png"
          alt="Visual Artwork"
        />

        {/* Top-left floating control buttons matching screenshot */}
        <div className="absolute top-4 left-4 flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-white/80 shadow-lg">
          
          <button
            type="button"
            className="hover:text-white transition-colors p-0.5"
            title="Toggle theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Side: Sign-in Form */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] md:min-h-screen p-6 md:p-12 bg-[#08080a]">
        <div className="w-full max-w-[380px] flex flex-col items-center">
          {/* Title and Subtitle */}
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white ">
            Sign in
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-normal">
            Welcome back! Please sign in to continue
          </p>

          {/* Google Sign In Button */}
          <button
            type="button"
            className="w-full mt-7 h-12 rounded-full bg-[#16171b] hover:bg-[#1f2026] active:scale-[0.99] border border-white/5 transition-all flex items-center justify-center gap-2.5 text-sm text-zinc-200 font-medium shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full my-6">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-xs text-zinc-400 whitespace-nowrap">
              or sign in with email
            </span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          {/* Email and Password Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            {/* Email Field */}
            <div className="relative flex items-center w-full h-12 rounded-full bg-[#111215] border border-zinc-800/90 focus-within:border-zinc-600 transition-colors px-5 gap-3">
              <Mail className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email id"
                className="bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none w-full"
              />
            </div>

            {/* Password Field */}
            <div className="relative flex items-center w-full h-12 rounded-full bg-[#111215] border border-zinc-800/90 focus-within:border-zinc-600 transition-colors px-5 gap-3 mt-4">
              <Lock className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between w-full mt-5 text-xs text-zinc-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#"
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-7 rounded-full bg-[#535bf2] hover:bg-[#474fe0] active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-xs text-zinc-400 text-center mt-6">
              Don’t have an account?{" "}
              <a href="#" className="text-[#535bf2] hover:underline font-medium">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
