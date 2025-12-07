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

  // Fetch books when modal opens (if not already loaded)
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              
              {/* Header */}
              <div className="p-6 pb-2">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Library Navigation</h2>
                    <p className="text-slate-400 text-xs">Search for a book to start the 3D Agent.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input 
                    placeholder="Search by Title, Author..." 
                    className="pl-10 h-12 bg-slate-950/50 border-slate-700 text-white focus-visible:ring-blue-500 rounded-xl"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2 custom-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No books found matching "{query}"</p>
                  </div>
                ) : (
                  filtered.map((book) => (
                    <motion.div 
                      key={book.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
                      onClick={() => navigate(`/student/map?target=${book.unity_location_id}`)}
                    >
                      {/* Cover Image */}
                      <div className="w-12 h-16 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                        <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-slate-500 text-xs truncate">{book.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                             {book.unity_location_id}
                           </span>
                           {book.status === 'In Stock' && (
                             <span className="text-[10px] text-green-500">Available</span>
                           )}
                        </div>
                      </div>

                      {/* Action Icon */}
                      <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <MapPin className="w-4 h-4" />
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