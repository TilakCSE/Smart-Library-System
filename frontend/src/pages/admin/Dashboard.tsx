import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, AlertTriangle, DollarSign, Loader2, TrendingUp, Flame, Trophy } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface AnalyticsData {
  stats: {
    total_students: number;
    active_issues: number;
    overdue_count: number;
    total_fines: number;
  };
  heatmap_data: {
    name: string;
    searches: number;
  }[];
  // ADD THIS:
  trending_books: {
    title: string;
    author: string;
    searches: number;
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/v1/admin/analytics');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Framer Motion Animation Variants
  const container : Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const item : Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center space-y-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="animate-pulse">Aggregating Global Vault Analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-slate-400 mt-1">Real-time telemetry and student search intent.</p>
      </motion.div>

      {/* Top Level Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Students</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.stats.total_students}</div>
            <p className="text-xs text-slate-500 mt-1">Registered in system</p>
          </CardContent>
        </Card>

        {/* Active Issues */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Issues</CardTitle>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.stats.active_issues}</div>
            <p className="text-xs text-slate-500 mt-1">Books currently circulating</p>
          </CardContent>
        </Card>

        {/* Overdue Count */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Overdue Books</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data.stats.overdue_count}</div>
            <p className="text-xs text-slate-500 mt-1">Requiring return action</p>
          </CardContent>
        </Card>

        {/* Total Fines */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Fines</CardTitle>
            <DollarSign className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${data.stats.total_fines}</div>
            <p className="text-xs text-slate-500 mt-1">Unpaid penalty balances</p>
          </CardContent>
        </Card>

      </motion.div>

      {/* 2-Column Grid: Heatmap (Left) & Trending Books (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Analytics Chart - Search Intent Heatmap (Takes up 2 columns) */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800 shadow-xl h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Digital Heatmap: Spatial Traffic
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">Search intent tracking for 3D route planning.</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px] w-full">
                {data.heatmap_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.heatmap_data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip cursor={{ stroke: '#334155', strokeWidth: 2, strokeDasharray: '4 4' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }} itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="searches" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSearches)" activeDot={{ r: 6, fill: "#93c5fd", stroke: "#0f172a", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-500 font-medium">
                    No search intent data recorded yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Trending Books Leaderboard (Takes up 1 column) */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="bg-slate-900 border-slate-800 shadow-xl h-full flex flex-col">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Trending Assets
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">Most searched catalogue items.</p>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col gap-4">
              {data.trending_books.map((book, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : index === 1 ? 'bg-slate-300/20 text-slate-300' : index === 2 ? 'bg-orange-700/20 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                      {index === 0 ? <Trophy className="w-4 h-4" /> : `#${index + 1}`}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{book.title}</p>
                      <p className="text-xs text-slate-400 truncate">{book.author}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end pl-2">
                    <span className="text-sm font-bold text-blue-400">{book.searches}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Queries</span>
                  </div>
                </div>
              ))}
              {data.trending_books.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                  No searches recorded.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}