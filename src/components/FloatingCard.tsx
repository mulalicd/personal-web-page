import { useState, useRef, ReactNode, useCallback } from "react";
import { motion } from "framer-motion";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  intensity?: number;
}

export function FloatingCard({ children, className = "", onClick, intensity = 12 }: FloatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -intensity;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * intensity;
    setTransform({ rotateX, rotateY, scale: 1.02 });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        rotateX: transform.rotateX,
        rotateY: transform.rotateY,
        scale: transform.scale,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
