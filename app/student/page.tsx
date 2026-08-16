"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.email}</h1>
        <p className="text-slate-400 mt-2">Your Katalyst Student Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 rounded-2xl glass-dark border border-white/5">
          <h2 className="text-xl font-medium text-white mb-2">My Mentor</h2>
          <p className="text-slate-400">You have not been assigned a mentor yet.</p>
        </div>

        <div className="p-6 rounded-2xl glass-dark border border-white/5">
          <h2 className="text-xl font-medium text-white mb-2">Next Steps</h2>
          <p className="text-slate-400">Please complete your profile to get started with the curriculum.</p>
        </div>
      </div>
    </div>
  );
}
