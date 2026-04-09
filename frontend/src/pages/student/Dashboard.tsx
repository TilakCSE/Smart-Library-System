import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import DigitalID from "./DigitalID";
import MobileNav from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, AlertTriangle, ArrowRight, MapPin, LogOut, Loader2 } from "lucide-react"; // Restored Loader2
import StudentSearchModal from "@/components/StudentSearchModal";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Restored useNavigate

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate(); 
  
  // Geofence & Location State
  const [isLocating] = useState(false);
  const [locationError] = useState("");
  const [greeting, setGreeting] = useState("Good Morning");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0); // For God Mode

  // Database Analytics State
  interface DashboardData {
    full_name: string;
    issued: number;
    fines: number;
    due_text: string;
    activity: { title: string; desc: string; status: string }[];
  }
  const [dbData, setDbData] = useState<DashboardData>({
    full_name: "",
    issued: 0,
    fines: 0,
    due_text: "-",
    activity: []
  });

  // Dynamic Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Fetch Live Database Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.email) {
        try {
          const response = await api.get(`/api/v1/users/me/${user.email}/dashboard`);
          setDbData(response.data);
        } catch (error) {
          console.error("Failed to fetch DB profile", error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  // Framer Motion Variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigate("/login"); 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // God Mode Secret Tap Handler
  const handleSecretTap = () => {
    setTapCount(prev => prev + 1);
    if (tapCount >= 4) {
      alert("🔐 GOD MODE UNLOCKED: Geofence restrictions bypassed.");
      // Trigger your bypass logic in the store if needed
      setTapCount(0);
    }
  };

  // Geofenced Map Launch
  const handleMapLaunch = async () => {
    // If you have an async verifyLocation in your store, call it here.
    // For now, we will open the modal directly.
    setIsSearchOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative overflow-x-hidden selection:bg-blue-500/20">
      
      <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 rounded-b-[40px] z-0 overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
         <div className="absolute -left-10 top-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 px-6 pt-8 max-w-md mx-auto lg:max-w-4xl">
        
        {/* Header Section */}
        <motion.div variants={item} className="flex justify-between items-center mb-6 text-white">
          <div>
            <p className="text-blue-200 text-sm font-medium tracking-wide">{greeting}</p>
            <h1 className="text-2xl font-bold tracking-tight capitalize">
              {dbData.full_name || user?.email?.split('@')[0] || "Student"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Secret God Mode Trigger */}
            <div 
              onClick={handleSecretTap}
              className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
            >
              <span className="text-lg">🎓</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* The Digital ID Card */}
        <div className="mb-8 perspective-1000">
          <DigitalID realName={dbData.full_name} />
        </div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3 mb-8">
          <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white overflow-hidden relative group">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <BookOpen className="w-5 h-5 text-blue-500 mb-2" />
                <span className="text-2xl font-bold text-slate-900">{dbData.issued}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Issued</span>
             </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white overflow-hidden relative group">
             <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Clock className="w-5 h-5 text-orange-500 mb-2" />
                <span className="text-2xl font-bold text-slate-900">{dbData.due_text}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Due In</span>
             </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white overflow-hidden relative group">
             <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mb-2" />
                <span className="text-2xl font-bold text-slate-900">${dbData.fines}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fines</span>
             </CardContent>
          </Card>
        </motion.div>

        {/* Location Error Warning (If Geofence fails) */}
        {locationError && (
          <motion.div variants={item} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3">
             <AlertTriangle className="w-5 h-5 flex-shrink-0" />
             <p>{locationError}</p>
          </motion.div>
        )}

        {/* The Action Button - 3D Map */}
        <motion.div variants={item} className="mb-8">
          <button 
            onClick={handleMapLaunch} 
            disabled={isLocating}
            className="w-full group relative overflow-hidden rounded-2xl bg-slate-900 p-1 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-20 group-hover:opacity-40 transition-opacity animate-shimmer bg-[length:200%_100%]"></div>
            <div className="relative flex items-center justify-between rounded-xl bg-slate-950 px-6 py-5 transition-transform active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-white group-hover:bg-blue-500 transition-colors">
                  {isLocating ? <Loader2 className="w-6 h-6 animate-spin" /> : <MapPin className="w-6 h-6" />}
                </div>
                <div className="text-left">
                   <h3 className="text-lg font-bold text-white">Launch 3D Map</h3>
                   <p className="text-sm text-slate-400">
                     {isLocating ? "Verifying coordinates..." : "Navigate the library in real-time"}
                   </p>
                </div>
              </div>
              <ArrowRight className="text-slate-500 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </div>
          </button>
        </motion.div>

        {/* Recent Activity List */}
        <motion.div variants={item}>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          </div>
          
          <div className="space-y-3">
             {dbData.activity.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                   <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                     <BookOpen className="w-5 h-5 text-slate-600" />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                   </div>
                   <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                     item.status === 'Completed' ? 'text-green-600 bg-green-50' : 
                     item.status === 'Overdue' ? 'text-red-600 bg-red-50' : 
                     'text-blue-600 bg-blue-50'
                   }`}>
                     {item.status}
                   </span>
                </div>
             ))}
             {dbData.activity.length === 0 && (
               <div className="text-center p-4 text-sm text-slate-500 border border-dashed rounded-xl border-slate-200">
                 No recent library activity.
               </div>
             )}
          </div>
        </motion.div>

      </motion.div>

      <StudentSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      <MobileNav />
    </div>
  );
}