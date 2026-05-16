"use client";

import React, { useState, useEffect } from "react";
import { 
  Terminal as TerminalIcon, ArrowLeft, RefreshCw, Trash2, 
  Loader2, Database, Zap, HardDrive, Activity 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchFromAPI } from "@/lib/api";
import { auth } from "@/lib/firebase";

export default function PremiumSettings() {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("General");
  const [isProcessing, setIsProcessing] = useState(false);
  const [latency, setLatency] = useState<string>("Calculating...");

  useEffect(() => {
    const checkLatency = async () => {
      const start = Date.now();
      try {
        await fetchFromAPI("/api/v1/admin/analytics"); 
        setLatency(`${Date.now() - start}ms`);
      } catch (e) {
        setLatency("Offline");
      }
    };
    checkLatency();

    setLogs([
      "kernel.initialized: system_v2.0.4",
      "storage.connected: postgres_main_neon",
      "hardware.bridge: 12 nodes identified",
      "security.status: firebase_auth_enforced",
      "ready: systems operational."
    ]);
  }, []);

  const handlePurge = async () => {
    if (!confirm("CRITICAL: This will wipe all student records and transaction history. Continue?")) return;
    setIsProcessing(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      await fetchFromAPI("/api/v1/admin/fix-students", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setLogs(prev => [...prev, "WARN: database_purge_executed", "INIT: re-indexing empty clusters..."]);
      alert("System Reset Complete.");
    } catch (e) {
      alert("Purge failed. Check server logs.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSeed = async () => {
    setIsProcessing(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      await fetchFromAPI("/api/v1/admin/demo-presentation-seed", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setLogs(prev => [...prev, "INFO: demo_presentation_seed_executed", "INFO: 20 transactions & fines injected."]);
      alert("Demo Data Seeded.");
    } catch (e) {
      alert("Seeding failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="p-6 md:p-12 min-h-[calc(100vh-4rem)] md:min-h-screen bg-stone-50 text-stone-900 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        <header className="mb-8 md:mb-12 flex flex-col items-start gap-4">
          <Link href="/admin" className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-stone-900 transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-stone-950">System Settings</h1>
            <p className="text-sm text-stone-500 mt-2">Environment configuration & diagnostic utilities.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          <aside className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto gap-2 pb-2 lg:pb-0">
            {["General", "Seed Center", "Developer Tools"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-none w-auto lg:w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab ? "bg-stone-200/50 text-stone-950 shadow-sm" : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </aside>

          <div className="lg:col-span-9 space-y-10 md:space-y-12">
            
            {/* PERFORMANCE METRICS */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: "API Latency", value: latency, icon: Activity },
                { label: "Uptime", value: "99.9%", icon: RefreshCw },
                { label: "DB Type", value: "Neon Serverless", icon: Database },
                { label: "Infrastructure", value: "WSL 2 / FastAPI", icon: HardDrive },
              ].map((m) => (
                <div key={m.label} className="p-5 md:p-6 bg-white border border-stone-200 rounded-2xl md:rounded-3xl shadow-sm">
                  <m.icon className="w-4 h-4 text-stone-400 mb-2 md:mb-3" />
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 line-clamp-1">{m.label}</p>
                  <p className="text-lg md:text-xl font-bold text-stone-950 line-clamp-1">{m.value}</p>
                </div>
              ))}
            </section>

            {/* TAB CONTENT: SEED CENTER */}
            {activeTab === "Seed Center" && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white border border-stone-200 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <h3 className="font-bold text-stone-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" /> Realistic Data Seeding
                      </h3>
                      <p className="text-xs md:text-sm text-stone-500 mt-2 max-w-md">
                        Populate the Master Ledger and Analytics with 50+ realistic NUV student transactions. Ideal for demonstrations.
                      </p>
                    </div>
                    <button 
                      onClick={handleSeed}
                      disabled={isProcessing}
                      className="w-full md:w-auto px-6 py-3 md:py-3.5 bg-blue-600 text-white rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 disabled:bg-stone-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Execute Seed
                    </button>
                  </div>
                </div>
              </motion.section>
            )}

            {/* DANGER AREA */}
            <section>
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 md:mb-6">Danger Zone</h3>
              <div className="bg-rose-50/50 border border-rose-200 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <p className="font-bold text-rose-950">Wipe Database Records</p>
                  <p className="text-xs md:text-sm text-rose-700 mt-1 max-w-md">Reset all student account flags and transaction logs to factory defaults.</p>
                </div>
                <button 
                  onClick={handlePurge}
                  disabled={isProcessing}
                  className="w-full md:w-auto px-6 py-3 md:py-3.5 bg-rose-600 text-white rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 disabled:bg-stone-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4" />
                  {isProcessing ? "Processing..." : "Purge Data"}
                </button>
              </div>
            </section>

            {/* SYSTEM LOGS */}
            <section>
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 md:mb-6 flex items-center gap-2">
                <TerminalIcon className="w-3 h-3" /> Environment Status
              </h3>
              <div className="bg-stone-950 rounded-3xl md:rounded-[2rem] p-6 md:p-8 shadow-xl">
                <div className="h-32 md:h-40 overflow-y-auto space-y-2 font-mono text-[9px] md:text-[11px] custom-scrollbar">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-4 md:gap-6 break-all">
                      <span className="text-stone-700 select-none shrink-0">0{i+1}</span>
                      <span className="text-stone-300">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}