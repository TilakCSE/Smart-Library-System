"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crosshair, Terminal as IconTerminal, Layers } from "lucide-react";
import { Unity, useUnityContext } from "react-unity-webgl";

import { RetroGrid } from "@/components/ui/retro-grid";
import { BlurFade } from "@/components/ui/blur-fade";

// Backend API 
import { fetchFromAPI } from "@/lib/api";
import { auth } from "@/lib/firebase";

interface Book {
  id: string;
  title: string;
  author: string;
  unity_location_id: string;
}

export default function SpatialLocator() {
  const params = useParams();
  const router = useRouter();
  
  const bookId = (params.bookId as string) || ""; 
  
  const [book, setBook] = useState<Book | null>(null);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Unity Setup
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: "/unity-build/Library_WebGL_Build.loader.js",
    dataUrl: "/unity-build/Library_WebGL_Build.data",
    frameworkUrl: "/unity-build/Library_WebGL_Build.framework.js",
    codeUrl: "/unity-build/Library_WebGL_Build.wasm",
  });

  const addLog = (msg: string) => {
    setBootLogs((prev) => {
      const updated = [...prev, msg];
      return updated.length > 4 ? updated.slice(updated.length - 4) : updated;
    });
  };

  useEffect(() => {
    if (!bookId) return;
    addLog(`Initializing Spatial Engine...`);
    setTimeout(() => addLog(`Querying secure vault for Asset // ${bookId.slice(0, 8)}...`), 800);
  }, [bookId]);

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      try {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : "";
        const response = await fetchFromAPI(`/api/v1/books/${bookId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setBook(response);
        addLog(`Asset Acquired: ${response.title}`);
        addLog(`Awaiting WebGL environment sync...`);
      } catch (error) {
        addLog(`ERROR: Failed to establish database uplink.`);
      }
    };
    fetchBook();
  }, [bookId]);

  useEffect(() => {
    if (isLoaded && book) {
      addLog(`WebGL Navigation Environment Online.`);
      addLog(`Broadcasting coordinates: ${book.unity_location_id}`);
      
      setTimeout(() => {
        sendMessage("LibraryManager", "GoToLocation", book.unity_location_id);
      }, 1000); 
    }
  }, [isLoaded, book, sendMessage]);

  const loadPercent = Math.round(loadingProgression * 100);

  return (
    <div className="relative w-screen h-screen bg-stone-950 overflow-hidden text-stone-200 flex flex-col">
      
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <RetroGrid angle={65} className="text-stone-500" />
      </div>

      <header className="relative z-30 p-6 md:p-8 flex justify-between items-start pointer-events-auto">
        <BlurFade delay={0.1} className="flex-1">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-3 text-stone-500 hover:text-stone-100 transition-colors mb-4 md:mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold tracking-widest uppercase">Terminate Session</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Crosshair className={`w-6 h-6 ${isLoaded ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-medium text-white tracking-tight line-clamp-1">
                {book ? book.title : "Spatial Guidance"}
              </h1>
              <p className="text-[10px] md:text-xs font-mono text-stone-500 uppercase tracking-widest mt-1">
                Target // {book ? book.author : bookId.slice(0, 8)}
              </p>
            </div>
          </div>
        </BlurFade>

        <div className="hidden md:flex gap-4">
          <div className="px-4 py-2 bg-stone-900/50 border border-white/5 rounded-full flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isLoaded ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              {isLoaded ? "Hardware Online" : "Engine Booting"}
            </span>
          </div>
        </div>
      </header>

      {/* EXTENDED CANVAS: Margins reduced to stretch the 3D viewport */}
      <main className="relative flex-1 z-10 mx-4 mb-4 md:mx-6 md:mb-6 bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl flex items-center justify-center">
        
        <div className="absolute inset-0 z-0 mix-blend-screen pointer-events-auto">
          <Unity 
            unityProvider={unityProvider} 
            style={{ width: "100%", height: "100%" }} 
          />
        </div>

        {!isLoaded && (
          <div className="relative z-10 text-center group cursor-crosshair bg-stone-950/50 backdrop-blur-sm p-12 rounded-3xl border border-white/5">
            <Layers className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
            <p className="text-stone-300 font-mono text-xs tracking-[0.4em] uppercase mb-2">Compiling Spatial Data</p>
            <div className="w-48 h-1 bg-stone-900 mx-auto rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${loadPercent}%` }} />
            </div>
            <p className="text-amber-500 font-mono text-[10px] mt-3 italic">[ {loadPercent}% ]</p>
          </div>
        )}

        {/* Floating Interaction Prompt */}
        {isLoaded && book && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-bounce">
            <div className="bg-stone-950/80 backdrop-blur-md border border-amber-500/30 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <p className="hidden sm:block text-stone-300 text-sm font-mono tracking-widest text-center">
                PRESS <kbd className="bg-stone-800 border border-stone-600 px-2 py-1 rounded-md text-amber-500 font-bold mx-1 shadow-inner">SPACE</kbd> TO MOVE AGENT
              </p>
              <p className="block sm:hidden text-stone-300 text-sm font-mono tracking-widest text-center">
                TAP TO MOVE AGENT
              </p>
            </div>
          </div>
        )}

        {/* FLOATING HUD: Live Telemetry (Bottom Left) */}
        <div className="absolute left-6 bottom-6 z-30 pointer-events-none w-[340px] hidden sm:block">
          <div className="pointer-events-auto bg-stone-900/60 backdrop-blur-xl border border-white/5 p-5 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <IconTerminal className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">Live Telemetry</span>
            </div>
            
            <div className="space-y-1.5 h-[80px] overflow-hidden flex flex-col justify-end">
              <AnimatePresence initial={false}>
                {bootLogs.map((log, i) => (
                  <motion.div 
                    key={`${i}-${log}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-amber-500/50 font-mono text-[10px] shrink-0 mt-0.5">{'>'}</span>
                    <span className="text-stone-300 font-mono text-[10px] leading-relaxed">{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* FLOATING HUD: System Coordinates (Bottom Right) */}
        <div className="absolute right-6 bottom-6 z-30 pointer-events-none hidden lg:block">
          <div className="pointer-events-auto bg-stone-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-xl text-right">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.5em]">System Coordinates</p>
              <p className={`font-mono mt-1 uppercase ${book ? 'text-amber-400 text-xs' : 'text-stone-600 text-[10px]'}`}>
                {book ? book.unity_location_id.replace(/_/g, " // ") : "AWAITING SYNC..."}
              </p>
          </div>
        </div>

      </main>
    </div>
  );
}