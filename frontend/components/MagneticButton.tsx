"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MagneticButton({ children, onClick, className = "" }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    // The multiplier (0.2) controls how strong the magnetic pull is
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={`relative px-8 py-4 bg-zinc-900 text-stone-50 rounded-full font-medium tracking-wide hover:bg-zinc-800 transition-colors shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </motion.button>
  );
}