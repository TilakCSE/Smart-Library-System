import { useNavigate } from "react-router-dom";
import { ScanFace, Fingerprint, Hexagon, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        
        {/* Header/Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-blue-300 uppercase tracking-widest">
              Navrachana University • Digital Twin V2.0
            </span>
          </div>
          
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 flex items-center justify-center gap-1">
            Library<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Vault</span>
          </h1>
          <p className="text-slate-400 text-sm font-light tracking-wide">
            Next-generation physical asset tracking and 3D spatial navigation.
          </p>
        </div>

        {/* Centered Action Card */}
        <div className="w-full">
          <div 
            onClick={() => navigate('/login')}
            className="group cursor-pointer bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-blue-500/50 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-950/50 flex items-center justify-center mb-6 border border-blue-900/50 group-hover:bg-blue-900/50 transition-colors">
              <ScanFace className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Student Access</h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Access your digital NFC pass, view issued assets, and launch the 3D map.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest group-hover:text-blue-300 transition-colors">
              Initialize Link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center justify-center gap-6 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4" /> Secure Connection Established
          </div>
          <div className="flex items-center gap-2">
            <Hexagon className="w-4 h-4" /> V 2.0.0
          </div>
        </div>

      </div>
    </div>
  );
}