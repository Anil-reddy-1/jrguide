import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { Skeleton } from "../../components/common/Skeleton";
import { Search, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";

export const EmployeeFaqPage = () => {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => apiClient<any[]>("/api/faqs"),
    retry: 2,
  });

  const categories = ["All", ...new Set(faqs.map((f: any) => f.category).filter(Boolean))];

  const filtered = faqs.filter((f: any) => {
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    return matchSearch && matchCat && f.active !== false;
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton variant="card" /><Skeleton variant="row" count={5} /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="FAQs" subtitle="Find answers to common onboarding questions." />

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat: any) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              activeCategory === cat ? "bg-navy-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filtered.map((faq: any) => (
          <div key={faq.id} className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <p className="text-sm font-medium text-slate-800 pr-4">{faq.question}</p>
              {expandedId === faq.id ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
            </button>
            {expandedId === faq.id && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                {faq.category && (
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{faq.category}</span>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400 mb-3">No FAQs found. Try a different search or ask the chatbot.</p>
            <Link to="/employee/chat" className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2 text-xs font-medium text-white hover:bg-navy-800">
              <MessageSquare size={14} /> Ask Chatbot
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
