import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { Modal } from "../../components/common/Modal";
import { Mail, Send } from "lucide-react";
import toast from "react-hot-toast";

const EMAIL_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Sent to new employees on their first day.",
    type: "invite",
  },
  {
    id: "reminder",
    name: "Task Reminder",
    description: "Reminds employees about pending onboarding tasks.",
    type: "reminder",
  },
  {
    id: "completion",
    name: "Onboarding Complete",
    description: "Congratulates employees on finishing onboarding.",
    type: "completion",
  },
];

export const HrEmailAutomationPage = () => {
  const [testModal, setTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const sendTestMutation = useMutation({
    mutationFn: (to: string) =>
      apiClient("/api/email/test", { method: "POST", body: { to } }),
    onSuccess: () => {
      toast.success("Test email sent!");
      setTestModal(false);
      setTestEmail("");
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to send test"),
  });

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Email Automation"
        subtitle="Manage email templates and send communications."
      />

      {/* Template Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EMAIL_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {tpl.name}
                </p>
                <p className="text-[11px] text-slate-400 uppercase">
                  {tpl.type}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">{tpl.description}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTestModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Send size={12} /> Send Test
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Test Email Modal */}
      <Modal
        open={testModal}
        onClose={() => setTestModal(false)}
        title="Send Test Email"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Recipient Email
            </label>
            <input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              type="email"
              placeholder="test@company.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => testEmail && sendTestMutation.mutate(testEmail)}
            disabled={!testEmail || sendTestMutation.isPending}
            className="w-full rounded-lg bg-navy-900 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
          >
            {sendTestMutation.isPending ? "Sending..." : "Send Test Email"}
          </button>
        </div>
      </Modal>
    </div>
  );
};
