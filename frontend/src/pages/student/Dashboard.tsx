import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useStudentStore } from "@/store/studentStore";
import DigitalID from "./DigitalID";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, AlertTriangle, ArrowRight, MapPin, Loader2 } from "lucide-react";
import StudentSearchModal from "@/components/StudentSearchModal";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const { transactions, fetchTransactions, isLoading } = useStudentStore();
  const [greeting, setGreeting] = useState("Good Morning");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Only redirect if auth is fully initialized AND there's no user
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (user?.email) {
      fetchTransactions(user.email);
    }
  }, [fetchTransactions, user?.email]);

  // Dynamic Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Fetch the transactions on mount using the real authenticated user
  useEffect(() => {
    if (user?.email) {
      fetchTransactions(user.email);
    }
  }, [fetchTransactions, user?.email]);

  // --- DATA CALCULATIONS ---
  const activeBooks = transactions.filter(t => t.status === 'active' || t.status === 'overdue');
  const pastBooks = transactions.filter(t => t.status === 'completed');
  const overdueCount = activeBooks.filter(t => t.status === 'overdue').length;
  
  // Find nearest due date
  const nearestDueDate = activeBooks.length > 0 
    ? new Date(Math.min(...activeBooks.map(t => new Date(t.due_date).getTime())))
    : null;
    
  const daysUntilDue = nearestDueDate 
    ? Math.ceil((nearestDueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : 0;

  // --- ANIMATIONS ---
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative overflow-x-hidden selection:bg-blue-500/20">

      {/* Auth Loading State */}
      {isAuthLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">Restoring Your Session</p>
              <p className="text-sm text-slate-500">Authenticating with Firebase...</p>
            </div>
          </div>
        </div>
      )}

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 rounded-b-[40px] z-0 overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
         <div className="absolute -left-10 top-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Content Container */}
      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 px-6 pt-8 max-w-md mx-auto lg:max-w-4xl">
        
        {/* Header Section */}
        <motion.div variants={item} className="flex justify-between items-center mb-6 text-white">
          <div>
            <p className="text-blue-200 text-sm font-medium tracking-wide">{greeting}</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {user?.email?.split('@')[0] || "Demo Student"}
            </h1>
          </div>
          <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <span className="text-lg">🎓</span>
          </div>
        </motion.div>

        {/* The Digital ID Card */}
        <div className="mb-8 perspective-1000">
          <DigitalID />
        </div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3 mb-8">
          <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white overflow-hidden relative group">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <BookOpen className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-bold text-slate-900">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin my-1.5" /> : activeBooks.length}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Issued</span>
             </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white overflow-hidden relative group">
             <div className={`absolute top-0 left-0 w-1 h-full ${daysUntilDue < 0 ? 'bg-red-500' : 'bg-orange-500'}`}></div>
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Clock className={`w-5 h-5 mb-2 group-hover:scale-110 transition-transform ${daysUntilDue < 0 ? 'text-red-500' : 'text-orange-500'}`} />
                <span className={`text-2xl font-bold ${daysUntilDue < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin my-1.5" /> : activeBooks.length === 0 ? '-' : daysUntilDue < 0 ? 'Late' : `${daysUntilDue}d`}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Due In</span>
             </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white overflow-hidden relative group">
             <div className={`absolute top-0 left-0 w-1 h-full ${overdueCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <AlertTriangle className={`w-5 h-5 mb-2 group-hover:scale-110 transition-transform ${overdueCount > 0 ? 'text-red-500' : 'text-green-500'}`} />
                <span className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin my-1.5" /> : `$${overdueCount * 5}`}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fines</span>
             </CardContent>
          </Card>
        </motion.div>

        {/* The "Crazy" Action Button - 3D Map */}
        <motion.div variants={item} className="mb-8">
          <button onClick={() => setIsSearchOpen(true)} className="w-full group relative overflow-hidden rounded-2xl bg-slate-900 p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-20 group-hover:opacity-40 transition-opacity animate-shimmer bg-[length:200%_100%]"></div>
            <div className="relative flex items-center justify-between rounded-xl bg-slate-950 px-6 py-5 transition-transform active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-white group-hover:bg-blue-500 transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-left">
                   <h3 className="text-lg font-bold text-white">Launch 3D Map</h3>
                   <p className="text-sm text-slate-400">Navigate the library in real-time</p>
                </div>
              </div>
              <ArrowRight className="text-slate-500 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </div>
          </button>
        </motion.div>

        {/* NEW: Currently Issued Section */}
        {!isLoading && activeBooks.length > 0 && (
          <motion.div variants={item} className="mb-8">
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="text-lg font-bold text-slate-900">Currently Issued</h2>
            </div>
            <div className="space-y-3">
              {activeBooks.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
                  <div className={`absolute left-0 top-0 w-1 h-full ${tx.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                  <div className="w-12 h-16 bg-slate-200 rounded-md overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
                    <img src={tx.cover_image_url} alt={tx.book_title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{tx.book_title}</h4>
                    <p className={`text-xs ${tx.status === 'overdue' ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                      Due: {new Date(tx.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${
                    tx.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Activity List */}
        <motion.div variants={item}>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            {!isLoading && pastBooks.length > 0 && (
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">View All</Button>
            )}
          </div>
          
          <div className="space-y-3">
             {isLoading ? (
               <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                 <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                 <div>
                   <p className="text-sm font-bold text-slate-700">Connecting to Digital Vault...</p>
                   <p className="text-xs text-slate-500">Waking up cloud servers. This may take up to 50 seconds.</p>
                 </div>
               </div>
             ) : pastBooks.length === 0 ? (
               <p className="text-sm text-slate-500 px-2">No recent activity.</p>
             ) : pastBooks.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                   <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                     <BookOpen className="w-5 h-5 text-slate-600" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{tx.book_title}</h4>
                      <p className="text-xs text-slate-500">Returned successfully</p>
                   </div>
                   <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Completed
                   </span>
                </div>
             ))}
          </div>
        </motion.div>

      </motion.div>

      <StudentSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileNav />
    </div>
  );
}