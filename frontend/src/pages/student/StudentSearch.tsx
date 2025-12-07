import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ChevronRight } from "lucide-react";
import { useInventoryStore } from "@/store/inventoryStore"; // Reusing the store!

export default function StudentSearch() {
  const navigate = useNavigate();
  const books = useInventoryStore((state) => state.books);
  const [query, setQuery] = useState("");

  const filtered = books.filter(b => 
    b.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Find a Book</h1>
          <p className="text-slate-500 text-sm">Search the physical inventory</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search title, author..." 
            className="pl-10 h-12 bg-white shadow-sm border-slate-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {filtered.map((book) => (
            <motion.div 
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4"
            >
              <img src={book.cover_image_url} className="w-16 h-24 object-cover rounded-md shadow-sm" />
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{book.title}</h3>
                  <p className="text-xs text-slate-500">{book.author}</p>
                </div>

                <div className="flex justify-between items-end mt-2">
                  <div className="bg-slate-100 px-2 py-1 rounded text-[10px] font-mono text-slate-600">
                    {book.unity_location_id.replace(/_/g, ' ')}
                  </div>
                  
                  {/* THE MAGIC BUTTON */}
                  <Button 
                    size="sm" 
                    className="h-8 bg-blue-600 hover:bg-blue-500 text-xs"
                    onClick={() => navigate(`/student/map?target=${book.unity_location_id}`)}
                  >
                    <MapPin className="w-3 h-3 mr-1" /> Locate
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}