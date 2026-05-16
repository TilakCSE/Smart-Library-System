"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0F1C]">
      
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A0F1C] border-b border-white/10 z-50 sticky top-0">
        <span className="font-bold text-lg tracking-tight text-white">SmartOS <span className="text-blue-500">Admin</span></span>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-white/5 text-white rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <AdminSidebar 
        isServerLive={true} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* md:ml-64 ensures the content is pushed right ONLY on desktop */}
      <div className="flex-1 md:ml-64 w-full relative">
        {children}
      </div>
    </div>
  );
}