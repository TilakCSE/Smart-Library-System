"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Library,
  Fingerprint,
  Box,
  Database,
  Code2,
  Terminal as TerminalIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Components
import { BlurFade } from "@/components/ui/blur-fade";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";
import { CardStack, type CardStackItem } from "@/components/card-stack";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURED_ITEMS: CardStackItem[] = [
  {
    id: 1,
    title: "Three.js Journey",
    description: "Master WebGL and create stunning 3D web experiences.",
    imageSrc:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    tag: "Trending",
  },
  {
    id: 2,
    title: "The Art of Game Design",
    description: "A book of lenses. Essential reading for interactive systems.",
    imageSrc:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop",
    tag: "Must Read",
  },
  {
    id: 3,
    title: "Clean Architecture",
    description: "A Craftsman's Guide to Software Structure and Design.",
    imageSrc:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop",
    tag: "Engineering",
  },
  {
    id: 4,
    title: "Neuromancer",
    description: "The classic cyberpunk novel by William Gibson.",
    imageSrc:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop",
    tag: "Fiction",
  },
  {
    id: 5,
    title: "Snow Crash",
    description: "The sci-fi classic that predicted the Metaverse.",
    imageSrc:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop",
    tag: "Sci-Fi",
  },
];

export default function NUVLibraryLanding() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".gsap-3d-section").forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 100, rotateX: 12, transformPerspective: 2000 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-amber-500/30 overflow-x-hidden"
    >
      {/* FORCE CONTINUOUS ANIMATION ON CARD STACK */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .card-stack-wrap:hover * { animation-play-state: running !important; }
      `,
        }}
      />

      {/* NAVIGATION */}
      <nav className="fixed top-0 inset-x-0 h-24 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 flex items-center px-8 md:px-16">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-zinc-950">
              <Library className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              NUV
              <span className="text-zinc-500 font-medium italic">Library</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            <a href="#featured" className="hover:text-white transition-colors">
              Featured
            </a>
            <a
              href="#architecture"
              className="hover:text-white transition-colors"
            >
              Architecture
            </a>
            <a
              href="#tech-stack"
              className="hover:text-white transition-colors"
            >
              Tech Stack
            </a>
          </div>
          <Link
            href="/login"
            className="text-sm font-bold tracking-widest uppercase border-b border-transparent hover:border-amber-500 hover:text-amber-500 transition-colors pb-1"
          >
            Student Login
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="gsap-3d-section relative pt-48 pb-32 px-8 md:px-16 max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-16 items-center min-h-screen">
        <div className="lg:col-span-7 space-y-8 z-10">
          <BlurFade delay={0.1} inView>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600 mb-6 block flex items-center gap-3">
              <span className="w-8 h-[1px] bg-amber-600"></span> Next-Gen
              Library
            </span>
            <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight leading-[1.05] mb-8">
              The Archive of <br />
              <span className="italic text-zinc-500">Human Thought.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-lg leading-relaxed mb-10">
              Experience a seamless digital catalog integrated with physical
              space. Find your book, track its live status, and navigate to its
              exact rack using our interactive WebGL environment.
            </p>
            <Link
              href="/books"
              className="group inline-flex items-center gap-4 px-8 py-4 bg-white text-zinc-950 rounded-full font-bold tracking-wide hover:bg-stone-200 transition-colors w-max"
            >
              Explore Archives{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </BlurFade>
        </div>

        <div className="lg:col-span-5 w-full relative">
          <BlurFade delay={0.3} inView>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white">
              <img
                src="library.jpeg"
                alt="NUVLibrary Illustration"
                className="w-full h-full object-contain"
              />
            </div>
          </BlurFade>
        </div>
      </section>

      {/* VELOCITY SCROLL */}
      <section className="py-20 overflow-hidden bg-zinc-950 border-y border-white/5">
        <ScrollVelocityContainer>
          <ScrollVelocityRow
            baseVelocity={1}
            className="font-serif text-6xl md:text-8xl tracking-tight text-white/5"
          >
            DISCOVER • LEARN • GROW •
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
      </section>

      {/* CURATED ADDITIONS (Shifted Text Left) */}
      <section
        id="featured"
        className="gsap-3d-section py-32 relative px-8 md:px-16 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-32 scroll-mt-24"
      >
        {" "}
        <div className="max-w-xl lg:-translate-x-12">
          <h2 className="text-5xl font-serif tracking-tight text-white mb-6 italic">
            Curated Additions
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed mb-10">
            Swipe through the latest highly-requested volumes currently resting
            on our physical shelves. Updated weekly by our head archivists.
          </p>
          <Link
            href="/books"
            className="text-xs font-bold tracking-widest uppercase border-b border-amber-500 text-amber-500 pb-1 hover:text-amber-400 transition-colors inline-flex items-center gap-2 group"
          >
            View All Volumes{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="flex justify-center w-full md:w-auto h-[500px] items-center card-stack-wrap">
          <CardStack
            items={FEATURED_ITEMS}
            cardWidth={320}
            cardHeight={460}
            perspectivePx={1200}
            autoAdvance={true}
            intervalMs={2000}
          />
        </div>
      </section>

      {/* TECH STACK (PREMIUM EDITORIAL LIST - No Cyber Boxes) */}
      <section
        id="tech-stack"
        className="gsap-3d-section py-40 px-8 md:px-16 max-w-5xl mx-auto scroll-mt-24"
      >
        <div className="text-center mb-24">
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500 block mb-4">
            Architecture Suite
          </span>
          <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tight italic">
            The Core Stack
          </h2>
        </div>

        <div className="border-t border-white/10">
          {[
            {
              num: "01",
              title: "RFID Infrastructure",
              desc: "Passive RFID tags monitored by Arduino nodes at every rack.",
              icon: Fingerprint,
            },
            {
              num: "02",
              title: "3D Digital Twin",
              desc: "WebGL environment built in Unity and React Three Fiber.",
              icon: Box,
            },
            {
              num: "03",
              title: "FastAPI Core",
              desc: "Asynchronous backend managing real-time hardware interrupts.",
              icon: Database,
            },
            {
              num: "04",
              title: "Next.js Interface",
              desc: "Cinematic UI using Framer Motion for physical interactions.",
              icon: Code2,
            },
          ].map((item) => (
            <div
              key={item.num}
              className="group flex flex-col md:flex-row items-start md:items-center justify-between py-12 border-b border-white/10 hover:bg-white/[0.02] transition-colors cursor-default px-6 -mx-6 rounded-2xl"
            >
              <div className="flex items-center gap-8 mb-4 md:mb-0">
                <span className="text-xl font-mono text-zinc-600 group-hover:text-amber-600 transition-colors">
                  {item.num}
                </span>
                <h3 className="text-3xl font-serif text-white group-hover:-translate-y-1 transition-transform">
                  {item.title}
                </h3>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed md:w-1/3">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5 text-center px-8 bg-[#09090b]">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Library className="w-5 h-5 text-zinc-500" />
          <span className="text-xl font-bold tracking-tight text-white">
            NUV<span className="text-zinc-600">Library</span>
          </span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700">
          © 2026 NUVLibrary System • SYSTEM INITIATED • v2.0.4
        </p>
      </footer>
    </main>
  );
}
