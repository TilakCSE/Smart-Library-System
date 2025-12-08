import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function StudentLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Get the Secure Token
      const token = await user.getIdToken();

      // 3. Save User to Global Store
      setUser({
        uid: user.uid,
        email: user.email,
        accessToken: token,
      });

      console.log("Login Success! Token:", token);

      // 4. Navigate to the Student Dashboard
      navigate("/student/dashboard");

    } catch (err: any) {
      console.error("Login Error:", err);
      // specific error handling for better UX
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Connection failed. Please check your internet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex overflow-hidden bg-slate-50 font-sans selection:bg-blue-500/30">
      
      {/* LEFT SIDE: The Cyber Library (Completely Animated) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        
        {/* 1. Animated Grid Background (The "Floor") */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-[-10%] h-[200%] w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-moveGrid"></div>
        </div>

        {/* 2. Abstract Glowing Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

        {/* 3. The Content (Floating & Shimmering) */}
        <div className="relative z-10 text-white p-12 space-y-8 max-w-lg select-none">
          
          {/* Status Badge - Floating Animation */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-900/10 backdrop-blur-md text-xs font-medium text-blue-200 animate-float">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Online • v1.2 Live
          </div>

          {/* Headline - Shimmer Effect */}
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            The Future of <br />
            <span className="animate-shimmer bg-[linear-gradient(110deg,#93c5fd,45%,#ffffff,55%,#93c5fd)] bg-[length:250%_100%] bg-clip-text text-transparent">
              Smart Learning.
            </span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed border-l-2 border-blue-500/50 pl-4">
            Step into the next-gen library. 
            <span className="text-blue-300"> 3D Mapping</span>, 
            <span className="text-blue-300"> IoT Gate Access</span>, and 
            <span className="text-blue-300"> Live Inventory</span> at your fingertips.
          </p>

          {/* Decorative Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/50">
            <div>
              <p className="text-2xl font-bold text-white">24k+</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Books</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">3D</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Navigation</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">&lt;1s</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Latency</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Login Form (Clean & Premium) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative bg-slate-50/50">
        
        <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="h-14 w-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Library className="text-white h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Student Portal</h2>
            <p className="text-slate-500">Enter your credentials to access the 3D Map</p>
          </div>

          <Card className="border-0 shadow-2xl shadow-slate-200/60 bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Secure Access
              </CardTitle>
              <CardDescription>Use your university email ID</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Error Message Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md animate-in fade-in zoom-in duration-300">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="student@college.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-slate-900 hover:bg-blue-600 text-white transition-all duration-300 shadow-xl hover:shadow-blue-500/20 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Launch Portal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
              Forgot your password?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}