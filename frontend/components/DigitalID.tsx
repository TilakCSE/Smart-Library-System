"use client";

import { motion } from "framer-motion";
import { QrCode, Wifi } from "lucide-react";
// Assuming you have this, otherwise we fallback gracefully
// import { useAuthStore } from "@/store/authStore"; 

interface DigitalIDProps {
  realName?: string;
  major?: string;
}

export default function DigitalID({ realName, major }: DigitalIDProps) {
  // Fallback data for the UI prototype
  const displayId = "STU-2024-X";
  const displayName = realName || "Tilak Chauhan";
  const displayMajor = major || "B.Tech CSE - 3rd Year";

  return (
    <motion.div 
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      className="relative w-full aspect-[1.586/1] max-w-sm mx-auto perspective-1000 group"
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 transform group-hover:scale-[1.02]">
        
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-br from-cyan-600 via-blue-800 to-neutral-950 animate-pulse bg-[length:200%_200%]"></div>
        
        {/* Holographic Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(110deg,transparent,45%,#ffffff,55%,transparent)] bg-[length:200%_100%] animate-shimmer"></div>

        {/* Card Content */}
        <div className="relative p-6 flex flex-col justify-between h-full text-white z-10 backdrop-blur-sm">
          
          {/* Top Row */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-1">Library Access Pass</p>
              <h3 className="text-xl font-bold tracking-tight">{displayName}</h3>
              <p className="text-xs text-neutral-300 mt-0.5">{displayMajor}</p>
            </div>
            <Wifi className="w-6 h-6 text-cyan-400 opacity-80 animate-pulse" />
          </div>

          {/* Chip Visual */}
          <div className="flex items-center gap-4 my-2">
            <div className="w-12 h-9 rounded-md bg-linear-to-br from-yellow-200 to-yellow-500 shadow-inner flex items-center justify-center border border-yellow-600/30">
               <div className="w-8 h-5 border border-yellow-600/50 rounded-sm flex gap-[2px]">
                 <div className="w-[1px] h-full bg-yellow-600/30"></div>
                 <div className="w-[1px] h-full bg-yellow-600/30"></div>
                 <div className="w-[1px] h-full bg-yellow-600/30"></div>
               </div>
            </div>
            <div className="h-full flex flex-col justify-center">
                 <p className="text-[10px] text-cyan-200 font-bold tracking-wider">NFC ENABLED</p>
                 <p className="text-[10px] text-cyan-200/70 tracking-widest">TAP TO ENTER</p>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex justify-between items-end">
             <div>
                <p className="text-[10px] text-cyan-300 font-bold tracking-widest">STUDENT ID</p>
                <p className="font-mono text-lg tracking-wider opacity-90 drop-shadow-md">
                  {displayId}
                </p>
             </div>
             <div className="bg-white p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <QrCode className="w-8 h-8 text-neutral-900" />
             </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}