import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core"; // Import Capacitor

export default function Landing() {
  const navigate = useNavigate();

  // 1. AUTO-REDIRECT FOR MOBILE APP
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // If we are an App, skip landing and go to login
      navigate("/login");
    }
  }, [navigate]);

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
          <Link to="/login">
            <Button size="lg" className="w-48 h-12 text-lg shadow-xl shadow-blue-200/50">
              Web Portal
            </Button>
          </Link>
          
          <Link to="/admin/dashboard">
             <Button variant="outline" size="lg" className="w-48 h-12 text-lg">
               Admin Dashboard
             </Button>
          </Link>
        </div>
        
        {/* Only show Download button if on Web (Not in App) */}
        {!Capacitor.isNativePlatform() && (
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Download the Mobile App</p>
            <a href="/SmartLibrary.apk" download>
              <Button variant="secondary" className="gap-2">
                Download .APK (v1.0)
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}