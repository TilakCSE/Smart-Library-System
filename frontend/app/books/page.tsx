"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Firebase & API
import { auth } from "@/lib/firebase";
import { fetchFromAPI } from "@/lib/api";
import { AlertTriangle, Unlock } from "lucide-react"; // Add these to your lucide-react imports
import { useStudentStore } from "@/store/studentStore"; // Import your Zustand store
// UI Components
import { TiltCard } from "@/components/TiltCard";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Particles } from "@/components/ui/particles";

// Database Interface
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  cover_image_url: string;
  unity_location_id: string;
}

// Custom hook to delay API calls while typing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Generate consistent CSS gradients based on book category
const getBookColor = (category: string) => {
  const colors = [
    "from-purple-900 to-indigo-900",
    "from-slate-800 to-neutral-900",
    "from-cyan-900 to-blue-900",
    "from-emerald-900 to-teal-900",
    "from-orange-900 to-red-900",
  ];
  if (!category) return colors[1];
  const hash = category
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function BooksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Real Database State
  const [books, setBooks] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  // Debounce the search input by 300ms
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { isLocating, locationError, verifyLocation } = useStudentStore();
  const [tapCount, setTapCount] = useState(0);
  const [isGodMode, setIsGodMode] = useState(false);

  const handleSecretTap = () => {
    setTapCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setIsGodMode(true);
        return 0;
      }
      return newCount;
    });
  };

  useEffect(() => {
    const loadBooks = async () => {
      setIsSearching(true);
      try {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : "";

        const endpoint = debouncedSearch
          ? `/api/v1/books/?query=${encodeURIComponent(debouncedSearch)}`
          : `/api/v1/books/`;

        const response = await fetchFromAPI(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setBooks(response);
      } catch (error) {
        console.error("Failed to fetch from Vault:", error);
      } finally {
        setIsSearching(false);
      }
    };

    loadBooks();
  }, [debouncedSearch]);

  const hasSearchText = searchQuery.length > 0;

  const handleLocateIn3D = async (bookId: string) => {
    // 1. Check Geofence (Unless God Mode is active)
    if (!isGodMode) {
      const isAtLibrary = await verifyLocation();
      if (!isAtLibrary) return; // Stop execution, the UI error will show
    }

    // 2. Log Telemetry
    if (selectedBook) {
      try {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : "";
        await fetchFromAPI("/api/v1/analytics/log-search", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: JSON.stringify({
            search_query: selectedBook.title,
            unity_location_id: selectedBook.unity_location_id,
          }),
        });
      } catch (error) {
        console.error("Telemetry logging failed:", error);
      }
    }

    // 3. Route to 3D Map
    router.push(`/locate/${bookId}`);
  };

  return (
    <div
      className="relative min-h-screen text-neutral-50 font-sans overflow-x-hidden selection:bg-cyan-500/30"
      style={{
        backgroundColor: "#2c2826",
        backgroundImage:
          "radial-gradient(#1a1817 1.5px, transparent 1.5px), radial-gradient(#1a1817 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
        backgroundPosition: "0 0, 16px 16px",
      }}
    >
      {hasSearchText && books.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-0 opacity-60 transition-opacity duration-1000">
          <Particles quantity={150} color="#0891b2" ease={80} refresh />
        </div>
      )}

      {/* REFINED HEADER: Tighter mobile padding and extreme frosted glass blur */}
      <header className="sticky top-4 sm:top-6 z-50 mx-auto w-full max-w-2xl px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="relative group rounded-2xl p-[1px] bg-gradient-to-r from-white/10 via-cyan-500/50 to-white/10 shadow-[0_0_30px_rgba(8,145,178,0.2)] transition-all duration-500 focus-within:shadow-[0_0_50px_rgba(8,145,178,0.5)] focus-within:via-cyan-400">
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
          </div>

          <div className="relative flex items-center px-4 py-3 sm:py-4 bg-neutral-950/80 backdrop-blur-2xl rounded-2xl border border-white/5 z-10">
            {isSearching ? (
              <Loader2 className="text-cyan-400 mr-3 w-5 h-5 sm:w-6 sm:h-6 animate-spin flex-shrink-0" />
            ) : (
              <Search className="text-cyan-400/70 mr-3 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 group-focus-within:text-cyan-400 transition-colors" />
            )}

            <input
              type="text"
              placeholder="Search by title, author..."
              className="w-full bg-transparent text-base sm:text-lg text-white font-medium focus:outline-none placeholder:text-neutral-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />

            {/* Cyberpunk Tag - Hidden securely on mobile */}
            <div className="absolute right-4 hidden sm:flex items-center">
              <kbd
                onClick={handleSecretTap}
                className={`border px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest cursor-pointer transition-all select-none ${
                  isGodMode
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-neutral-900 border-white/10 text-cyan-500/70 hover:text-cyan-400"
                }`}
              >
                {isGodMode ? (
                  <span className="flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> God Mode
                  </span>
                ) : (
                  "Database"
                )}
              </kbd>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-0 sm:px-8 pb-24 mt-8">
        {/* REFINED GRID: 2 columns on mobile for readable covers, scaling up gracefully */}
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-16 sm:gap-y-24 gap-x-0">
          <AnimatePresence>
            {books.map((book, idx) => (
              <div
                key={book.id}
                className="relative flex flex-col items-center justify-end h-[220px] sm:h-[350px]"
              >
                {/* --- 1. THE SEAMLESS 3D SHELF --- */}
                {/* REFINED: Using 100vw breakout so the shelf never breaks between grid columns */}
                <div
                  className="absolute bottom-0 left-1/2 w-[100vw] -translate-x-1/2 h-10 sm:h-12 z-0"
                  style={{
                    backgroundImage: "url('/shelf_books.png')",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                  }}
                />

                {/* Soft shadow directly under the full-width shelf */}
                <div className="absolute -bottom-5 left-1/2 w-[100vw] -translate-x-1/2 h-5 bg-gradient-to-b from-black/80 to-transparent z-0 pointer-events-none" />

                {/* --- 2. THE BOOK --- */}
                <div className="relative z-10 w-[75%] sm:w-[85%] max-w-[140px] sm:max-w-[180px] mb-8 sm:mb-10 cursor-pointer group">
                  <BlurFade delay={0.1 + (idx % 10) * 0.05} inView>
                    <TiltCard tiltLimit={10} scale={1.03} spotlight={true}>
                      <motion.div
                        layoutId={`book-cover-${book.id}`} // <--- THIS IS THE MAGIC KEY
                        onClick={() => setSelectedBook(book)}
                        // When selected, we make the shelf version invisible so it looks like it physically left the shelf
                        className={`aspect-[2/3] w-full bg-gradient-to-br ${getBookColor(book.category)} rounded-r-md rounded-l-sm relative overflow-hidden flex flex-col items-center justify-center border-r-[2px] border-l-[1px] border-y-[1px] border-black/50 shadow-[-12px_12px_15px_-3px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[-18px_18px_20px_-5px_rgba(0,0,0,0.6)] ${
                          selectedBook?.id === book.id ? "opacity-0 pointer-events-none" : "opacity-100"
                        }`}
                      >
                        <div className="absolute inset-0 z-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="w-full h-full object-cover opacity-95 group-hover:opacity-100 brightness-105 transition-all duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>

                        {/* --- 3D LIGHTING TRICKS --- */}
                        <div className="absolute inset-y-0 left-1 sm:left-1.5 w-1.5 bg-gradient-to-r from-white/30 to-transparent z-10 mix-blend-overlay" />
                        <div className="absolute inset-y-0 left-0 w-[2px] sm:w-[3px] bg-black/60 z-10" />
                        <div className="absolute inset-y-0 right-0 w-2 sm:w-4 bg-gradient-to-l from-black/40 to-transparent z-10 pointer-events-none" />
                      </motion.div>
                    </TiltCard>
                  </BlurFade>
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>

        {books.length === 0 && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 text-neutral-500 bg-black/40 mx-4 rounded-3xl backdrop-blur-md"
          >
            <p className="text-2xl font-light">
              No assets found in the archives.
            </p>
          </motion.div>
        )}
      </main>

      {/* The Sheet component remains exactly as you had it below this line! */}
      <Sheet
        open={!!selectedBook}
        onOpenChange={(open) => !open && setSelectedBook(null)}
      >
        <SheetContent
          side="right"
          // RESPONSIVE FIX: w-full on mobile (acts like a new page), max-w-md on desktop.
          className="bg-neutral-900/95 backdrop-blur-2xl border-none sm:border-l sm:border-white/10 text-white p-0 w-full sm:max-w-md flex flex-col shadow-2xl"
        >
          {selectedBook && (
            <>
              {/* RESPONSIVE FIX: Tighter padding (p-5) on mobile, p-8 on desktop */}
              <div className="p-5 sm:p-8 flex-1 overflow-y-auto mt-8 sm:mt-8 custom-scrollbar">
                <motion.div
                  layoutId={`book-cover-${selectedBook.id}`}
                  // RESPONSIVE FIX: Shrunk the massive cover (max-w-[140px]) on mobile
                  className={`aspect-[2/3] w-full max-w-[140px] sm:max-w-[220px] mx-auto bg-gradient-to-br ${getBookColor(selectedBook.category)} rounded-md flex items-center justify-center p-4 sm:p-6 border-r-[3px] border-b-[3px] sm:border-r-4 sm:border-b-4 border-black/50 shadow-2xl mb-6 sm:mb-10 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 z-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedBook.cover_image_url}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div className="absolute inset-y-0 left-2 sm:left-3 w-1 sm:w-1.5 bg-white/10 z-10" />
                  <h3 className="font-bold text-center text-lg sm:text-2xl text-white drop-shadow-lg z-20 relative px-2">
                    {selectedBook.title}
                  </h3>
                </motion.div>

                <SheetHeader className="text-left mb-6 sm:mb-8 mt-2">
                  <SheetTitle className="text-2xl sm:text-3xl text-white font-bold leading-tight">
                    {selectedBook.title}
                  </SheetTitle>
                  <SheetDescription className="text-neutral-400 text-base sm:text-lg mt-1 sm:mt-2">
                    by {selectedBook.author}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl">
                    <span className="text-neutral-400 text-xs sm:text-sm">Database Category</span>
                    <span className="font-mono text-cyan-400 font-bold bg-cyan-400/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-cyan-400/20 text-[10px] sm:text-sm text-right max-w-[50%] leading-tight">
                      {selectedBook.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl">
                    <span className="text-neutral-400 text-xs sm:text-sm">System ISBN</span>
                    <span className="font-mono text-neutral-300 tracking-widest text-[10px] sm:text-sm">
                      {selectedBook.isbn}
                    </span>
                  </div>
                </div>
              </div>

              {/* RESPONSIVE FIX: Added pb-8 on mobile so the button doesn't hit the iPhone home bar */}
              <div className="p-4 sm:p-6 bg-neutral-950/50 border-t border-white/10 flex flex-col gap-3 sm:gap-4 pb-8 sm:pb-6">
                <AnimatePresence>
                  {locationError && !isGodMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-rose-400 leading-relaxed">
                          {locationError}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  disabled={isLocating}
                  onClick={() => handleLocateIn3D(selectedBook.id)}
                  className="w-full py-3.5 sm:py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(8,145,178,0.3)] hover:shadow-[0_0_40px_rgba(8,145,178,0.5)] disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="text-xs sm:text-sm">VERIFYING COORDINATES...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm">LOCATE IN 3D SPACE</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
