"use client";

export default function MentorDashboard() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Mentor Dashboard</h1>
        <p className="text-slate-400 mt-2">View and manage your mentees</p>
      </div>

      <div className="p-8 mt-8 rounded-2xl glass-dark border border-white/5 text-center">
        <p className="text-slate-400">You currently have no active mentees.</p>
      </div>
    </div>
  );
}
