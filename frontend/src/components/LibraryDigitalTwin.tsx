import { useEffect, useRef } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const canvasStyle = {
  width: "100%",
  height: "100%",
  background: "#020617",
  touchAction: "auto", 
};

interface Props {
  targetLocation?: string | null;
}

export default function LibraryDigitalTwin({ targetLocation }: Props) {
  const navigate = useNavigate();
  const hasSentCommand = useRef(false);

  const { unityProvider, sendMessage, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/unity-build/Library_WebGL_Build.loader.js",
    dataUrl: "/unity-build/Library_WebGL_Build.data",
    frameworkUrl: "/unity-build/Library_WebGL_Build.framework.js",
    codeUrl: "/unity-build/Library_WebGL_Build.wasm",
  });

  useEffect(() => {
    hasSentCommand.current = false;
  }, [targetLocation]);

  useEffect(() => {
    if (isLoaded && targetLocation && !hasSentCommand.current) {
      const timer = setTimeout(() => {
        console.log("Sending Unity Command: GoToLocation ->", targetLocation);
        sendMessage("LibraryManager", "GoToLocation", targetLocation);
        hasSentCommand.current = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, targetLocation, sendMessage]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden">
      
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="pointer-events-auto bg-slate-900/50 backdrop-blur-md border-slate-700 text-white hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {targetLocation && (
          <div className="bg-blue-600/80 backdrop-blur-md border border-blue-500/50 px-4 py-2 rounded-xl text-white text-xs font-mono shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-in slide-in-from-top-4 pointer-events-auto">
            TARGET: {targetLocation.replace(/_/g, ' ')}
          </div>
        )}
      </div>

      {/* NEW: Interaction Prompt Overlay (Only shows when loaded and has target) */}
      {isLoaded && targetLocation && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-bounce">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            {/* Desktop View */}
            <p className="hidden sm:block text-slate-300 text-sm font-mono tracking-widest text-center">
              PRESS <kbd className="bg-slate-800 border border-slate-600 px-2 py-1 rounded-md text-blue-400 font-bold mx-1 shadow-inner">SPACE</kbd> TO MOVE AGENT
            </p>
            {/* Mobile View */}
            <p className="block sm:hidden text-slate-300 text-sm font-mono tracking-widest text-center">
              TAP ANYWHERE TO MOVE AGENT
            </p>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-20">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-6" />
          <p className="text-sm font-mono tracking-widest text-blue-400 animate-pulse">
            INITIALIZING DIGITAL TWIN...
          </p>
          <div className="w-64 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
            <div 
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.8)] transition-all duration-300" 
              style={{ width: `${loadingProgression * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* The Unity Canvas */}
      <Unity unityProvider={unityProvider} style={canvasStyle} className="object-cover" />
    </div>
  );
}