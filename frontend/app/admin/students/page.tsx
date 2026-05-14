"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, AlertTriangle, Wallet, ArrowLeft, 
  MoreVertical, Mail, Ban, CheckCircle2, X, Loader2 
} from "lucide-react";
import Link from "next/link";

// NEW: Import the Sidebar component we created
import AdminSidebar from "@/components/AdminSidebar";

// API & Auth Imports
import { fetchFromAPI } from "@/lib/api";
import { auth } from "@/lib/firebase";

interface Student {
  id: string;
  full_name: string; 
  email: string;
  active_issues: number; 
  fines: number; 
  status: "Active" | "Blocked";
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const loadStudents = async () => {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const response = await fetchFromAPI("/api/v1/admin/students", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setStudents(response);
    } catch (error) {
      console.error("Failed to load student directory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleClearFines = async (studentId: string) => {
    setStudents((current) => 
      current.map((s) => s.id === studentId ? { ...s, fines: 0, status: "Active" } : s)
    );
    setSelectedStudent(null);

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      await fetchFromAPI(`/api/v1/admin/students/${studentId}/clear-fines`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      loadStudents();
    } catch (error) {
      console.error("Financial reconciliation failed:", error);
      loadStudents(); 
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      (s.full_name?.toLowerCase().includes(query.toLowerCase()) || false) || 
      (s.id?.toLowerCase().includes(query.toLowerCase()) || false)
    );
  }, [students, query]);

  const totalFines = students.reduce((acc, s) => acc + s.fines, 0);
  const flaggedCount = students.filter(s => s.status === "Blocked").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex">
        <AdminSidebar isServerLive={false} />
        <main className="flex-1 ml-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Decrypting Student Records...</p>
        </main>
      </div>
    );
  }

  return (
    // NEW WRAPPER: Flex layout to accommodate the sidebar
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* 1. Sidebar Injection */}
      <AdminSidebar isServerLive={true} />

      {/* 2. Main Content with ml-64 to prevent overlap */}
      <main className="flex-1 ml-64 p-6 md:p-12 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <Link href="/admin" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-blue-500 transition-colors mb-4 group">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Command
              </Link>
              <h1 className="text-4xl font-serif text-white tracking-tight">Student Intelligence</h1>
            </div>

            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-600/50 backdrop-blur-xl transition-all"
              />
            </div>
          </header>

          {/* KPI CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] hover:bg-slate-900/60 transition-colors">
              <Users className="w-6 h-6 text-blue-500 mb-4" />
              <h3 className="text-3xl font-bold text-white tracking-tight">{students.length}</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Total Enrolled</p>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] hover:bg-slate-900/60 transition-colors">
              <AlertTriangle className="w-6 h-6 text-amber-500 mb-4" />
              <h3 className="text-3xl font-bold text-white tracking-tight">{flaggedCount}</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Blocked Accounts</p>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] hover:bg-slate-900/60 transition-colors">
              <Wallet className="w-6 h-6 text-emerald-500 mb-4" />
              <h3 className="text-3xl font-bold text-white tracking-tight">₹{totalFines.toLocaleString()}</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Outstanding Fines</p>
            </div>
          </section>

          {/* TABLE */}
          <div className="bg-slate-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-8 py-5">Student Identity</th>
                  <th className="px-8 py-5">Active Loans</th>
                  <th className="px-8 py-5">Balance</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className="group hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-200">{student.full_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 uppercase">{student.id.substring(0, 18)}...</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-400">
                      {student.active_issues} Books
                    </td>
                    <td className={`px-8 py-6 text-sm font-bold ${student.fines > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      ₹{student.fines}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        student.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <MoreVertical className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* SIDEBAR PANEL (Drawer) */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" 
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0A0F1C] border-l border-white/5 shadow-2xl z-[110] p-10 flex flex-col"
            >
              <button onClick={() => setSelectedStudent(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>

              <div className="mt-12 mb-10">
                <h2 className="text-3xl font-serif text-white tracking-tight">{selectedStudent.full_name}</h2>
                <p className="text-xs font-mono text-blue-500 uppercase tracking-widest mt-2">{selectedStudent.id}</p>
                <div className="flex items-center gap-2 mt-6 text-slate-400 text-xs">
                  <Mail className="w-3 h-3" /> {selectedStudent.email}
                </div>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Current Circulation</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(selectedStudent.active_issues / 5) * 100}%` }} />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mt-3 text-right">{selectedStudent.active_issues} of 5 used</p>
                </div>

                <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-[2rem]">
                   <span className="text-[10px] font-bold text-rose-500/50 uppercase tracking-widest block mb-2">Accrued Penalties</span>
                   <p className="text-3xl font-bold text-white tracking-tight">₹{selectedStudent.fines}</p>
                </div>
              </div>

              <div className="pt-10 space-y-4">
                <button 
                  disabled={selectedStudent.fines === 0}
                  onClick={() => handleClearFines(selectedStudent.id)}
                  className="w-full py-4 bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4" /> Reconcile & Unblock
                </button>
                <button className="w-full py-4 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                  <Ban className="w-4 h-4" /> Revoke All Access
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}