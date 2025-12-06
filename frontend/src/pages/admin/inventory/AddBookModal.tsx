import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Sparkles, ScanLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookCard from "./BookCard";
import { useInventoryStore } from "@/store/inventoryStore";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const addBook = useInventoryStore((state) => state.addBook);
  
  // UPDATED STATE to match "Book" interface
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    cover_image_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop",
    category: "Computer Science",
    unity_location_id: "Rack_A_Shelf_1",
    totalCopies: 1,
    availableCopies: 1,
    status: 'In Stock' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBook({
      // We don't need to pass ID, database handles it
      ...formData
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl pointer-events-auto p-4"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
                
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative bg-slate-900/50">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <ScanLine className="text-blue-500 w-5 h-5" /> Asset Ingestion
                        </h2>
                        <p className="text-slate-500 text-xs">Register physical media metadata.</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    <form id="add-book-form" onSubmit={handleSubmit} className="space-y-4">
                      {/* Title & Author Inputs (Same as before) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Book Title</label>
                        <Input 
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="e.g. The Pragmatic Programmer"
                          className="bg-slate-950 border-slate-700 text-white focus-visible:ring-blue-500 h-10"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Author</label>
                          <Input 
                            value={formData.author}
                            onChange={(e) => setFormData({...formData, author: e.target.value})}
                            className="bg-slate-950 border-slate-700 text-white h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Category</label>
                           <select 
                              className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              value={formData.category}
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                           >
                              <option>Computer Science</option>
                              <option>Fiction</option>
                              <option>Physics</option>
                           </select>
                        </div>
                      </div>

                      {/* UPDATED: Cover Image Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Cover Image URL</label>
                        <div className="flex gap-2">
                          <Input 
                            value={formData.cover_image_url}
                            onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})}
                            className="bg-slate-950 border-slate-700 text-white font-mono text-xs h-10"
                          />
                          <Button type="button" size="icon" variant="outline" className="border-slate-700 bg-slate-800 text-slate-400 h-10 w-10">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                        {/* UPDATED: Unity Location Input */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Unity Location</label>
                          <Input 
                            value={formData.unity_location_id}
                            onChange={(e) => setFormData({...formData, unity_location_id: e.target.value})}
                            className="bg-slate-900 border-slate-700 text-white font-mono text-xs h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-green-400 uppercase tracking-wider">ISBN / RFID</label>
                          <Input 
                            value={formData.isbn}
                            onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                            className="bg-slate-900 border-slate-700 text-white font-mono text-xs h-9"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* RIGHT: Live Preview */}
                <div className="w-full md:w-[320px] bg-slate-950 border-l border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px]"></div>
                  
                  <div className="relative z-10 w-full space-y-6">
                    <div className="text-center space-y-1">
                      <Badge variant="outline" className="border-blue-500/50 text-blue-400 animate-pulse text-[10px]">LIVE PREVIEW</Badge>
                    </div>

                    <div className="transform scale-90 md:scale-100 transition-all duration-500 origin-center">
                      {/* No more red lines here because BookCard accepts this data now */}
                      <BookCard book={{id: "preview", ...formData}} />
                    </div>

                    <div className="w-full pt-4">
                       <Button 
                          type="submit" 
                          form="add-book-form"
                          className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 font-bold tracking-wide text-sm"
                       >
                          <Sparkles className="w-4 h-4 mr-2" /> 
                          INITIALIZE
                       </Button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}