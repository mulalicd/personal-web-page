import { useRef, useEffect } from "react";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // ✅ prefers-reduced-motion check — ne pokreći animaciju ako korisnik to preferira
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    // ✅ Mobilni uređaji dobijaju upola manje čestica
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 40 : 80;

    const particles: {
      x: number; y: number; z: number;
      speed: number; size: number; opacity: number;
      connectRadius: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      const z = 0.3 + Math.random() * 0.7;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z,
        speed: (0.1 + Math.random() * 0.3) * z,
        size: (1 + Math.random() * 2) * z,
        opacity: (0.08 + Math.random() * 0.2) * z,
        connectRadius: 120 * z,
      });
    }

    // ✅ Na mobilnom preskačemo skupe connection linije
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.min(a.connectRadius, b.connectRadius);
            if (dist < maxDist) {
              const op = Math.min(a.opacity, b.opacity) * 0.4 * (1 - dist / maxDist);
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `hsla(210, 82%, 55%, ${op})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(210, 82%, 55%, ${p.opacity})`;
        ctx.fill();

        // ✅ Glow efekt samo na desktopu
        if (p.size > 2 && !isMobile) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grd.addColorStop(0, `hsla(210, 82%, 55%, ${p.opacity * 0.3})`);
          grd.addColorStop(1, "hsla(210, 82%, 55%, 0)");
          ctx.fillStyle = grd;
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{ opacity: 0.55 }}
    />
  );
}
