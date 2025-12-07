import { useEffect, useRef } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// STYLE: Full Screen Mobile style
const canvasStyle = {
  width: "100%",
  height: "100%",
  background: "#0f172a", // Match slate-900
};


interface Props {
  targetLocation?: string; // e.g. "Rack_A_Shelf_1"
}

export default function LibraryDigitalTwin({ targetLocation }: Props) {
  const navigate = useNavigate();
  const hasSentCommand = useRef(false);

  // 1. Configure Unity
  const { unityProvider, sendMessage, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/unity-build/UnityBuild_v2.loader.js",
    dataUrl: "/unity-build/UnityBuild_v2.data",
    frameworkUrl: "/unity-build/UnityBuild_v2.framework.js",
    codeUrl: "/unity-build/UnityBuild_v2.wasm",
  });

  // 2. Send Command ONLY when Unity is ready
  useEffect(() => {
    if (isLoaded && targetLocation && !hasSentCommand.current) {
      // Small delay to ensure the scene scripts are awake
      const timer = setTimeout(() => {
        console.log("Sending Unity Command: GoToLocation ->", targetLocation);
        sendMessage("LibraryManager", "GoToLocation", targetLocation);
        hasSentCommand.current = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, targetLocation, sendMessage]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="pointer-events-auto bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {targetLocation && (
          <div className="bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold shadow-lg animate-in slide-in-from-top-4">
            NAVIGATING TO: {targetLocation.replace(/_/g, ' ')}
          </div>
        )}
      </div>

      {/* Loading Screen */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-0">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
          <p className="text-sm font-mono text-blue-200">INITIALIZING 3D TWIN...</p>
          
          {/* Progress Bar */}
          <div className="w-64 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300" 
              style={{ width: `${loadingProgression * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* The Unity Canvas */}
      <Unity unityProvider={unityProvider} style={canvasStyle} />
    </div>
  );
}