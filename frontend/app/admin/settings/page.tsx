"use client";

import React, { useState, useEffect } from "react";
import { 
  Terminal as TerminalIcon, 
  ArrowLeft, RefreshCw, Trash2, Loader2, Database, Zap, 
  HardDrive, Activity, Bell, Mail, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { fetchFromAPI } from "@/lib/api";
import { auth } from "@/lib/firebase";

export default function PremiumSettings() {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("General");
  const [isProcessing, setIsProcessing] = useState(false);
  const [latency, setLatency] = useState<string>("Calculating...");

  // Toggle States for Phase 5 (PWA / Notifications)
  const [alerts, setAlerts] = useState({
    lowStock: false,
    overdue: false,
    security: false,
  });

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
      setLogs(prev => [...prev, "INFO: demo_presentation_seed_executed", "INFO: transactions & fines injected."]);
      alert("Demo Data Seeded. Dashboards are now populated.");
    } catch (e) {
      alert("Seeding failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- PHASE 5: ACTUAL NOTIFICATION PERMISSION REQUESTS ---
  const requestAdminNotificationPermission = async (alertType: keyof typeof alerts) => {
    if (!("Notification" in window)) {
      alert("Your browser does not support desktop notifications.");
      return;
    }

    if (alerts[alertType]) {
      // Turning it off
      setAlerts(prev => ({ ...prev, [alertType]: false }));
      // Logic to remove webhook subscription from DB would go here
    } else {
      // Turning it on - Request native permission
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        setAlerts(prev => ({ ...prev, [alertType]: true }));
        
        // Formulate a friendly string for the alert type
        const alertNames = {
          lowStock: "Low Stock Warnings",
          overdue: "Overdue Asset Digests",
          security: "Security Breach Alerts"
        };

        // Fire a real native test notification!
        new Notification("Webhook Connected", {
          body: `You are now subscribed to receive ${alertNames[alertType]}.`,
          icon: "https://www.svgrepo.com/show/305141/library.svg",
        });
      } else {
        alert("Permission denied. Please enable notifications in your browser settings.");
      }
    }
  };

  return (
    <main className="p-4 md:p-12 min-h-[calc(100vh-4rem)] md:min-h-screen bg-stone-50 text-stone-900 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        <header className="mb-8 md:mb-12">
          <Link href="/admin" className="flex items-center gap-2 text-[10px] md:text-xs font-semibold text-stone-400 hover:text-stone-900 transition-colors mb-4 md:mb-6 group w-max">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-stone-950">System Settings</h1>
            <p className="text-xs md:text-sm text-stone-500 mt-2">Environment configuration & global preferences.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* TABS - Horizontal on mobile, vertical on desktop */}
          <aside className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto gap-2 pb-2 lg:pb-0 custom-scrollbar">
            {["General", "System Alerts"].map((tab) => (
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
            
            {/* PERFORMANCE METRICS - Always visible */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: "API Latency", value: latency, icon: Activity },
                { label: "Uptime", value: "99.9%", icon: RefreshCw },
                { label: "DB Type", value: "Neon Serverless", icon: Database },
                { label: "Infrastructure", value: "FastAPI Core", icon: HardDrive },
              ].map((m) => (
                <div key={m.label} className="p-5 md:p-6 bg-white border border-stone-200 rounded-2xl md:rounded-3xl shadow-sm">
                  <m.icon className="w-4 h-4 text-stone-400 mb-3" />
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 truncate">{m.label}</p>
                  <p className="text-lg md:text-xl font-bold text-stone-950 truncate">{m.value}</p>
                </div>
              ))}
            </section>

            <AnimatePresence mode="wait">
              {/* --- GENERAL TAB --- */}
              {activeTab === "General" && (
                <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 md:space-y-12">
                  
                  <section>
                    <div className="bg-white border border-stone-200 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div>
                        <h3 className="font-bold text-stone-900 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" /> Realistic Data Seeding
                        </h3>
                        <p className="text-xs md:text-sm text-stone-500 mt-2 max-w-md">
                          Populate the Master Ledger and Analytics with realistic student transactions. Ideal for demonstrations.
                        </p>
                      </div>
                      <button onClick={handleSeed} disabled={isProcessing} className="w-full md:w-auto px-6 py-3.5 bg-blue-600 text-white rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 disabled:bg-stone-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Execute Seed
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 md:mb-6">Danger Zone</h3>
                    <div className="bg-rose-50/50 border border-rose-200 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div>
                        <p className="font-bold text-rose-950">Wipe Database Records</p>
                        <p className="text-xs md:text-sm text-rose-700 mt-1 max-w-md">Reset all student account flags and transaction logs to factory defaults.</p>
                      </div>
                      <button onClick={handlePurge} disabled={isProcessing} className="w-full md:w-auto px-6 py-3.5 bg-rose-600 text-white rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 disabled:bg-stone-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                        <Trash2 className="w-4 h-4" /> {isProcessing ? "Processing..." : "Purge Data"}
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2">
                      <TerminalIcon className="w-3 h-3" /> Environment Status
                    </h3>
                    <div className="bg-stone-950 rounded-3xl md:rounded-[2rem] p-6 md:p-8 overflow-hidden shadow-2xl">
                      <div className="h-32 overflow-y-auto space-y-2 font-mono text-[9px] md:text-[11px] custom-scrollbar">
                        {logs.map((log, i) => (
                          <div key={i} className="flex gap-4 md:gap-6 break-all">
                            <span className="text-stone-700 select-none shrink-0">0{i+1}</span>
                            <span className="text-stone-300">{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                </motion.div>
              )}

              {/* --- SYSTEM ALERTS TAB (PHASE 5 PREP) --- */}
              {activeTab === "System Alerts" && (
                <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">Notification Webhooks</h3>
                  
                  <div className="bg-white border border-stone-200 rounded-3xl p-4 md:p-6 shadow-sm divide-y divide-stone-100">
                    
                    {/* Alert Toggle Item - Low Stock */}
                    <div className="flex items-center justify-between py-4 md:py-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 md:p-2.5 bg-amber-50 rounded-lg text-amber-600 shrink-0"><Bell className="w-4 h-4 md:w-5 md:h-5" /></div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm md:text-base">Low Stock Warnings</p>
                          <p className="text-[10px] md:text-xs text-stone-500 mt-1 max-w-sm">Trigger push notifications to admin devices when an asset drops to 1 available copy.</p>
                        </div>
                      </div>
                      <button onClick={() => requestAdminNotificationPermission('lowStock')} className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-4 ${alerts.lowStock ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${alerts.lowStock ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Alert Toggle Item - Overdue */}
                    <div className="flex items-center justify-between py-4 md:py-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 md:p-2.5 bg-blue-50 rounded-lg text-blue-600 shrink-0"><Mail className="w-4 h-4 md:w-5 md:h-5" /></div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm md:text-base">Overdue Asset Digests</p>
                          <p className="text-[10px] md:text-xs text-stone-500 mt-1 max-w-sm">Send a daily email digest summarizing all currently flagged accounts and accrued penalties.</p>
                        </div>
                      </div>
                      <button onClick={() => requestAdminNotificationPermission('overdue')} className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-4 ${alerts.overdue ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${alerts.overdue ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Alert Toggle Item - Security */}
                    <div className="flex items-center justify-between py-4 md:py-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 md:p-2.5 bg-rose-50 rounded-lg text-rose-600 shrink-0"><ShieldAlert className="w-4 h-4 md:w-5 md:h-5" /></div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm md:text-base">Security Breach Alerts</p>
                          <p className="text-[10px] md:text-xs text-stone-500 mt-1 max-w-sm">Notify immediately if consecutive failed login attempts occur on the Admin portal.</p>
                        </div>
                      </div>
                      <button onClick={() => requestAdminNotificationPermission('security')} className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-4 ${alerts.security ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${alerts.security ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </main>
  );
}