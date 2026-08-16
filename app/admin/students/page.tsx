"use client";

import { UserCheck } from "lucide-react";

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Directory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage approved students in the program</p>
        </div>
      </div>

      <div className="p-12 mt-8 rounded-2xl glass-dark border border-white/5 text-center">
        <UserCheck className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
        <h2 className="text-lg font-medium text-slate-300">Student Roster</h2>
        <p className="text-slate-500 mt-2">Detailed student tracking functionality will be implemented in Track B.</p>
      </div>
    </div>
  );
}
