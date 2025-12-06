import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { Search, Zap, Activity, Users, ArrowUpRight, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";

// Initial Dummy Data
const initialData = [
  { name: '10:00', visitors: 40, fine: 20 },
  { name: '10:05', visitors: 30, fine: 10 },
  { name: '10:10', visitors: 20, fine: 50 },
  { name: '10:15', visitors: 27, fine: 30 },
  { name: '10:20', visitors: 18, fine: 40 },
  { name: '10:25', visitors: 23, fine: 20 },
  { name: '10:30', visitors: 34, fine: 10 },
];

export default function AdminDashboard() {
  const [data, setData] = useState(initialData);

  // LIVE DATA SIMULATION ENGINE
  useEffect(() => {
    const interval = setInterval(() => {
      setData(currentData => {
        // 1. Clone the current array
        const newData = [...currentData];
        // 2. Remove the first item (oldest)
        newData.shift();
        // 3. Generate a new time label
        const lastTime = newData[newData.length - 1].name;
        const [hour, minute] = lastTime.split(':').map(Number);
        const newDate = new Date();
        newDate.setHours(hour, minute + 5);
        const newLabel = `${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}`;
        
        // 4. Generate random fluctuation
        const newVisitors = Math.floor(Math.random() * (50 - 15 + 1)) + 15;
        const newFine = Math.floor(Math.random() * (60 - 5 + 1)) + 5;

        // 5. Add new item
        newData.push({ name: newLabel, visitors: newVisitors, fine: newFine });
        return newData;
      });
    }, 2000); // Updates every 2 seconds

    return () => clearInterval(interval);
  }, []);
  
  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="relative overflow-hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl group"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg bg-white/5 ${color} text-white`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-slate-400 text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          <span className="text-xs font-medium text-green-400 flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-1" /> {sub}
          </span>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ${color.replace('text', 'bg')}`}></div>
    </motion.div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mission Control</h1>
          <p className="text-slate-400">Live monitoring of library assets and gate access.</p>
        </div>
        
        {/* Holographic Search */}
        <div className="relative group w-full md:w-96">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-slate-900 rounded-lg p-1">
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <Input 
              placeholder="Search Student ID..." 
              className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0"
            />
            <div className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono border border-slate-700">CMD+K</div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Students" value="2,845" sub="Live" icon={Users} color="text-blue-500 bg-blue-500" />
        <StatCard title="Live Occupancy" value="142" sub="85% Capacity" icon={Activity} color="text-purple-500 bg-purple-500" />
        <StatCard title="Active Fines" value="$1,240" sub="32 Overdue" icon={Zap} color="text-orange-500 bg-orange-500" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: LIVE TRAFFIC GRAPH */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Live Foot Traffic</h3>
                <p className="text-sm text-slate-500">Real-time gate entries</p>
              </div>
              <div className="flex gap-2 items-center">
                 <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded text-blue-400 text-xs animate-pulse">
                    <TrendingUp className="w-3 h-3" /> LIVE
                 </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFines" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorVisits)" 
                    isAnimationActive={false} // Disable initial animation for smoother live updates
                  />
                  <Area 
                    type="monotone" 
                    dataKey="fine" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorFines)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: LIVE LOGS */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Gate Access Logs</h3>
            <div className="space-y-4">
              {data.slice(0, 5).map((d, i) => (
                <motion.div 
                  key={d.name} // Key helps React animate list changes
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group border border-transparent hover:border-slate-700"
                >
                  <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:border-blue-500 transition-colors">
                    {d.visitors % 2 === 0 ? "IN" : "OUT"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        Student #{202400 + i + d.visitors}
                    </p>
                    <p className="text-xs text-slate-500">{d.name}</p>
                  </div>
                  <div className={`ml-auto h-2 w-2 rounded-full ${i === 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}