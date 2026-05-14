"use client";

import React from "react";

export function LoadingRadar() {
  return (
    <div className="relative flex items-center justify-center w-[120px] h-[120px] rounded-full border border-cyan-900 shadow-[0_0_30px_rgba(8,145,178,0.3)] overflow-hidden bg-black/50 backdrop-blur-md">
      <div className="absolute inset-4 rounded-full border border-dashed border-cyan-700/50" />
      <div className="absolute w-[40px] h-[40px] rounded-full border border-dashed border-cyan-500/50" />
      
      <span className="absolute top-1/2 left-1/2 w-1/2 h-full bg-transparent origin-top-left border-t border-dashed border-cyan-400 animate-[radar_2s_linear_infinite]">
        <span className="absolute top-0 left-0 w-full h-full bg-cyan-500/40 origin-top-left rotate-[-55deg] blur-[15px]" />
      </span>

      <style>{`
        @keyframes radar {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}