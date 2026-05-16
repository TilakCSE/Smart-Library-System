"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { Observer } from "gsap/dist/Observer";
import {
  Search,
  Plus,
  X,
  BookOpen,
  User,
  Hash,
  MapPin,
  Image as ImageIcon,
  Zap,
  Check,
  RotateCcw,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// API & Auth Imports
import { fetchFromAPI } from "@/lib/api";
import { auth } from "@/lib/firebase";
import AdminSidebar from "@/components/AdminSidebar";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

// Interface to match your backend Pydantic model
interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  cover_image_url: string; // Matches your backend field name
  unity_location_id: string; // Matches your backend field name
  isbn: string;
}

export default function DigitalVault() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const bookRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 1. FETCH LIVE BOOKS FROM DATABASE
  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";

      const response = await fetchFromAPI("/api/v1/books/", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setBooks(response);
    } catch (error) {
      console.error("Vault Access Denied:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.isbn.includes(searchQuery),
    );
  }, [books, searchQuery]);

  // NAVIGATION LOGIC
  const next = () =>
    setActiveIndex((p) => Math.min(filteredBooks.length - 1, p + 1));
  const prev = () => setActiveIndex((p) => Math.max(0, p - 1));

  // GESTURE & KEYBOARD CONTROL
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);

    const obs = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      onDown: () => !isModalOpen && next(),
      onUp: () => !isModalOpen && prev(),
      onRight: () => !isModalOpen && prev(),
      onLeft: () => !isModalOpen && next(),
      tolerance: 50,
      preventDefault: false,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      obs.kill();
    };
  }, [filteredBooks.length, isModalOpen]);

  // GSAP 3D ENGINE
  useEffect(() => {
    if (!carouselRef.current || filteredBooks.length === 0) return;

    bookRefs.current.forEach((el, index) => {
      if (!el) return;

      const diff = index - activeIndex;
      const isCenter = diff === 0;

      const gap = 340;
      const stackSpace = 50;

      let xPos = 0;
      if (diff < 0) xPos = -gap + diff * stackSpace;
      if (diff > 0) xPos = gap + diff * stackSpace;

      gsap.to(el, {
        x: xPos,
        z: isCenter ? 250 : -300 - Math.abs(diff) * 60,
        rotateY: isCenter ? 0 : diff < 0 ? 80 : -80,
        scale: isCenter ? 1.25 : 0.8,
        opacity: Math.abs(diff) > 4 ? 0 : isCenter ? 1 : 0.4,
        zIndex: 100 - Math.abs(diff),
        duration: 0.8,
        ease: "expo.out",
      });
    });
  }, [activeIndex, filteredBooks]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-blue-400 font-mono text-[10px] uppercase tracking-widest">
          Accessing Vault Database...
        </p>
      </div>
    );
  }

  return (
    // REMOVED <AdminSidebar /> and the extra wrappers! The layout.tsx handles that now.
    <main className="p-4 md:p-12 relative z-10 overflow-hidden h-[calc(100vh-4rem)] md:h-screen text-slate-200">
      <div className="max-w-[1600px] mx-auto relative h-full flex flex-col">
        
        {/* FIXED RESPONSIVE HEADER: flex-col on mobile, flex-row on desktop */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-widest uppercase">
            Vault Inventory
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-50">
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search Title or ISBN..."
                value={searchQuery} // <-- Moved the state here!
                onChange={(e) => setSearchQuery(e.target.value)} // <-- Moved the logic here!
                className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold whitespace-nowrap"
            >
              Add Asset
            </button>
          </div>
        </header>


        {/* 3D Carousel Section */}
        <section className="relative flex-1 w-full flex items-center justify-center perspective-[2500px]">
          <div ref={carouselRef} className="relative w-full h-[40vh] md:h-[50vh] flex items-center justify-center transform-style-3d">
            {filteredBooks.map((book, index) => (
              <div
                key={book.id}
                ref={(el) => { bookRefs.current[index] = el; }}
                onClick={() => setActiveIndex(index)}
                className="absolute w-[200px] sm:w-[240px] md:w-[300px] aspect-[2/3] cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] border border-white/5 bg-slate-800 relative group">
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/30 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Book Info */}
        <div className="mt-4 md:mt-8 text-center relative z-50 pb-4 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif text-white mb-3 md:mb-4 tracking-tight drop-shadow-2xl px-4 line-clamp-2">
                {filteredBooks[activeIndex]?.title || "Asset Selected"}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.4em]">
                <span className="flex items-center gap-2"><User className="w-3 h-3" /> {filteredBooks[activeIndex]?.author}</span>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-blue-400 flex items-center gap-2 font-bold"><MapPin className="w-3 h-3" /> {filteredBooks[activeIndex]?.unity_location_id}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && <AddBookModal onClose={() => setIsModalOpen(false)} onAdd={loadBooks} />}
      </AnimatePresence>
    </main>
  );
}

// --- UPDATED MODAL COMPONENT ---

function AddBookModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: () => void;
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    cover_image_url: "",
    unity_location_id: "Rack_1_Shelf_1",
    category: "Engineering",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";

      // CALL YOUR BACKEND: POST /api/v1/books/add
      await fetchFromAPI("/api/v1/books/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      onAdd();
      onClose();
    } catch (error) {
      console.error("Initialization Failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-6xl bg-[#0F172A]/90 border border-white/10 rounded-[3.5rem] shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col lg:flex-row h-[90vh] lg:h-auto"
      >
        <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-serif text-white tracking-tight">
                Register Asset
              </h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">
                Append to Spatial Database
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Asset Title
                </label>
                <input
                  required
                  name="title"
                  onChange={handleChange}
                  placeholder="The Pragmatic Programmer"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <User className="w-3 h-3" /> Creator / Author
                </label>
                <input
                  required
                  name="author"
                  onChange={handleChange}
                  placeholder="David Thomas"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <Hash className="w-3 h-3" /> ISBN-13
                </label>
                <input
                  required
                  name="isbn"
                  onChange={handleChange}
                  placeholder="978-0135957059"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Core Category
                </label>
                <select
                  name="category"
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Fiction">Fiction</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Visual Cover URL
              </label>
              <input
                name="cover_image_url"
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Spatial Rack Assignment
              </label>
              <input
                name="unity_location_id"
                onChange={handleChange}
                placeholder="Rack_1_Shelf_1"
                className="w-full bg-blue-900/20 border border-blue-500/30 rounded-2xl px-6 py-4 text-sm font-mono text-blue-400 outline-none"
              />
            </div>

            <div className="pt-10 flex gap-6">
              <button
                type="button"
                onClick={onClose}
                className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="flex-1 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4"
              >
                {isSyncing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                {isSyncing ? "Syncing..." : "Initialize Sync"}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:w-[480px] bg-black/60 border-l border-white/5 p-12 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-slate-600 mb-14 relative z-10">
            Digital Twin Preview
          </span>

          <div className="relative z-10 transform perspective-1000 rotate-y-[-18deg] rotate-x-[8deg]">
            <div className="w-[260px] aspect-[2/3] bg-slate-900 rounded-2xl overflow-hidden shadow-[40px_40px_80px_-20px_rgba(0,0,0,0.9)] border border-white/10 relative">
              {formData.cover_image_url ? (
                <>
                  <img
                    src={formData.cover_image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 p-8 text-center bg-[#0A0F1C]">
                  <RotateCcw className="w-12 h-12 mb-6 animate-spin opacity-20" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40 leading-relaxed">
                    Awaiting Metadata Injection...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-14 text-center z-10 w-full max-w-[320px]">
            <h3 className="text-2xl font-serif text-white truncate">
              {formData.title || "Untitled Asset"}
            </h3>
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-3">
              {formData.author || "Unknown Creator"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
