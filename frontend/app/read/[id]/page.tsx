"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Settings2, Bookmark, Type, Moon, Sun, List } from "lucide-react";
import {ScrollProgress} from "@/components/ui/scroll-progress";

export default function ImmersiveReader() {
  const [isNightMode, setIsNightMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [showControls, setShowControls] = useState(false);

  // Theme configuration
  const theme = isNightMode 
    ? { bg: "bg-zinc-950", text: "text-zinc-300", UIbg: "bg-zinc-900/80", border: "border-zinc-800" } 
    : { bg: "bg-[#FBFBF9]", text: "text-stone-800", UIbg: "bg-white/80", border: "border-stone-200" };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${theme.bg} selection:bg-amber-500/30`}>
      
      {/* MagicUI Scroll Progress Bar */}
      <ScrollProgress className="bg-amber-500 h-1" />

      {/* Top Navigation (Minimal) */}
      <nav className="fixed top-0 inset-x-0 z-40 px-6 py-6 flex items-center justify-between pointer-events-none">
        <Link href="/books/123" className={`pointer-events-auto flex items-center gap-2 text-sm font-medium opacity-50 hover:opacity-100 transition-opacity ${theme.text}`}>
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Exit Reader</span>
        </Link>
        <button className={`pointer-events-auto opacity-50 hover:opacity-100 transition-opacity ${theme.text}`}>
          <Bookmark className="w-5 h-5" />
        </button>
      </nav>

      {/* The Actual Book Content */}
      <main className="max-w-2xl mx-auto px-6 py-32 md:py-40">
        
        <header className="mb-20 text-center">
          <h2 className="text-sm font-bold tracking-widest text-amber-600 uppercase mb-4">Chapter 1</h2>
          <h1 className={`text-4xl md:text-5xl font-serif font-medium leading-tight ${theme.text} mb-6`}>
            Design and Architecture
          </h1>
          <div className="w-12 h-1 bg-amber-500/20 mx-auto rounded-full" />
        </header>

        {/* Editorial Content - Typography focused */}
        <article 
          className={`font-serif leading-[2.2] tracking-wide ${theme.text} transition-all duration-300`}
          style={{ fontSize: `${fontSize}px` }}
        >
          <p className="mb-8 drop-cap">
            <span className="float-left text-6xl font-medium leading-none pr-3 pt-1 text-amber-600">T</span>
            he goal of software architecture is to minimize the human resources required to build and maintain the required system. The measure of design quality is simply the measure of the effort required to meet the needs of the customer. If that effort is low, and stays low throughout the lifetime of the system, the design is good.
          </p>
          <p className="mb-8">
            If that effort grows with each new release, the design is bad. It really is that simple. We can talk about principles and patterns and heuristics, but the ultimate metric is the cost of maintenance.
          </p>
          <p className="mb-8">
            Consider a typical system. In the beginning, the team is fast. The code is clean, the architecture is clear, and features are added with minimal effort. But as time passes, the system grows. Dependencies tangle. A change in one module breaks another. The team slows down. Management demands more features, but the developers are spending all their time fixing bugs and fighting the architecture.
          </p>

          <blockquote className={`pl-6 border-l-4 border-amber-500/50 italic my-12 ${isNightMode ? "text-zinc-400" : "text-stone-500"}`}>
            "The only way to go fast, is to go well." — Robert C. Martin
          </blockquote>

          <p className="mb-8">
            This is the signature of a bad architecture. It is a system that has become rigid, fragile, and immobile. It resists change. It is terrifying to deploy. 
          </p>
          <p className="mb-8">
            To prevent this, we must separate the high-level policy of the system from the low-level details. The business rules should not know about the database. The UI should not dictate the data structures. By drawing these boundaries, we create plugins. The database becomes a plugin to the business rules. The UI becomes a plugin. And plugins can be swapped, tested, and maintained independently.
          </p>
        </article>
      </main>

      {/* Floating Apple-Style Control Dock */}
      <div className="fixed bottom-8 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto">
          
          <button 
            onClick={() => setShowControls(!showControls)}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${isNightMode ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-white text-stone-800 border border-stone-200'}`}
            style={{ opacity: showControls ? 0 : 1, pointerEvents: showControls ? 'none' : 'auto' }}
          >
            <Settings2 className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`p-2 rounded-2xl backdrop-blur-2xl border shadow-2xl flex items-center gap-2 ${theme.UIbg} ${theme.border}`}
              >
                <button 
                  onClick={() => setShowControls(false)}
                  className={`p-3 rounded-xl transition-colors ${isNightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}
                >
                  <List className="w-5 h-5" />
                </button>
                
                <div className={`w-[1px] h-8 mx-2 ${isNightMode ? 'bg-zinc-800' : 'bg-stone-200'}`} />

                <div className="flex items-center gap-1 bg-black/5 rounded-xl p-1">
                  <button 
                    onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isNightMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-white text-stone-700'}`}
                  >
                    A-
                  </button>
                  <button 
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    className={`px-4 py-2 rounded-lg font-medium text-lg transition-colors ${isNightMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-white text-stone-700'}`}
                  >
                    A+
                  </button>
                </div>

                <div className={`w-[1px] h-8 mx-2 ${isNightMode ? 'bg-zinc-800' : 'bg-stone-200'}`} />

                <button 
                  onClick={() => setIsNightMode(!isNightMode)}
                  className={`p-3 rounded-xl transition-colors ${isNightMode ? 'hover:bg-zinc-800 text-amber-400' : 'hover:bg-stone-100 text-indigo-500'}`}
                >
                  {isNightMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}