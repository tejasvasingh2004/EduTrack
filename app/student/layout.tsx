"use client";

import { LogOut, Layout, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex">
      <aside className="w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col hidden md:flex relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400">
            Student Portal
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
            <Layout className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
            <UserCircle className="w-5 h-5" />
            <span className="font-medium">My Mentor</span>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8 relative">
        <div className="absolute top-[-20%] left-[50%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
