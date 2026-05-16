"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine, 
  User, Tag, Clock, Loader2, CheckCircle2, AlertCircle, 
  Wallet, History
} from "lucide-react";

import { fetchFromAPI } from "@/lib/api";
import { auth } from "@/lib/firebase";

// --- TYPES ---
type TransactionStatus = {
  type: "idle" | "success" | "error" | "fine";
  message: string;
  fineAmount?: number;
  fineMath?: { due_date: string; return_date: string; days_late: number; }; 
};

type LogEntry = {
  id: string;
  action: "Issue" | "Return";
  rfid: string;
  user?: string;
  time: string;
  status: "success" | "warning";
};

export default function CirculationKiosk() {
  const [activeTab, setActiveTab] = useState<"issue" | "return">("issue");
  
  // --- STATE MANAGEMENT ---
  const [issueData, setIssueData] = useState({ userIdentifier: "", rfid: "", duration: 14 });
  const [returnData, setReturnData] = useState({ rfid: "" });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<TransactionStatus>({ type: "idle", message: "" });
  const [recentTransactions, setRecentTransactions] = useState<LogEntry[]>([]);

  // --- API HANDLERS ---
  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      if (!issueData.userIdentifier || !issueData.rfid) {
        throw new Error("Missing required fields for checkout.");
      }

      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";

      const queryParams = new URLSearchParams({
        user_email: issueData.userIdentifier,
        rfid_tag: issueData.rfid.trim(),
        days: issueData.duration.toString()
      }).toString();

      await fetchFromAPI(`/api/v1/transactions/issue?${queryParams}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setStatus({ type: "success", message: `Asset ${issueData.rfid} successfully issued to ${issueData.userIdentifier}.` });
      addLogEntry("Issue", issueData.rfid, issueData.userIdentifier, "success");
      setIssueData({ userIdentifier: "", rfid: "", duration: 14 }); 
      
    } catch (error: any) {
      const errorMsg = error.message || "Failed to issue asset. Please verify RFID and user.";
      setStatus({ type: "error", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      if (!returnData.rfid) {
        throw new Error("Asset RFID tag is required for return.");
      }

      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";

      const queryParams = new URLSearchParams({
        rfid_tag: returnData.rfid.trim()
      }).toString();

      const response = await fetchFromAPI(`/api/v1/transactions/return?${queryParams}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.fines_generated > 0) {
        setStatus({ 
          type: "fine", 
          message: `Asset returned past due date.`, 
          fineAmount: response.fines_generated,
          fineMath: response.fine_math 
        });
        addLogEntry("Return", returnData.rfid, undefined, "warning");
      } else {
        setStatus({ type: "success", message: response.message || `Asset ${returnData.rfid} successfully returned.` });
        addLogEntry("Return", returnData.rfid, undefined, "success");
      }
      
      setReturnData({ rfid: "" }); 

    } catch (error: any) {
      const errorMsg = error.message || "Failed to return asset. Please verify RFID.";
      setStatus({ type: "error", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLogEntry = (action: "Issue" | "Return", rfid: string, user?: string, logStatus: "success" | "warning" = "success") => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      action,
      rfid,
      user,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: logStatus
    };
    setRecentTransactions(prev => [newEntry, ...prev].slice(0, 5)); 
  };

  return (
    <main className="p-4 md:p-12 min-h-[calc(100vh-4rem)] md:min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-stone-950 flex items-center gap-3">
              <ArrowRightLeft className="w-6 h-6 md:w-8 md:h-8 text-stone-400" /> Circulation Desk
            </h1>
            <p className="text-sm font-medium text-stone-500 mt-2">Manage physical asset issuance and returns.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Hardware Gateway Online</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          
          {/* --- LEFT COLUMN: INTERACTION FORMS --- */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-stone-200 rounded-3xl md:rounded-[2.5rem] shadow-sm p-2 overflow-hidden">
              
              {/* Custom Animated Tabs */}
              <div className="flex p-2 bg-stone-50 rounded-2xl md:rounded-[2rem] relative">
                {["issue", "return"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab as "issue" | "return");
                      setStatus({ type: "idle", message: "" }); 
                    }}
                    className={`flex-1 relative z-10 py-3 md:py-3.5 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                      activeTab === tab ? "text-stone-950" : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    {tab === "issue" ? <ArrowUpFromLine className="w-4 h-4" /> : <ArrowDownToLine className="w-4 h-4" />}
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-white rounded-xl md:rounded-[1.5rem] shadow-sm -z-10 border border-stone-200/50"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Form Content Area */}
              <div className="p-6 md:p-10">
                <AnimatePresence mode="wait">
                  
                  {/* ISSUE FORM */}
                  {activeTab === "issue" && (
                    <motion.form 
                      key="issue-form"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleIssue} 
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                          <User className="w-3 h-3" /> Student ID / Email
                        </label>
                        <input 
                          disabled={isSubmitting}
                          type="text" 
                          required
                          value={issueData.userIdentifier}
                          onChange={(e) => setIssueData({...issueData, userIdentifier: e.target.value})}
                          placeholder="e.g. student@college.edu" 
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-950/10 focus:border-stone-400 transition-all disabled:opacity-50"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                            <Tag className="w-3 h-3" /> Asset RFID Tag
                          </label>
                          <input 
                            disabled={isSubmitting}
                            type="text" 
                            required
                            value={issueData.rfid}
                            onChange={(e) => setIssueData({...issueData, rfid: e.target.value})}
                            placeholder="Scan or type RFID..." 
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-950/10 focus:border-stone-400 transition-all disabled:opacity-50 uppercase"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Days
                          </label>
                          <input 
                            disabled={isSubmitting}
                            type="number" 
                            min="1"
                            value={issueData.duration}
                            onChange={(e) => setIssueData({...issueData, duration: parseInt(e.target.value) || 14})}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-950/10 focus:border-stone-400 transition-all disabled:opacity-50 text-center"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-stone-950 hover:bg-stone-800 text-white rounded-xl md:rounded-2xl py-4 font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-stone-950/10 disabled:opacity-70"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Process Checkout"}
                      </button>
                    </motion.form>
                  )}

                  {/* RETURN FORM */}
                  {activeTab === "return" && (
                    <motion.form 
                      key="return-form"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleReturn} 
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                          <Tag className="w-3 h-3" /> Asset RFID Tag
                        </label>
                        <input 
                          disabled={isSubmitting}
                          type="text" 
                          required
                          autoFocus
                          value={returnData.rfid}
                          onChange={(e) => setReturnData({...returnData, rfid: e.target.value})}
                          placeholder="Scan return asset..." 
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-950/10 focus:border-stone-400 transition-all disabled:opacity-50 uppercase"
                        />
                      </div>

                      <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl md:rounded-2xl">
                        <p className="text-[10px] md:text-xs text-stone-500 leading-relaxed">
                          Scanning the RFID tag will automatically calculate the duration the asset was held. If the asset exceeds the 14-day loan period, late fines will be generated and applied to the student's account.
                        </p>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-stone-950 hover:bg-stone-800 text-white rounded-xl md:rounded-2xl py-4 font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-stone-950/10 disabled:opacity-70"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Process Return"}
                      </button>
                    </motion.form>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: STATUS & LOGS --- */}
          <div className="lg:col-span-5 flex flex-col gap-6 mt-6 lg:mt-0">
            
            {/* 1. Immediate System Feedback Block */}
            <div className="bg-white border border-stone-200 rounded-3xl md:rounded-[2.5rem] shadow-sm p-6 md:p-8 min-h-[160px] flex flex-col justify-center relative overflow-hidden transition-all duration-300">
              <AnimatePresence mode="wait">
                
                {status.type === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-stone-400">
                    <ArrowRightLeft className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Awaiting Transaction</p>
                  </motion.div>
                )}

                {status.type === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-stone-900">{status.message}</p>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-2 font-mono">Database Synced</p>
                  </motion.div>
                )}

                {status.type === "error" && (
                  <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-50 rounded-full flex items-center justify-center mb-3">
                      <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />
                    </div>
                    <p className="text-sm font-bold text-rose-700">{status.message}</p>
                    <p className="text-[10px] text-rose-400/80 uppercase tracking-widest mt-2 font-mono">Action Aborted</p>
                  </motion.div>
                )}

                {status.type === "fine" && (
                <motion.div key="fine" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center w-full">
                  <div className="w-full bg-rose-50 border border-rose-200 rounded-xl md:rounded-2xl p-4 md:p-5">
                    <Wallet className="w-5 h-5 md:w-6 md:h-6 text-rose-600 mx-auto mb-3" />
                    <p className="text-xs font-bold text-rose-900 mb-1">{status.message}</p>
                    
                    {status.fineMath && (
                      <div className="mt-3 mb-3 text-left bg-rose-500/10 p-3 rounded-lg md:rounded-xl border border-rose-500/20">
                        <div className="flex justify-between text-[9px] md:text-[10px] text-rose-700 font-mono mb-1">
                          <span>Due: {status.fineMath.due_date}</span>
                          <span>Returned: {status.fineMath.return_date}</span>
                        </div>
                        <div className="flex justify-between text-[9px] md:text-[10px] text-rose-700 font-mono font-bold pt-1 border-t border-rose-500/10 mt-1">
                          <span>Calculation:</span>
                          <span>{status.fineMath.days_late} days late × ₹5 = ₹{status.fineAmount}</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-lg md:rounded-xl py-3 border border-rose-100">
                      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1">Total Fine Generated</p>
                      <p className="text-2xl md:text-3xl font-black text-rose-600">₹{status.fineAmount}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              </AnimatePresence>
            </div>

            {/* 2. Transaction Log Block */}
            <div className="bg-white border border-stone-200 rounded-3xl md:rounded-[2.5rem] shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="p-4 md:p-6 border-b border-stone-100 flex items-center gap-2 bg-stone-50/50">
                <History className="w-4 h-4 text-stone-400" />
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-600">Session Log</h3>
              </div>
              
              <div className="p-4 md:p-6 flex-1">
                {recentTransactions.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {recentTransactions.map((tx) => (
                        <motion.div 
                          key={tx.id}
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                          className="flex items-start justify-between border-b border-stone-100 pb-4 last:border-0 last:pb-0"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                tx.action === "Issue" ? "bg-stone-100 text-stone-600 border-stone-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                              }`}>
                                {tx.action}
                              </span>
                              <span className="text-[9px] md:text-[10px] font-mono text-stone-400">{tx.time}</span>
                            </div>
                            <p className="text-xs md:text-sm font-bold text-stone-900 font-mono uppercase">{tx.rfid}</p>
                            {tx.user && <p className="text-[9px] md:text-[10px] text-stone-500 mt-0.5">{tx.user}</p>}
                          </div>
                          
                          {tx.status === "warning" ? (
                            <AlertCircle className="w-4 h-4 text-rose-500 mt-1" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}