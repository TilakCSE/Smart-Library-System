"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, BookOpen, AlertCircle, IndianRupee, 
  Search, Activity, Database, Server, LayoutDashboard, Settings,
  Loader2, Flame, Trophy
} from "lucide-react";

// Import your API utilities
import { fetchFromAPI } from "@/lib/api";
import { auth } from "@/lib/firebase";
import AdminSidebar from "@/components/AdminSidebar";

// Define Interfaces based on your backend endpoints
interface AnalyticsData {
  stats: {
    total_students: number;
    active_issues: number;
    overdue_count: number;
    total_fines: number;
  };
  heatmap_data: { name: string; searches: number }[];
  trending_books: { title: string; author: string; searches: number }[];
}

interface LedgerEntry {
  id: string;
  type: "issue" | "return" | "search";
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}

// Enterprise Sidebar Component - NOW WITH WORKING ROUTES


export default function AdminCommandCenter() {
  const router = useRouter();
  const [isServerLive, setIsServerLive] = useState(false);
  
  // LIVE DATA STATE
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  // Fetch Live Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : ""; 
        
        // FIX: The TypeScript Error is solved by explicitly declaring the Record type
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const analyticsData = await fetchFromAPI("/api/v1/admin/analytics", { headers });
        setAnalytics(analyticsData);

        const ledgerData = await fetchFromAPI("/api/v1/admin/master-ledger", { headers });
        setLedger(ledgerData.slice(0, 5)); 

        setIsServerLive(true);
      } catch (e) {
        console.error("Failed to fetch admin data", e);
        setIsServerLive(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Fallback data if API fails
  const stats = analytics?.stats || { total_students: 0, active_issues: 0, overdue_count: 0, total_fines: 0 };
  const heatmap = analytics?.heatmap_data || [];
  const trendingBooks = analytics?.trending_books || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar isServerLive={isServerLive} />

      <main className="flex-1 ml-64 p-8 md:p-12 overflow-y-auto">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between mb-12">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search students, books, or RFID tags..." 
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">Librarian Access</p>
              <p className="text-xs text-slate-500">Main Branch</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 font-bold">
               A
            </div>
          </div>
        </div>

        {/* KPI Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Students", value: stats.total_students, icon: Users, color: "text-blue-600" },
            { label: "Active Loans", value: stats.active_issues, icon: BookOpen, color: "text-emerald-600" },
            { label: "Flagged Accounts", value: stats.overdue_count, icon: AlertCircle, color: "text-rose-600" },
            { label: "Pending Fines", value: stats.total_fines, icon: IndianRupee, color: "text-amber-600", isCurrency: true },
          ].map((kpi, i) => (
            <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl bg-slate-50 ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                {kpi.isCurrency && <span className="text-lg font-medium text-slate-400">₹</span>}
                <span>{kpi.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Trending Books Widget */}
          <div className="lg:col-span-1 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-900">Trending Assets</h3>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {trendingBooks.length > 0 ? (
                trendingBooks.slice(0, 4).map((book, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                        {idx === 0 ? <Trophy className="w-4 h-4" /> : `#${idx + 1}`}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{book.title}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase line-clamp-1">{book.author}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end pl-2 shrink-0">
                      <span className="text-sm font-bold text-blue-600">{book.searches}</span>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Queries</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono text-center">
                  No trending data.
                </div>
              )}
            </div>
          </div>

          {/* Search Intent Heatmap */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Spatial Search Heatmap</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Top Zones</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
               {heatmap.length > 0 ? (
                 <div className="space-y-4">
                    {heatmap.map((zone, idx) => {
                      const maxWidth = heatmap[0]?.searches || 1;
                      const widthPercent = (zone.searches / maxWidth) * 100;
                      return (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="w-24 text-xs font-bold text-slate-600 uppercase font-mono truncate">{zone.name}</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${widthPercent}%` }}
                               className="h-full bg-indigo-500 rounded-full"
                             />
                          </div>
                          <span className="w-8 text-right text-xs font-mono text-slate-400">{zone.searches}</span>
                        </div>
                      )
                    })}
                 </div>
               ) : (
                 <div className="h-full w-full bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6">
                    <Activity className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-slate-400 text-xs font-mono tracking-widest uppercase text-center">Insufficient telemetry data.<br/>Waiting for student searches.</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Live Transaction Ledger */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Live Master Ledger</h3>
            <button 
              onClick={() => router.push('/admin/ledger')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View Full Logs
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                <th className="px-8 py-4">Event ID</th>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Action</th>
                <th className="px-8 py-4">Details</th>
                <th className="px-8 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {ledger.map((entry, i) => {
                let typeColor = "bg-slate-50 text-slate-700";
                if (entry.type === "issue") typeColor = "bg-blue-50 text-blue-700";
                if (entry.type === "return") typeColor = "bg-emerald-50 text-emerald-700";
                if (entry.type === "search") typeColor = "bg-purple-50 text-purple-700";

                return (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4 font-mono text-xs">{entry.id.substring(0, 10)}...</td>
                    <td className="px-8 py-4 font-semibold text-slate-900">{entry.user_name}</td>
                    <td className="px-8 py-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-8 py-4">{entry.details}</td>
                    <td className="px-8 py-4 text-slate-400 text-xs">{new Date(entry.timestamp).toLocaleTimeString()}</td>
                  </tr>
                )
              })}
              {ledger.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-mono text-xs">
                    Ledger is currently empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}