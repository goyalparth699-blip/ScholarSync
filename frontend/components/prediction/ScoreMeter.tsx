"use client";

import { motion } from "framer-motion";
import { getScoreColor, getScoreCategory } from "@/lib/utils";

const R = 52;
const CIRC = 2 * Math.PI * R;

interface ScoreMeterProps {
  score: number;
  size?: number;
}

export function ScoreMeter({ score, size = 160 }: ScoreMeterProps) {
  const offset   = CIRC * (1 - Math.min(100, Math.max(0, score)) / 100);
  const color    = getScoreColor(score);
  const category = getScoreCategory(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width: size, height: size }} className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          className="-rotate-90"
          fill="none"
        >
          {/* Background track */}
          <circle
            cx="60" cy="60" r={R}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="7"
          />
          {/* Progress arc */}
          <motion.circle
            cx="60" cy="60" r={R}
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          />
          {/* Subtle glow ring */}
          <motion.circle
            cx="60" cy="60" r={R}
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC, opacity: 0 }}
            animate={{ strokeDashoffset: offset, opacity: 0.08 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          />
        </svg>

        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold leading-none"
            style={{ fontSize: size * 0.22, color }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7, ease: "backOut" }}
          >
            {score.toFixed(0)}
          </motion.span>
          <motion.span
            className="text-text-muted mt-0.5"
            style={{ fontSize: size * 0.085 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            / 100
          </motion.span>
        </div>
      </div>

      {/* Category label */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="flex flex-col items-center gap-1"
      >
        <span
          className="text-sm font-semibold px-3 py-1 rounded-full border"
          style={{
            color,
            backgroundColor: `${color}18`,
            borderColor:     `${color}35`,
          }}
        >
          {category.label}
        </span>
        <span className="text-xs text-text-muted text-center max-w-[160px] leading-relaxed">
          {category.description}
        </span>
      </motion.div>
    </div>
  );
}
