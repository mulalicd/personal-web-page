import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover3D?: boolean;
}

export function GlassCard({ children, className = "", delay = 0, hover3D = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={hover3D ? {
        rotateX: -2,
        rotateY: 3,
        scale: 1.02,
        transition: { duration: 0.3 },
      } : undefined}
      style={hover3D ? { transformStyle: "preserve-3d", perspective: 800 } : undefined}
      className={`
        relative overflow-hidden rounded-2xl
        bg-card/80 backdrop-blur-md
        border border-border/50
        shadow-card hover:shadow-xl
        transition-shadow duration-300
        ${className}
      `}
    >
      {/* Subtle gradient overlay for glass depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
