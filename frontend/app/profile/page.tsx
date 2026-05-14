"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  ChevronRight, 
  History, 
  ShieldCheck, 
  Trophy,
  CreditCard
} from "lucide-react";

import DigitalID from "@/components/DigitalID";
import { MagicCard } from "@/components/ui/magic-card";
import { Meteors } from "@/components/ui/meteors";
import { RetroGrid } from "@/components/ui/retro-grid";
import { BlurFade } from "@/components/ui/blur-fade";

export default function StudentProfile() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/20">
      
      {/* PERSPECTIVE HEADER */}
      <section className="relative h-64 bg-[#0A0F1C] overflow-hidden flex items-end">
        <RetroGrid className="opacity-20" />
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-8 z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="w-24 h-24 rounded-2xl bg-blue-600 border-4 border-[#0A0F1C] flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-white">TC</span>
            </div>
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">Tilak Chauhan</h1>
              <p className="text-slate-400 font-medium">B.Tech CSE • 6th Semester</p>
            </div>
            <button className="md:ml-auto mb-2 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-md transition-all border border-white/10">
              <Settings className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: IDENTITY & LOANS */}
          <div className="lg:col-span-4 space-y-8">
            <BlurFade delay={0.1}>
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> Digital Identity
                </h3>
                {/* Reusing your custom DigitalID component */}
                <DigitalID />
              </div>
            </BlurFade>

            <BlurFade delay={0.2}>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-6">System Privileges</h3>
                <div className="space-y-4">
                  {[
                    { label: "3D Spatial Access", status: "Enabled", icon: ShieldCheck, color: "text-emerald-500" },
                    { label: "Express Book Queue", status: "Elite", icon: Trophy, color: "text-amber-500" },
                  ].map((priv, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <priv.icon className={`w-4 h-4 ${priv.color}`} />
                        <span className="text-sm font-semibold">{priv.label}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{priv.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>

          {/* RIGHT: ACTIVITY LEDGER */}
          <div className="lg:col-span-8 space-y-8">
            <BlurFade delay={0.3}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* METEOR CARD: Achievement */}
                <div className="relative h-48 w-full overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl">
                  <Meteors number={20} />
                  <div className="relative z-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Academic Rank</p>
                    <h2 className="text-4xl font-black text-white mb-2">Top 5%</h2>
                    <p className="text-sm text-slate-400">Library Contribution & Reading Velocity</p>
                  </div>
                </div>

                <MagicCard className="p-8 bg-white border border-slate-200 flex flex-col justify-center" gradientColor="#f1f5f9">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Active Loans</p>
                  <h2 className="text-4xl font-black text-slate-900 mb-2">03</h2>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    Next due in <span className="text-rose-500 font-bold">2 days</span>
                  </p>
                </MagicCard>
              </div>
            </BlurFade>

            <BlurFade delay={0.4}>
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900">Personal Asset History</h3>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {[
                    { book: "The Art of Game Design", date: "Check-out: May 02", status: "Active" },
                    { book: "Clean Architecture", date: "Check-out: Apr 28", status: "Active" },
                    { book: "Three.js Journey", date: "Returned: Apr 15", status: "Completed" },
                  ].map((asset, i) => (
                    <div key={i} className="group px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{asset.book}</p>
                        <p className="text-xs text-slate-500 font-medium">{asset.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${asset.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          {asset.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>

        </div>
      </main>
    </div>
  );
}