import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInventoryStore } from "@/store/inventoryStore";
import BookCard from "./BookCard";
import AddBookModal from "./AddBookModal"; // The new holographic modal
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, SlidersHorizontal } from "lucide-react";

export default function InventoryPage() {
  const books = useInventoryStore((state) => state.books);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal

  // Filter books based on search query
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(search.toLowerCase()) || 
    book.author.toLowerCase().includes(search.toLowerCase()) ||
    book.isbn.includes(search)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Digital Vault</h1>
          <p className="text-slate-400">Manage physical assets and 3D mappings.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-700 bg-slate-900/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-blue-500/50 transition-all">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          
          {/* The Trigger Button */}
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Asset
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-500" />
        </div>
        <Input 
          placeholder="Search by Title, Author, or ISBN..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all rounded-xl"
        />
        <div className="absolute inset-y-0 right-3 flex items-center">
            <span className="text-xs text-slate-600 font-mono border border-slate-700 px-2 py-1 rounded">
                {filteredBooks.length} ITEMS
            </span>
        </div>
      </div>

      {/* The Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </AnimatePresence>
        
        {/* Empty State */}
        {filteredBooks.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="col-span-full py-20 text-center"
            >
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SlidersHorizontal className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-white font-medium">No assets found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your search query.</p>
            </motion.div>
        )}
      </div>

      {/* The Holographic Modal Component */}
      <AddBookModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
}