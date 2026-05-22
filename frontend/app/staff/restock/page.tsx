"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, CheckCircle2, Loader2, Minus, Plus, Library } from "lucide-react";
import { fetchFromAPI } from "@/lib/api";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_image_url: string;
  unity_location_id: string;
}

export default function RestockPortal() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [rackNum, setRackNum] = useState(1);
  const [shelfNum, setShelfNum] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch all books on load
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchFromAPI("/api/v1/books/");
        setBooks(data);
      } catch (err) {
        console.error("Failed to fetch books", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, []);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setSuccessMsg("");
    
    // Parse current location if it exists (e.g., "Rack_1_Shelf_12")
    if (book.unity_location_id) {
      const parts = book.unity_location_id.split("_");
      if (parts.length === 4) {
        setRackNum(parseInt(parts[1]) || 1);
        setShelfNum(parseInt(parts[3]) || 1);
      }
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedBook) return;
    setIsUpdating(true);
    
    const newLocation = `Rack_${rackNum}_Shelf_${shelfNum}`;

    try {
      await fetchFromAPI(`/api/v1/books/${selectedBook.id}/update-location`, {
        method: "PUT",
        body: JSON.stringify({ unity_location_id: newLocation })
      });
      
      // Update local state
      setBooks(books.map(b => b.id === selectedBook.id ? { ...b, unity_location_id: newLocation } : b));
      setSuccessMsg("Location Updated!");
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setSelectedBook(null);
        setSuccessMsg("");
      }, 2000);

    } catch (err) {
      alert("Failed to update location. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 font-sans pb-24">
      
      {/* Massive Mobile Header */}
      <header className="bg-blue-600 text-white p-6 shadow-md rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Library className="w-8 h-8 opacity-80" />
          <h1 className="text-2xl font-black tracking-tight">Staff Restock</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-300" />
          <input 
            type="text" 
            placeholder="Search book title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-stone-900 rounded-2xl py-4 pl-14 pr-4 text-lg font-bold shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-400/50"
          />
        </div>
      </header>

      {/* Book List - Huge tap targets */}
      <div className="p-4 space-y-4 mt-2">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>
        ) : (
          filteredBooks.map((book) => (
            <div 
              key={book.id} 
              onClick={() => handleSelectBook(book)}
              className="bg-white p-4 rounded-3xl shadow-sm border border-stone-200 flex items-center gap-4 active:scale-95 transition-transform"
            >
              <div className="w-16 h-20 bg-stone-200 rounded-lg overflow-hidden shrink-0">
                <img src={book.cover_image_url} alt="cover" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg leading-tight line-clamp-2">{book.title}</h3>
                <p className="text-stone-500 text-sm font-medium line-clamp-1">{book.author}</p>
                <div className="flex items-center gap-1 mt-2 text-blue-600 bg-blue-50 w-max px-2 py-1 rounded-md">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{book.unity_location_id.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sliding Update Drawer */}
      <AnimatePresence>
        {selectedBook && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="fixed inset-0 bg-stone-900/60 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[2.5rem] z-50 p-6 pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.2)]"
            >
              <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-6" />
              
              <h2 className="text-2xl font-black text-center mb-1 line-clamp-1">{selectedBook.title}</h2>
              <p className="text-center text-stone-500 font-medium mb-8">Set New Location</p>

              {successMsg ? (
                <div className="bg-emerald-100 border-2 border-emerald-500 rounded-3xl p-8 flex flex-col items-center justify-center text-emerald-700 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="text-2xl font-black">{successMsg}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Rack Selector */}
                  <div className="bg-stone-50 rounded-3xl p-4 flex items-center justify-between border-2 border-stone-100">
                    <span className="text-lg font-bold text-stone-400 pl-4 uppercase tracking-widest">Rack</span>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button onClick={() => setRackNum(Math.max(1, rackNum - 1))} className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center active:bg-stone-200 text-stone-600"><Minus className="w-6 h-6" /></button>
                      <input 
                        type="number" 
                        min="1"
                        value={rackNum || ""}
                        onChange={(e) => setRackNum(parseInt(e.target.value) || 0)}
                        onBlur={() => setRackNum(Math.max(1, rackNum))}
                        className="text-3xl font-black w-16 text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-xl appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button onClick={() => setRackNum(rackNum + 1)} className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center active:bg-stone-200 text-stone-600"><Plus className="w-6 h-6" /></button>
                    </div>
                  </div>

                  {/* Shelf Selector */}
                  <div className="bg-stone-50 rounded-3xl p-4 flex items-center justify-between border-2 border-stone-100">
                    <span className="text-lg font-bold text-stone-400 pl-4 uppercase tracking-widest">Shelf</span>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button onClick={() => setShelfNum(Math.max(1, shelfNum - 1))} className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center active:bg-stone-200 text-stone-600"><Minus className="w-6 h-6" /></button>
                      <input 
                        type="number" 
                        min="1"
                        value={shelfNum || ""}
                        onChange={(e) => setShelfNum(parseInt(e.target.value) || 0)}
                        onBlur={() => setShelfNum(Math.max(1, shelfNum))}
                        className="text-3xl font-black w-16 text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-xl appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button onClick={() => setShelfNum(shelfNum + 1)} className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center active:bg-stone-200 text-stone-600"><Plus className="w-6 h-6" /></button>
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdateLocation}
                    disabled={isUpdating}
                    className="w-full bg-blue-600 text-white rounded-3xl py-5 text-xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Placement"}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}