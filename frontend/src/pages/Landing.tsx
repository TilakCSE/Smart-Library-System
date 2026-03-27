import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ScanFace, Fingerprint, ShieldAlert, Hexagon, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
      
      {/* Background Matrix/Grid Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center">
        
        {/* Top Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-8 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          NAVRACHNA UNIVERSITY • DIGITAL TWIN V2.0
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4">
            Library<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Vault</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg md:text-xl font-light">
            Next-generation physical asset tracking and 3D spatial navigation.
          </p>
        </motion.div>

        {/* The Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 w-full max-w-3xl">
          
          {/* Card 1: Student Portal */}
          <motion.button
            onClick={() => navigate('/login')}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl overflow-hidden text-left hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <ScanFace className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Student Access</h3>
              <p className="text-slate-400 text-sm mb-6">Access your digital NFC pass, view issued assets, and launch the 3D map.</p>
              <div className="flex items-center text-blue-400 text-sm font-semibold tracking-wide">
                INITIALIZE LINK <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Card 2: Admin Command Center */}
          <motion.button
            onClick={() => navigate('/admin/dashboard')}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl overflow-hidden text-left hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Mission Control</h3>
              <p className="text-slate-400 text-sm mb-6">Manage the digital vault, monitor live foot traffic, and sync 3D mappings.</p>
              <div className="flex items-center text-purple-400 text-sm font-semibold tracking-wide">
                AUTHENTICATE <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.button>

        </div>

        {/* Bottom Tech Stack Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex items-center gap-4 text-slate-600 text-xs font-mono"
        >
          <Fingerprint className="w-4 h-4" /> SECURE CONNECTION ESTABLISHED
          <Hexagon className="w-4 h-4 ml-4" /> V 2.0.0
        </motion.div>

      </div>
    </div>
  );
}