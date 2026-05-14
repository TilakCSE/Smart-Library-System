"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchFromAPI } from "@/lib/api";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ArrowLeft, 
  Download,
  RefreshCcw
} from "lucide-react";
import Link from "next/link";

import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Meteors } from "@/components/ui/meteors";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { Confetti } from "@/components/ui/confetti"; // Assuming you have a confetti component or can trigger one

type StatusType = "processing" | "success" | "error";

export default function TransactionStatus() {
  const [status, setStatus] = useState<StatusType>("processing");

  // Simulate a real-world RFID/Database verification sequence
  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        // Hitting the root or a basic health check endpoint on your FastAPI backend
        // We can change this to the specific RFID validation endpoint later
        await fetchFromAPI("/"); 
        
        // If the backend responds successfully, trigger the success vibe
        setStatus("success");
      } catch (error) {
        console.error("Backend connection failed:", error);
        // If the backend is down or throws an error, trigger the block state
        setStatus("error");
      }
    };

    const timer = setTimeout(() => {
      verifyTransaction();
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6 overflow-hidden relative">
      
      <AnimatePresence mode="wait">
        {/* STATE: PROCESSING */}
        {status === "processing" && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center z-10"
          >
            <div className="relative mb-8">
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin mx-auto opacity-20" />
              <Loader2 className="w-20 h-20 text-blue-400 animate-spin mx-auto absolute inset-0 blur-sm" />
            </div>
            <TypingAnimation>Verifying RFID Signature...</TypingAnimation>
            <p className="text-slate-500 text-sm mt-4 font-medium uppercase tracking-[0.2em]">Connecting to SmartOS Core</p>
          </motion.div>
        )}

        {/* STATE: SUCCESS */}
        {status === "success" && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-[0_0_100px_rgba(16,185,129,0.1)] relative overflow-hidden"
          >
            <Confetti/>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Access Granted</h1>
            <p className="text-slate-500 font-medium mb-8">
              "Clean Architecture" has been successfully assigned to your ID. Please collect the volume from <span className="text-slate-900 font-bold">Rack_12</span>.
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Return Date</span>
                <span className="text-xs font-black text-slate-900">May 18, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asset ID</span>
                <span className="text-xs font-mono text-slate-900 font-bold">#RFID-9021-X</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <ShimmerButton className="w-full py-4 rounded-2xl font-bold shadow-xl">
                Done
              </ShimmerButton>
              <button className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
                <Download className="w-4 h-4" /> Download Receipt
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE: ERROR */}
        {status === "error" && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-slate-950 border border-rose-500/30 rounded-[2.5rem] p-10 text-center relative overflow-hidden"
          >
            <Meteors number={15} />
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            
            <h1 className="text-3xl font-black text-white mb-4 tracking-tight">System Block</h1>
            <p className="text-slate-400 font-medium mb-8 leading-relaxed">
              Transaction halted. Your account has <span className="text-rose-500 font-bold">₹150 in active fines</span>. Please clear dues to resume library privileges.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/dashboard" className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-600/20">
                Pay Fines
              </Link>
              <button 
                onClick={() => setStatus("processing")}
                className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-colors"
              >
                <RefreshCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED FOOTER LOGO */}
      <div className="absolute bottom-10 opacity-20 flex items-center gap-2">
        <span className="font-bold text-white tracking-widest text-xs">SMART OS CORE INFRASTRUCTURE</span>
      </div>
    </div>
  );
}