import { Home, Book, Map as MapIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const activeTab = "home"; // We will make this dynamic later

  // Simple Helper Component
  const NavItem = ({ icon: Icon, label, active }: any) => (
    <button className={cn(
      "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300",
      active ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"
    )}>
      <Icon className={cn("w-6 h-6", active && "fill-current")} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around z-50 lg:hidden px-2 pb-safe">
      <NavItem icon={Home} label="Home" active={true} />
      <NavItem icon={Book} label="Books" />
      
      {/* Floating Action Button (FAB) for Map */}
      <div className="relative -top-6">
        <button className="h-14 w-14 rounded-full bg-slate-900 text-white shadow-xl shadow-blue-900/20 flex items-center justify-center transform transition-transform active:scale-95">
          <MapIcon className="w-6 h-6" />
        </button>
      </div>

      <NavItem icon={User} label="Profile" />
    </div>
  );
}