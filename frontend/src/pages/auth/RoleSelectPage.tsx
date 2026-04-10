import { useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { Users, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export const RoleSelectPage = () => {
  const { user, selectRole } = useAuth();
  const navigate = useNavigate();
  const [selecting, setSelecting] = useState(false);

  const handleSelect = async (role: "employee" | "hr") => {
    setSelecting(true);
    try {
      await selectRole(role);
      toast.success(`Signed in as ${role === "employee" ? "Employee" : "HR Admin"}`);
      
    } catch {
      toast.error("Failed to set role. Please try again.");
    } finally {
      navigate(role === "employee" ? "/employee" : "/hr", { replace: true });
      setSelecting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4">
      <div className="animate-fade-in w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-white">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Choose Your Portal</h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}! Select how you'd like to use JrGuide.
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => handleSelect("employee")}
            disabled={selecting}
            className="group w-full rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-navy-400 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-navy-600 transition-colors group-hover:bg-navy-100">
                <Users size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Employee Portal</h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Complete onboarding tasks, upload documents, and access company resources.
                </p>
              </div>
              <ArrowRight size={20} className="text-slate-300 transition-colors group-hover:text-navy-600" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelect("hr")}
            disabled={selecting}
            className="group w-full rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-emerald-400 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                <ShieldCheck size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">HR Admin</h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Manage employees, templates, FAQs, and monitor onboarding progress.
                </p>
              </div>
              <ArrowRight size={20} className="text-slate-300 transition-colors group-hover:text-emerald-600" />
            </div>
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          You can switch portals later from the sidebar menu.
        </p>
      </div>
    </div>
  );
};
