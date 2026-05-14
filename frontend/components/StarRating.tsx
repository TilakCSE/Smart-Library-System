"use client";

import { Star, StarHalf } from "lucide-react";
import { motion } from "framer-motion";

export function StarRating({ rating = 4.5, reviews = 128 }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
            >
              {i < fullStars ? (
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              ) : i === fullStars && hasHalfStar ? (
                <StarHalf className="w-5 h-5 fill-amber-500 text-amber-500" />
              ) : (
                <Star className="w-5 h-5 fill-transparent text-zinc-300" />
              )}
            </motion.div>
          );
        })}
      </div>
      <span className="text-sm font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-4 cursor-pointer hover:text-zinc-900 transition-colors">
        {reviews} Reviews
      </span>
    </div>
  );
}