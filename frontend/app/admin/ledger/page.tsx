"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Download, ArrowLeft, Database, ChevronRight, Loader2 
} from "lucide-react";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";

// NEW: Import the Sidebar
import AdminSidebar from "@/components/AdminSidebar";

// API & Auth Imports
import { fetchFromAPI } from "@/lib/api";
import { auth } from "@/lib/firebase";

interface LedgerEntry {
  id: string;
  type: "issue" | "return" | "search" | "sync";
  user_name: string;
  action: string;
  details: string;
  isbn?: string;
  timestamp: string;
}

export default function MasterLedger() {
  const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  // 1. FETCH FULL HISTORY
  const loadLedger = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      
      const response = await fetchFromAPI("/api/v1/admin/master-ledger", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setTransactions(response);
    } catch (error) {
      console.error("Audit Access Failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  // 2. LIVE FILTERING LOGIC
  const filteredData = useMemo(() => {
    return transactions.filter(t => 
      t.user_name.toLowerCase().includes(query.toLowerCase()) || 
      t.id.toLowerCase().includes(query.toLowerCase()) ||
      t.details.toLowerCase().includes(query.toLowerCase()) ||
      (t.isbn && t.isbn.includes(query))
    );
  }, [transactions, query]);

  // 3. EXPORT TO CSV LOGIC
  const exportToCSV = () => {
    const headers = ["Timestamp", "Event ID", "User", "Action", "Details", "ISBN"];
    const rows = filteredData.map(t => [
      new Date(t.timestamp).toLocaleString(),
      t.id,
      t.user_name,
      t.action,
      t.details,
      t.isbn || "N/A"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `SmartOS_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionStyles = (type: string) => {
    switch (type) {
      case "issue": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "return": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "search": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  // NEW: Wrapped loading state with sidebar so it doesn't jump when loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex">
        <AdminSidebar isServerLive={false} />
        <main className="flex-1 ml-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Decrypting Audit Logs...</p>
        </main>
      </div>
    );
  }

  return (
    // NEW WRAPPER: flex layout
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans">
      
      {/* NEW: Inject Sidebar */}
      <AdminSidebar isServerLive={true} />

      {/* NEW: main container with ml-64 and h-screen with overflow-y-auto */}
      <main className="flex-1 ml-64 p-6 md:p-12 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* NAV */}
          <div className="flex justify-between items-center mb-8">
            <BlurFade delay={0.1}>
              <Link href="/admin" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-blue-500 transition-colors">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Command
              </Link>
            </BlurFade>
            
            <BlurFade delay={0.1}>
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Live Uplink Active</span>
              </div>
            </BlurFade>
          </div>

          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <BlurFade delay={0.2}>
              <h1 className="text-4xl font-serif text-white tracking-tight">Master Ledger</h1>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">Historical Transaction Stream</p>
            </BlurFade>

            <BlurFade delay={0.3}>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                <Download className="w-4 h-4 text-blue-500" /> Export to CSV
              </button>
            </BlurFade>
          </header>

          {/* SEARCH */}
          <BlurFade delay={0.4}>
            <div className="relative mb-8 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Filter by Student, ISBN, or Event ID..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-900/30 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-600/50 backdrop-blur-xl transition-all"
              />
            </div>
          </BlurFade>

          {/* TABLE */}
          <BlurFade delay={0.5}>
            <div className="bg-slate-900/20 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-8 py-5">Timestamp</th>
                    <th className="px-8 py-5">Event ID</th>
                    <th className="px-8 py-5">Student</th>
                    <th className="px-8 py-5">Action</th>
                    <th className="px-8 py-5">Details</th>
                    <th className="px-8 py-5 text-right pr-12">View Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {filteredData.map((tx, i) => (
                      <motion.tr 
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="group hover:bg-white/5 transition-colors"
                      >
                        <td className="px-8 py-6 font-mono text-[10px] text-slate-500">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 font-mono text-[10px] text-slate-600">
                          {tx.id.substring(0, 8)}
                        </td>
                        <td className="px-8 py-6 font-bold text-sm text-slate-200">
                          {tx.user_name}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest ${getActionStyles(tx.type)}`}>
                            {tx.action}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-400">
                          {tx.details} {tx.isbn && tx.isbn !== "N/A" && <span className="ml-2 font-mono text-slate-600">[{tx.isbn}]</span>}
                        </td>
                        <td className="px-8 py-6 text-right pr-12">
                          <button className="p-2 hover:bg-blue-500/10 rounded-lg text-slate-600 hover:text-blue-400 transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {filteredData.length === 0 && (
                <div className="py-32 text-center">
                  <Database className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">No matching records detected.</p>
                </div>
              )}
            </div>
          </BlurFade>
        </div>
      </main>
    </div>
  );
}