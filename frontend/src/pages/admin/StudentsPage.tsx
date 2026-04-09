import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, ShieldAlert, CheckCircle2, MoreVertical } from "lucide-react";

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  active_issues: number;
  fines: number;
  status: "Active" | "Blocked";
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/v1/admin/students');
        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handlePhase2Feature = () => {
    alert("System Notice: This advanced management feature is slated to be implemented soon in Phase 2. Core functionalities are currently active.");
  };

  const filteredStudents = students.filter(student => 
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const handleClearFines = async (userId: string) => {
    // 1. INSTANT UI UPDATE: Change the screen before the server even responds
    setStudents((currentStudents) => 
      currentStudents.map((student) => 
        student.id === userId 
          ? { ...student, fines: 0, status: "Active" } 
          : student
      )
    );
    setOpenDropdownId(null); // Close the menu instantly

    // 2. BACKGROUND SYNC: Tell the database to actually do the work
    try {
      await api.post(`/api/v1/admin/students/${userId}/clear-fines`);
      // Re-fetch quietly in the background to ensure perfect sync
      const response = await api.get('/api/v1/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to clear fines:", error);
    }
  };
  
  const item: Variants = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center space-y-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="animate-pulse">Retrieving Student Records...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Student Directory</h1>
        <p className="text-slate-400 mt-1">Manage user access, active issues, and penalty records.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">All Registered Students</CardTitle>
          
          {/* Search Bar */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium text-center">Active Issues</th>
                  <th className="px-6 py-4 font-medium text-center">Fines Owed</th>
                  <th className="px-6 py-4 font-medium">Account Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show" className="divide-y divide-slate-800">
                {filteredStudents.map((student) => (
                  <motion.tr variants={item} key={student.id} className="hover:bg-slate-800/50 transition-colors group">
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold border border-blue-800/50">
                          {student.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{student.full_name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                        {student.active_issues} Books
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${student.fines > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        ${student.fines}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        student.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {student.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {student.status}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === student.id ? null : student.id)}
                        className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700 focus:outline-none"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* The Dropdown Menu */}
                      {openDropdownId === student.id && (
                        <div className="absolute right-10 top-10 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50 py-1">
                          <button 
                            onClick={() => handleClearFines(student.id)}
                            disabled={student.fines === 0}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            Clear Fines
                          </button>
                          <button 
                            onClick={handlePhase2Feature}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            View History
                          </button>
                        </div>
                      )}
                    </td>

                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
            
            {filteredStudents.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No students found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}