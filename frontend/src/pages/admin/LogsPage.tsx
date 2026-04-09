import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, ArrowRightLeft, CheckCircle2, History, Filter } from "lucide-react";

interface LogEvent {
  id: string;
  type: "issue" | "return" | "search";
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "transaction" | "search">("all");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/api/v1/admin/master-ledger');
        setLogs(response.data);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "transaction") return log.type === "issue" || log.type === "return";
    if (filter === "search") return log.type === "search";
    return true;
  });

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  
  const item: Variants = {
    hidden: { x: -10, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  const getLogStyles = (type: string) => {
    switch (type) {
      case "issue": return { icon: <ArrowRightLeft className="w-4 h-4 text-blue-400" />, bg: "bg-blue-500/10", text: "text-blue-400" };
      case "return": return { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, bg: "bg-green-500/10", text: "text-green-400" };
      case "search": return { icon: <Search className="w-4 h-4 text-slate-400" />, bg: "bg-slate-500/10", text: "text-slate-400" };
      default: return { icon: <History className="w-4 h-4" />, bg: "bg-slate-800", text: "text-slate-300" };
    }
  };

  // Helper to format the ISO timestamp into a readable date/time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center space-y-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="animate-pulse">Compiling Master Ledger...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Logs</h1>
          <p className="text-slate-400 mt-1">Immutable audit trail of asset transactions and routing queries.</p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(["all", "transaction", "search"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                filter === f ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 pb-4 bg-slate-950/50">
          <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Chronological Activity Feed
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-slate-800/50">
            {filteredLogs.map((log) => {
              const styles = getLogStyles(log.type);
              return (
                <motion.div variants={item} key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between group">
                  
                  <div className="flex items-center gap-4">
                    {/* Event Icon Badge */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.bg}`}>
                      {styles.icon}
                    </div>
                    
                    {/* Event Details */}
                    <div>
                      <p className="text-sm text-slate-300">
                        <span className="font-bold text-white">{log.user_name}</span>{" "}
                        <span className={styles.text}>{log.action.toLowerCase()}</span>{" "}
                        <span className="font-medium text-slate-200">{log.details}</span>
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-slate-500 font-medium font-mono">
                    {formatDate(log.timestamp)}
                  </div>

                </motion.div>
              );
            })}
            
            {filteredLogs.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No activity records found for this filter.
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}