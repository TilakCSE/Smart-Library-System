"use client";

import { Crosshair, Plus, Minus, AlertCircle } from "lucide-react";
import Link from "next/link";

export function CyberButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="relative group inline-flex">
      {/* Glitch layered shadows */}
      <div className="absolute inset-0 bg-red-500/20 translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-all" />
      <div className="absolute inset-0 bg-cyan-500/20 -translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-100 transition-all" />
      
      <button className="relative px-6 py-2.5 bg-neutral-950 border-2 border-red-500/50 text-red-500 font-mono font-bold tracking-[0.2em] uppercase overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-red-600/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-200 ease-out" />
        <span className="relative z-10 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {label}
        </span>
      </button>
    </Link>
  );
}

export function HudSidebar() {
  return (
    <div className="flex flex-col gap-4 bg-neutral-950/60 backdrop-blur-xl border border-cyan-500/30 p-2 shadow-[0_0_30px_rgba(8,145,178,0.15)] rounded-lg">
      <button className="p-3 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded transition-colors border border-transparent hover:border-cyan-500/50">
        <Plus className="w-6 h-6" />
      </button>
      <div className="w-full h-[1px] bg-cyan-500/30" />
      <button className="p-3 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded transition-colors border border-transparent hover:border-cyan-500/50">
        <Crosshair className="w-6 h-6" />
      </button>
      <div className="w-full h-[1px] bg-cyan-500/30" />
      <button className="p-3 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded transition-colors border border-transparent hover:border-cyan-500/50">
        <Minus className="w-6 h-6" />
      </button>
    </div>
  );
}