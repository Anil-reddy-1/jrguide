import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="animate-fade-in text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
          <span className="text-4xl font-bold">404</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white no-underline hover:bg-navy-800"
          >
            <Home size={16} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};
