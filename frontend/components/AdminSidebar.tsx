"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Users, BookOpen, Database, Server, 
  LayoutDashboard, Settings, Activity, ArrowRightLeft, X
} from "lucide-react";

export default function AdminSidebar({ 
  isServerLive = true, 
  isOpen, 
  onClose 
}: { 
  isServerLive?: boolean;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Dark Overlay - clicking this closes sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar - Slides in on mobile, static on desktop */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0A0F1C] border-r border-white/5 flex flex-col z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white line-clamp-1">SmartOS <span className="text-blue-500">Admin</span></span>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {[
              { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
              { name: "Inventory", path: "/admin/inventory", icon: BookOpen },
              { name: "Kiosk", path: "/admin/kiosk", icon: ArrowRightLeft },
              { name: "Master Ledger", path: "/admin/ledger", icon: Activity }, 
              { name: "Students", path: "/admin/students", icon: Users },
              { name: "Settings", path: "/admin/settings", icon: Settings },
            ].map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.name} 
                  href={item.path}
                  onClick={onClose} // Auto-close on mobile when a link is clicked
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" /> {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Health</span>
              <div className={`w-2 h-2 rounded-full shrink-0 ${isServerLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
            <div className="flex items-center gap-3">
              <Server className={`w-4 h-4 shrink-0 ${isServerLive ? 'text-emerald-500' : 'text-amber-500'}`} />
              <p className="text-xs font-semibold text-slate-300 line-clamp-1">
                {isServerLive ? "FastAPI Online" : "Local Fallback"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}