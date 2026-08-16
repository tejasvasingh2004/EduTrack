"use client";

import { Users } from "lucide-react";

export default function AdminMentorsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mentor Management</h1>
          <p className="text-slate-400 text-sm mt-1">View and onboard new mentors</p>
        </div>
      </div>

      <div className="p-12 mt-8 rounded-2xl glass-dark border border-white/5 text-center">
        <Users className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
        <h2 className="text-lg font-medium text-slate-300">No Mentors Yet</h2>
        <p className="text-slate-500 mt-2">Mentor onboarding functionality will be implemented in Track B.</p>
      </div>
    </div>
  );
}
