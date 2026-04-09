import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../state/auth";
import {
  Home,
  CheckSquare,
  FileText,
  HelpCircle,
  MessageCircle,
  Users,
  Bell,
  LayoutDashboard,
  UserCog,
  FolderOpen,
  Mail,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
};

const employeeNav: NavItem[] = [
  { to: "/employee", label: "Dashboard", icon: <Home size={18} /> },
  { to: "/employee/checklist", label: "My Tasks", icon: <CheckSquare size={18} /> },
  { to: "/employee/documents", label: "Documents", icon: <FileText size={18} /> },
  { to: "/employee/faq", label: "FAQs", icon: <HelpCircle size={18} /> },
  { to: "/employee/chat", label: "Chatbot", icon: <MessageCircle size={18} /> },
  { to: "/employee/contacts", label: "Contacts", icon: <Users size={18} /> },
  { to: "/employee/notifications", label: "Notifications", icon: <Bell size={18} /> },
];

const hrNav: NavItem[] = [
  { to: "/hr", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/hr/employees", label: "Employees", icon: <UserCog size={18} /> },
  { to: "/hr/templates", label: "Templates", icon: <FolderOpen size={18} /> },
  { to: "/hr/faqs", label: "FAQ Manager", icon: <HelpCircle size={18} /> },
  { to: "/hr/email", label: "Email", icon: <Mail size={18} /> },
  { to: "/hr/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const nav = user?.role === "employee" ? employeeNav : hrNav;

  const currentPage = nav.find(
    (item) =>
      item.to === location.pathname ||
      (item.to !== (user?.role === "employee" ? "/employee" : "/hr") &&
        location.pathname.startsWith(item.to)),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white">
            <Shield size={16} />
          </div>
          <Link
            to={user?.role === "employee" ? "/employee" : "/hr"}
            className="text-lg font-bold text-slate-900 no-underline"
          >
            JrGuide
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Portal label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {user?.role === "employee" ? "Employee Portal" : "HR Admin"}
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/employee" || item.to === "/hr"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all duration-150",
                  isActive
                    ? "bg-navy-50 text-navy-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-700">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">
              {user?.role === "employee" ? "Employee" : "HR Admin"}
            </span>
            {currentPage && (
              <>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="font-medium text-slate-700">
                  {currentPage.label}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              Welcome, <span className="font-semibold text-slate-700">{user?.name?.split(" ")[0]}</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
