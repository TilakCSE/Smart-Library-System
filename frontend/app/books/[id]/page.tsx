"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Bookmark, MapPin } from "lucide-react";

import {BlurFade} from "@/components/ui/blur-fade";
import { MagneticButton } from "@/components/MagneticButton";
import { StarRating } from "@/components/StarRating";

export default function BookDetailsPage() {
  const [activeTab, setActiveTab] = useState("Synopsis");
  const tabs = ["Synopsis", "Details", "Author Notes"];

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-900 font-sans selection:bg-amber-200/50">
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/books" className="group flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Archives
        </Link>
        <button className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors text-zinc-500">
          <Bookmark className="w-4 h-4" />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start pt-8">
        
        {/* LEFT COLUMN: The Book Cover (Sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-12">
          <BlurFade delay={0.1} inView>
            <div className="relative aspect-[2/3] w-full max-w-md mx-auto lg:max-w-none rounded-lg overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] group">
              {/* Premium Inner Shadow */}
              <div className="absolute inset-0 border border-black/5 rounded-lg z-10 pointer-events-none" />
              <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />
              
              <img 
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop" 
                alt="Clean Architecture Cover" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </BlurFade>
        </div>

        {/* RIGHT COLUMN: The Editorial Metadata */}
        <div className="lg:col-span-7 flex flex-col pt-4">
          
          <BlurFade delay={0.2} inView>
            <span className="text-sm font-bold tracking-widest text-amber-600 uppercase mb-4 block">
              Software Engineering
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-medium leading-tight text-zinc-900 mb-4">
              Clean Architecture
            </h1>
            <p className="text-xl text-zinc-500 mb-8">
              A Craftsman's Guide to Software Structure and Design
            </p>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-full bg-zinc-200 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Robert+Martin&background=f4f4f5&color=18181b" alt="Author" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">Robert C. Martin</p>
                <p className="text-sm text-zinc-500">Published 2017</p>
              </div>
            </div>

            <div className="mb-12">
              <StarRating rating={4.8} reviews={1432} />
            </div>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <div className="flex flex-col sm:flex-row gap-4 mb-16 pb-12 border-b border-zinc-200">
              <MagneticButton>
                Reserve Physical Copy
              </MagneticButton>
              <Link href="/locate/book-123" className="px-8 py-4 bg-transparent border border-zinc-300 text-zinc-900 rounded-full font-medium tracking-wide hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" /> Locate in Library
              </Link>
            </div>
          </BlurFade>

          {/* Minimalist Editorial Tabs */}
          <BlurFade delay={0.4} inView>
            <div className="flex items-center gap-8 border-b border-zinc-200 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-4 text-sm font-medium transition-colors ${
                    activeTab === tab ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="editorial-tab"
                      className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-zinc-900"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed">
              {activeTab === "Synopsis" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="mb-4">
                    Building upon the success of best-sellers <em>The Clean Coder</em> and <em>Clean Code</em>, legendary software craftsman Robert C. Martin ("Uncle Bob") reveals the rules of software architecture and how you can apply them.
                  </p>
                  <p>
                    Martin's Clean Architecture doesn't merely present options. Drawing on over a half-century of experience in software environments of every imaginable type, Martin tells you what choices to make and why they are critical to your success.
                  </p>
                </motion.div>
              )}
              {activeTab === "Details" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="font-medium text-zinc-900">ISBN-13</div>
                  <div>978-0134494166</div>
                  <div className="font-medium text-zinc-900">Pages</div>
                  <div>432</div>
                  <div className="font-medium text-zinc-900">Publisher</div>
                  <div>Prentice Hall</div>
                  <div className="font-medium text-zinc-900">Database Location</div>
                  <div className="font-mono text-amber-700 bg-amber-100/50 inline-block px-2 py-0.5 rounded">Rack_4</div>
                </motion.div>
              )}
            </div>
          </BlurFade>

        </div>
      </main>
    </div>
  );
}