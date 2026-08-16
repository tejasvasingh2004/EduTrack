"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock, Loader2, RefreshCw } from "lucide-react";

type Application = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WAITLISTED";
  createdAt: string;
  user: { email: string; linkedinUrl: string | null };
};

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications/list");
      if (res.ok) {
        const { data } = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Optimistic UI update
        setApplications(apps => 
          apps.map(app => app.id === id ? { ...app, status: newStatus as any } : app)
        );
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDING": return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
      case "APPROVED": return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3"/> Approved</span>;
      case "REJECTED": return <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-medium flex items-center gap-1"><X className="w-3 h-3"/> Rejected</span>;
      default: return <span className="px-3 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full text-xs font-medium">Waitlisted</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications Review</h1>
          <p className="text-slate-400 text-sm mt-1">Manage new beneficiary sign-ups</p>
        </div>
        <button 
          onClick={fetchApps} 
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-5 h-5 text-blue-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="glass-dark rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-slate-400 border-b border-white/5 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Applicant Email</th>
                <th className="px-6 py-4 font-medium">Applied On</th>
                <th className="px-6 py-4 font-medium">LinkedIn</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500/50" />
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No applications found in the pipeline.
                  </td>
                </tr>
              ) : applications.map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{app.user.email}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    {app.user.linkedinUrl ? (
                      <a href={app.user.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View Profile</a>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actionLoading === app.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400 mr-2" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatusChange(app.id, "APPROVED")}
                            disabled={app.status === "APPROVED"}
                            className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, "REJECTED")}
                            disabled={app.status === "REJECTED"}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
