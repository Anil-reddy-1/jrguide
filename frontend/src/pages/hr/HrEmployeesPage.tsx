import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ProgressBar } from "../../components/common/ProgressBar";
import { Skeleton } from "../../components/common/Skeleton";
import { Modal } from "../../components/common/Modal";
import { Search, Eye, Mail } from "lucide-react";
import clsx from "clsx";

export const HrEmployeesPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: () => apiClient<any[]>("/api/employees"),
    retry: 2,
  });

  const filtered = employees.filter((e: any) => {
    const matchSearch = !search || e.displayName?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton variant="card" /><Skeleton variant="row" count={5} /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Employees" subtitle={`${employees.length} employees in the system`} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-navy-500 focus:outline-none">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Team</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Join Date</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp: any) => (
              <tr key={emp.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-navy-600 text-xs font-semibold">
                      {emp.displayName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "?"}
                    </div>
                    <span className="font-medium text-slate-800">{emp.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{emp.email}</td>
                <td className="px-4 py-3 text-slate-600">{emp.team ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    variant={emp.status === "completed" ? "completed" : emp.status === "overdue" ? "rejected" : emp.status === "in_progress" ? "active" : "pending"}
                    label={emp.status ?? "pending"}
                  />
                </td>
                <td className="px-4 py-3 text-slate-500">{emp.joinDate ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <button type="button" onClick={() => setSelectedEmployee(emp)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No employees match your search.</p>}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title={selectedEmployee?.displayName ?? ""}>
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-400 text-xs">Email</p><p className="font-medium text-slate-700">{selectedEmployee.email}</p></div>
              <div><p className="text-slate-400 text-xs">Team</p><p className="font-medium text-slate-700">{selectedEmployee.team ?? "—"}</p></div>
              <div><p className="text-slate-400 text-xs">Role</p><p className="font-medium text-slate-700">{selectedEmployee.role}</p></div>
              <div><p className="text-slate-400 text-xs">Join Date</p><p className="font-medium text-slate-700">{selectedEmployee.joinDate ?? "—"}</p></div>
              <div><p className="text-slate-400 text-xs">Status</p><StatusBadge variant={selectedEmployee.status === "completed" ? "completed" : "active"} label={selectedEmployee.status} /></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
