"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

const STARS = [
  { id: 1, top: "12%", left: "18%", size: 2, delay: 0 },
  { id: 2, top: "24%", left: "76%", size: 3, delay: 1.4 },
  { id: 3, top: "8%", left: "52%", size: 2, delay: 2.8 },
  { id: 4, top: "38%", left: "88%", size: 2, delay: 0.7 },
  { id: 5, top: "45%", left: "10%", size: 3, delay: 3.2 },
  { id: 6, top: "18%", left: "34%", size: 2, delay: 4.1 },
  { id: 7, top: "64%", left: "82%", size: 2, delay: 1.9 },
  { id: 8, top: "29%", left: "63%", size: 2.5, delay: 2.2 },
];

export function AmbientBackground() {
  const { resolvedTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    const handleVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";
  const animateAllowed = !shouldReduceMotion && isTabVisible;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Blob 1: Warm Sunlight / Moonlight Glow */}
      <motion.div
        animate={
          animateAllowed
            ? {
                x: [0, 40, -20, 0],
                y: [0, -30, 20, 0],
              }
            : false
        }
        transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-28 -left-28 h-[28rem] w-[28rem] rounded-full opacity-35 blur-3xl"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(255, 210, 138, 0.16) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(246, 185, 76, 0.25) 0%, transparent 70%)",
        }}
      />

      {/* Blob 2: Soft Sky / Twilight Drift */}
      <motion.div
        animate={
          animateAllowed
            ? {
                x: [0, -50, 30, 0],
                y: [0, 25, -25, 0],
              }
            : false
        }
        transition={{ duration: 56, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-32 h-[30rem] w-[30rem] rounded-full opacity-30 blur-3xl"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(127, 181, 230, 0.14) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(142, 201, 232, 0.24) 0%, transparent 70%)",
        }}
      />

      {/* Slow Drifting Cloud Silhouette */}
      <motion.svg
        viewBox="0 0 600 200"
        animate={animateAllowed ? { x: [-40, 60, -40] } : false}
        transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-12 left-1/4 h-40 w-[34rem] opacity-25 dark:opacity-10"
      >
        <path
          fill={isDark ? "#7FB5E6" : "#FFFFFF"}
          d="M130 140 Q100 140 90 115 Q75 95 105 80 Q120 45 165 55 Q200 30 245 55 Q285 50 300 85 Q335 90 330 120 Q325 140 295 140 Z"
        />
      </motion.svg>

      {/* Night Mode Stars & Gentle Moon Glow */}
      {isDark && (
        <>
          <div
            className="absolute top-14 right-[14%] h-24 w-24 rounded-full opacity-25 blur-xl"
            style={{ background: "radial-gradient(circle, #FFD28A 0%, transparent 70%)" }}
          />
          {STARS.map((star) => (
            <motion.span
              key={star.id}
              animate={animateAllowed ? { opacity: [0.2, 0.85, 0.2] } : { opacity: 0.5 }}
              transition={{
                duration: 6,
                delay: star.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
              }}
              className="absolute rounded-full bg-primary"
            />
          ))}
        </>
      )}
    </div>
  );
}