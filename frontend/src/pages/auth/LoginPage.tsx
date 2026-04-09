import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { Eye, EyeOff, Shield } from "lucide-react";
import toast from "react-hot-toast";

export const LoginPage = () => {
  const { loginWithEmail, loginWithGoogle, loginAsDemo, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  if (user) {
    if (user.role) {
      navigate(user.role === "employee" ? "/employee" : "/hr", { replace: true });
    } else {
      navigate("/select-role", { replace: true });
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      // onAuthStateChanged will fire → user state updated → redirect to /select-role
      navigate("/select-role", { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate("/select-role", { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
    }
  };

  const handleDemoLogin = (role: "employee" | "hr") => {
    loginAsDemo(role);
    toast.success(`Signed in as demo ${role === "hr" ? "HR Admin" : "Employee"}`);
    navigate(role === "employee" ? "/employee" : "/hr", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4">
      <div className="animate-fade-in w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-white">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">JrGuide</h1>
          <p className="mt-1 text-sm text-slate-500">Your employee onboarding platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-navy-900 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          {/* Demo divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">demo mode</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Demo buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("employee")}
              className="rounded-xl border border-slate-200 p-4 text-center transition-all hover:border-navy-300 hover:bg-navy-50/50 hover:shadow-sm"
            >
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <p className="text-sm font-semibold text-slate-800">Employee</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Onboarding view</p>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("hr")}
              className="rounded-xl border border-slate-200 p-4 text-center transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm"
            >
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="text-sm font-semibold text-slate-800">HR Admin</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Management view</p>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure onboarding powered by JrGuide
        </p>
      </div>
    </div>
  );
};
