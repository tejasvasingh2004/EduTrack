"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, Clock, FileText, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ApplyStatusPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          
          // If they were approved and are now a student, redirect to student portal
          if (data.user.role === "STUDENT") {
            router.push("/student");
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden text-slate-200 py-12 px-4">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="w-full max-w-2xl flex justify-end mb-4 z-20">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="z-10 w-full max-w-2xl p-8 md:p-12 rounded-3xl glass-dark shadow-2xl relative border border-white/10">
        <div className="flex flex-col items-center text-center space-y-6">
          
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Application Received</h1>
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
              Thank you for applying to Katalyst, {user?.email}. Your application is securely in our system and is currently under review by our admin team.
            </p>
          </div>

          <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/5 mt-4">
            <h3 className="text-left font-medium text-slate-300 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Application Status
            </h3>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#020617]/50 border border-white/5">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="font-medium text-slate-200">Pending Review</span>
              </div>
              <span className="text-xs text-slate-500">
                Usually takes 1-3 business days
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-6 max-w-lg mx-auto">
            Once approved, your account will be automatically upgraded and you'll be granted access to the Student Portal. We'll send an update to your email.
          </p>
        </div>
      </div>
    </div>
  );
}
