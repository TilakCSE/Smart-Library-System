import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BookOpen, AlertCircle, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const location = useLocation();

  const SidebarItem = ({ icon: Icon, label, path }: any) => {
    const isActive = location.pathname === path;
    return (
      <Link to={path}>
        <div className={cn(
          "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden",
          isActive ? "bg-blue-600/10 text-blue-400" : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
        )}>
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-blue-600/10 border-l-2 border-blue-500"
              initial={false}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          )}
          <Icon className={cn("w-5 h-5 z-10", isActive && "fill-current")} />
          <span className="font-medium z-10">{label}</span>
          
          {/* Hover Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <div className="w-64 border-r border-slate-800 p-6 flex flex-col justify-between hidden lg:flex bg-slate-950/50 backdrop-blur-xl fixed h-full z-50">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Admin<span className="text-blue-500">Panel</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Command Center</p>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Overview" path="/admin/dashboard" />
            <SidebarItem icon={Users} label="Students" path="/admin/students" />
            <SidebarItem icon={BookOpen} label="Inventory" path="/admin/inventory" />
            <SidebarItem icon={AlertCircle} label="Fines & Logs" path="/admin/fines" />
          </nav>
        </div>

        <div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 mb-4">
            <p className="text-xs text-slate-400 mb-2">System Health</p>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-sm font-bold text-green-400">98.9% Online</span>
            </div>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-64 p-8 relative overflow-hidden">
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         </div>
         
         <Outlet />
      </div>
    </div>
  );
}