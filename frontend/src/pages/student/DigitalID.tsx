import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore"; // Correct Capitalization
import { QrCode, Wifi } from "lucide-react";

export default function DigitalID() {
  const user = useAuthStore((state) => state.user);

  return (
    <motion.div 
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      className="relative w-full aspect-[1.586/1] max-w-sm mx-auto perspective-1000 group"
    >
      {/* The Card Container */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 transform group-hover:scale-105">
        
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 animate-shimmer bg-[length:200%_200%]"></div>
        
        {/* Holographic Overlay */}
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(110deg,transparent,45%,#ffffff,55%,transparent)] bg-[length:200%_100%] animate-shimmer"></div>

        {/* Card Content */}
        <div className="relative p-6 flex flex-col justify-between h-full text-white z-10">
          
          {/* Top Row */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-blue-200 uppercase tracking-widest">Library Access Pass</p>
              <h3 className="text-xl font-bold tracking-tight mt-1">University Student</h3>
            </div>
            <Wifi className="w-6 h-6 opacity-70 animate-pulse" />
          </div>

          {/* Chip Visual */}
          <div className="flex items-center gap-4 my-2">
            <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-inner flex items-center justify-center border border-yellow-600/30">
               <div className="w-8 h-5 border border-yellow-600/50 rounded-sm flex gap-[2px]">
                 <div className="w-[1px] h-full bg-yellow-600/30"></div>
                 <div className="w-[1px] h-full bg-yellow-600/30"></div>
                 <div className="w-[1px] h-full bg-yellow-600/30"></div>
               </div>
            </div>
            <div className="h-full flex flex-col justify-center">
                 <p className="text-[10px] text-blue-200">NFC ENABLED</p>
                 <p className="text-[10px] text-blue-200">TAP TO ENTER</p>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex justify-between items-end">
             <div>
                <p className="text-xs text-blue-300">STUDENT ID</p>
                <p className="font-mono text-lg tracking-wider opacity-90">
                  {user?.email?.split('@')[0].toUpperCase() || "STU-2024-X"}
                </p>
             </div>
             <div className="bg-white p-1 rounded-lg">
                <QrCode className="w-8 h-8 text-slate-900" />
             </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}