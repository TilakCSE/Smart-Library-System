"use client";

import { motion } from "framer-motion";
import { 
  Bell, 
  Cpu, 
  Smartphone, 
  ShieldCheck, 
  Database,
  Moon,
  ChevronRight
} from "lucide-react";
import {BlurFade} from "@/components/ui/blur-fade";

const SETTING_GROUPS = [
  {
    title: "System Integration",
    items: [
      { name: "NFC / Mobile Entry", desc: "Allow phone to unlock physical library turnstiles", icon: Smartphone, active: true },
      { name: "RFID Notifications", desc: "Alert when reserved books hit the return drop-box", icon: Bell, active: true },
    ]
  },
  {
    title: "Spatial & 3D Preferences",
    items: [
      { name: "Hardware Acceleration", desc: "Optimized WebGL rendering for 3D navigation", icon: Cpu, active: true },
      { name: "High-Contrast HUD", desc: "Muted color scheme for low-light environments", icon: Moon, active: false },
    ]
  }
];

export default function SettingsPanel() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans p-8 md:p-16">
      <div className="max-w-3xl mx-auto">
        
        <header className="mb-16">
          <BlurFade delay={0.1}>
            <h1 className="text-4xl font-serif font-medium mb-2">Control Center</h1>
            <p className="text-stone-500">Configure your SmartOS experience and IoT integrations.</p>
          </BlurFade>
        </header>

        <div className="space-y-12">
          {SETTING_GROUPS.map((group, gIdx) => (
            <section key={group.title}>
              <BlurFade delay={0.2 + gIdx * 0.1}>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">{group.title}</h2>
                <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                  {group.items.map((item, iIdx) => (
                    <div 
                      key={item.name} 
                      className={`p-6 flex items-center justify-between group cursor-pointer transition-colors hover:bg-stone-50 ${iIdx !== group.items.length - 1 ? 'border-b border-stone-100' : ''}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <item.icon className="w-5 h-5 text-stone-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-xs text-stone-500">{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${item.active ? 'bg-amber-500' : 'bg-stone-200'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.active ? 'left-6' : 'left-1'}`} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </BlurFade>
            </section>
          ))}
        </div>

        {/* ACCOUNT SECURITY CARD */}
        <section className="mt-16">
          <BlurFade delay={0.5}>
            <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                <Database className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
                <div className="relative z-10">
                    <ShieldCheck className="w-8 h-8 text-amber-500 mb-6" />
                    <h2 className="text-2xl font-serif mb-2">Student Encryption Key</h2>
                    <p className="text-stone-400 text-sm max-w-sm mb-8 leading-relaxed">Your digital identity is hashed via local node encryption. No personal data is stored on public library servers.</p>
                    <button className="px-6 py-3 bg-white text-stone-900 rounded-full font-bold text-sm hover:bg-amber-500 transition-colors">
                        Manage Security Vault
                    </button>
                </div>
            </div>
          </BlurFade>
        </section>

      </div>
    </div>
  );
}