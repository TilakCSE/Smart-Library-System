import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-3xl space-y-8 animate-in fade-in zoom-in duration-700">
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
          Smart <span className="text-blue-600">Library</span> System
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Experience the next generation of library management with 3D Navigation, IoT Gate Access, and Real-Time Book Tracking.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {/* Button to Student Login */}
          <Link to="/login">
            <Button size="lg" className="w-48 h-12 text-lg shadow-xl shadow-blue-200/50">
              Web Portal
            </Button>
          </Link>
          
          {/* Mock Button for Admin */}
          <Link to="/admin">
             <Button variant="outline" size="lg" className="w-48 h-12 text-lg">
               Admin Dashboard
             </Button>
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Download the Mobile App</p>
          <Button variant="secondary" className="gap-2">
            Download .APK (v1.0)
          </Button>
        </div>
      </div>
    </div>
  );
}