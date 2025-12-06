import { motion } from "framer-motion";
import type { Book } from "@/store/inventoryStore"; // Fixes "Book is a type" error
import { MapPin, Layers } from "lucide-react";
// Removed unused Badge/AlertCircle imports to clean up warnings

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  
  const statusColor = 
    book.status === 'In Stock' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
    book.status === 'Low Stock' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
    'bg-red-500/20 text-red-400 border-red-500/50';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-colors duration-300"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 blur transition duration-500"></div>

      <div className="relative p-4 flex gap-4">
        {/* UPDATED: cover -> cover_image_url */}
        <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{book.category}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColor}`}>
                {book.status}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-white mt-1 leading-tight group-hover:text-blue-400 transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-slate-400">{book.author}</p>
          </div>

          <div className="space-y-2 mt-3">
            {/* UPDATED: rackLocation -> unity_location_id */}
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/50 p-1.5 rounded-md border border-slate-700/50">
              <MapPin className="w-3 h-3 text-purple-400" />
              <span className="font-mono">{book.unity_location_id?.replace(/_/g, ' ') || 'Unassigned'}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>{book.availableCopies} / {book.totalCopies} Available</span>
              </div>
              <span className="font-mono opacity-50">ISBN: {book.isbn.slice(-4)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
         <p className="text-[10px] text-blue-300 font-medium">CLICK TO MANAGE</p>
      </div>
    </motion.div>
  );
}