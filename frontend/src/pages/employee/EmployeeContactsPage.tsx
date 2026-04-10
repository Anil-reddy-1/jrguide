import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { Skeleton } from "../../components/common/Skeleton";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const EmployeeContactsPage = () => {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => apiClient<any[]>("/api/contacts"),
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="card" count={4} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Contacts"
        subtitle="Key people to reach during your onboarding."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact: any) => (
          <div
            key={contact.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-50 text-navy-600 font-semibold text-sm">
                {contact.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2) ?? "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {contact.name}
                </p>
                <p className="text-xs text-slate-500">{contact.role}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-500">
              {contact.department && (
                <p className="flex items-center gap-2">
                  <MapPin size={12} /> {contact.department}
                </p>
              )}
              <p className="flex items-center gap-2">
                <Mail size={12} />{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="text-navy-600 hover:underline"
                >
                  {contact.email}
                </a>
              </p>
              {contact.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={12} />{" "}
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-navy-600 hover:underline"
                  >
                    {contact.phone}
                  </a>
                </p>
              )}
              {contact.availability && (
                <p className="flex items-center gap-2">
                  <Clock size={12} /> {contact.availability}
                </p>
              )}
            </div>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-slate-400">
            No contacts available.
          </p>
        )}
      </div>
    </div>
  );
};
