"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { 
  BookOpen, Clock, AlertTriangle, Loader2, LogOut, 
  Search, Bookmark, Sparkles, TrendingUp 
} from "lucide-react";
import { useStudentStore } from "@/store/studentStore"; // Adjust path if needed

import DigitalID from "@/components/DigitalID";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { Timeline } from "@/components/timeline";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fetchFromAPI } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("Good Afternoon");
  const [dashboardData, setDashboardData] = useState<any>(null);

  const handleSpatialLaunch = () => {
    // Instant redirect to the catalog/map. 
    // The actual /books page will handle any strict geolocation needed!
    router.push("/books"); 
  };

    

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const token = await user.getIdToken();
        const response = await fetchFromAPI(`/api/v1/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response);
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("library_auth_token");
    router.push("/login");
  };

  const calculateLoanProgress = () => {
    if (!dashboardData?.due_text || dashboardData.due_text === "-") return 0;
    const daysLeft = parseInt(dashboardData.due_text) || 0;
    const totalDays = 14; 
    return Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
  };

  if (isLoading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      
      {/* --- TOP BAR --- */}
      <header className="max-w-[1600px] mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search catalog or archives..." 
              className="bg-neutral-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm w-64 md:w-96 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p 
              className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-cyan-500 transition-colors select-none"
            >
              {greeting}
            </p>
            <p className="text-sm font-bold text-white capitalize">{dashboardData?.full_name || "Student"}</p>
          </div>
          <button onClick={handleLogout} className="h-12 w-12 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-400 transition-all group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: IDENTITY & QUICK STATS --- */}
        <div className="lg:col-span-4 space-y-8">
          <DigitalID realName={dashboardData?.full_name} />
          
          <div className="grid grid-cols-2 gap-4">
            <MagicCard className="bg-neutral-900/40 p-6 border border-white/5 rounded-[2rem]" gradientColor="rgba(8, 145, 178, 0.1)">
              <BookOpen className="w-6 h-6 text-cyan-400 mb-4" />
              <p className="text-neutral-500 text-[9px] font-bold tracking-[0.2em] uppercase mb-1">Issued</p>
              <div className="text-3xl font-black text-white">
                <NumberTicker value={dashboardData?.issued || 0} />
              </div>
            </MagicCard>

            <MagicCard className="bg-neutral-900/40 p-6 border border-white/5 rounded-[2rem] flex flex-col" gradientColor="rgba(225, 29, 72, 0.1)">
              <AlertTriangle className="w-6 h-6 text-rose-400 mb-4" />
              <p className="text-neutral-500 text-[9px] font-bold tracking-[0.2em] uppercase mb-1">Total Fines</p>
              <div className="text-3xl font-black text-white flex items-center gap-1">
                <span className="text-lg text-neutral-600 font-medium italic">₹</span>
                <NumberTicker value={dashboardData?.fines || 0} />
              </div>

              {/* NEW: Detailed Fine Breakdown */}
              {dashboardData?.fine_details?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-2">Accrual Breakdown</p>
                  {dashboardData.fine_details.map((fine: any, i: number) => (
                    <div key={i} className="flex justify-between items-start text-[10px] font-mono">
                      <span className="text-neutral-400 leading-snug pr-4">{fine.reason}</span>
                      <span className="text-rose-400 font-bold whitespace-nowrap mt-0.5">₹{fine.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </MagicCard>
          </div>

          {/* NEW: READING INSIGHTS COMPONENT */}
          <MagicCard className="bg-neutral-900/40 p-8 border border-white/5 rounded-[2.5rem] overflow-hidden" gradientColor="rgba(37, 99, 235, 0.05)">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white tracking-[0.2em] uppercase text-[10px]">Reading Activity</h3>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="h-32 flex items-end justify-between gap-2 px-2">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-cyan-500/20 rounded-t-lg border-t border-cyan-500/30"
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[9px] font-mono text-neutral-600 uppercase tracking-tighter">
              <span>Mon</span><span>Wed</span><span>Sun</span>
            </div>
          </MagicCard>
        </div>

        {/* --- RIGHT COLUMN: CHECKOUTS & ACTIVITY --- */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <MagicCard className="bg-neutral-900/40 p-10 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center" gradientColor="rgba(16, 185, 129, 0.05)">
            <Clock className="w-5 h-5 text-emerald-400 mb-6" />
            <h3 className="font-bold text-white tracking-[0.2em] uppercase text-[10px] mb-8">Return Velocity</h3>
            <AnimatedCircularProgressBar
              max={100}
              value={calculateLoanProgress()}
              min={0}
              gaugePrimaryColor={dashboardData?.due_text === "Overdue!" ? "#f43f5e" : "#0891b2"}
              gaugeSecondaryColor="rgba(255,255,255,0.02)"
              className="w-44 h-44"
            />
            <p className="text-neutral-400 text-sm mt-8 leading-relaxed">
              {dashboardData?.due_text} remaining <br/>
              <span className="text-white font-bold uppercase text-[10px] tracking-widest">Digital Twin Sync Active</span>
            </p>
          </MagicCard>

          <MagicCard className="bg-neutral-900/40 p-8 border border-white/5 rounded-[2.5rem] flex flex-col shadow-2xl h-full overflow-hidden" gradientColor="rgba(8, 145, 178, 0.05)">
            <h3 className="font-bold text-white tracking-[0.2em] uppercase text-[10px] mb-8">Spatial History</h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <Timeline 
                items={dashboardData?.activity?.map((item: any) => ({
                  date: item.status,
                  title: item.title,
                  description: item.desc
                })) || []} 
              />
            </div>
          </MagicCard>

          {/* NEW: RESERVED ASSETS GRID (Fills the bottom) */}
          {/* NEW: SMART RECOMMENDATIONS GRID */}
          <div className="md:col-span-2">
            <MagicCard className="bg-neutral-900/40 p-8 border border-white/5 rounded-[2.5rem] flex flex-col" gradientColor="rgba(255, 255, 255, 0.02)">
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-white tracking-[0.2em] uppercase text-[10px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" /> Recommended For You
                </h3>
                <div className="flex items-center gap-2">
                  
                  <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-widest">Powered by AI</span>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(dashboardData?.recommendations?.length > 0 ? dashboardData.recommendations : [
                  { title: "No Recommendations Yet", status: "Read a book to get started", author: "System" }
                ]).map((book: any, i: number) => (
                  <button 
                    key={i} 
                    onClick={handleSpatialLaunch}
                    className="w-full text-left p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors relative overflow-hidden group"
                  >
                    <p className="text-white font-bold text-sm mb-1 line-clamp-1 relative z-0 group-hover:text-cyan-400 transition-colors">{book.title}</p>
                    <p className="text-neutral-500 text-[10px] uppercase font-mono mb-3 line-clamp-1 relative z-0">{book.author}</p>
                    <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-tighter bg-cyan-500/10 px-2 py-1 rounded-md relative z-0">
                      {book.status}
                    </span>
                  </button>
                ))}
              </div>
            </MagicCard>
          </div>

        </div>
      </main>
    </div>
  );
}