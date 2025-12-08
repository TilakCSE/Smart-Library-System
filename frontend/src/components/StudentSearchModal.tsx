import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, Loader2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInventoryStore } from "@/store/inventoryStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentSearchModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const { books, fetchBooks, isLoading } = useInventoryStore();
  const [query, setQuery] = useState("");

  // Fetch books when modal opens
  useEffect(() => {
    if (isOpen) fetchBooks();
  }, [isOpen]);

  const filtered = books.filter(b => 
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.author.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Darker for focus) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50"
          />

          {/* Modal Container - Perfectly Centered & Wider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, x: "-50%" }} // Add x: "-50%" to initial state for smoothness
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }} // Animate to true center
            exit={{ opacity: 0, scale: 0.95, y: 20, x: "-50%" }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-1/2 top-1/2 w-full max-w-2xl z-50 px-4" // Changed max-w-lg to max-w-2xl
            style={{ transform: "translate(-50%, -50%)" }} // Force CSS centering
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              
              {/* Header */}
              <div className="p-6 pb-4 border-b border-slate-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Library Navigation</h2>
                    <p className="text-slate-400 text-sm">Search for a book to initialize the Digital Twin agent.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-white rounded-full hover:bg-slate-800">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Big Search Bar */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      placeholder="Search by Title, Author, or ISBN..." 
                      className="pl-12 h-12 bg-slate-950 border-slate-700 text-white focus-visible:ring-blue-500 rounded-xl text-base shadow-inner"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-xs font-mono uppercase tracking-widest">Accessing Database...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 opacity-50">
                    <BookOpen className="w-16 h-16" />
                    <p className="text-sm">No books found matching "{query}"</p>
                  </div>
                ) : (
                  filtered.map((book) => (
                    <motion.div 
                      key={book.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => navigate(`/student/map?target=${book.unity_location_id}`)}
                    >
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Cover Image */}
                      <div className="w-12 h-16 rounded-md bg-slate-800 overflow-hidden flex-shrink-0 shadow-lg border border-slate-700 group-hover:border-slate-500 transition-colors z-10">
                        {book.cover_image_url ? (
                           <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-800">
                             <BookOpen className="w-6 h-6 text-slate-600" />
                           </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0 z-10">
                        <div className="flex justify-between items-start">
                           <h4 className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors text-lg">
                             {book.title}
                           </h4>
                           {book.status === 'In Stock' && (
                             <span className="text-[10px] text-green-400 bg-green-900/20 px-2 py-0.5 rounded-full border border-green-900/50">
                               Available
                             </span>
                           )}
                        </div>
                        <p className="text-slate-400 text-sm truncate">{book.author}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                           <span className="text-[10px] font-mono bg-slate-950 text-blue-300 px-2 py-1 rounded border border-blue-900/30">
                             LOC: {book.unity_location_id}
                           </span>
                        </div>
                      </div>

                      {/* Action Icon */}
                      <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all z-10 shadow-lg group-hover:scale-110">
                        <MapPin className="w-5 h-5" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}