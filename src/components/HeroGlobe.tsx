import { useEffect, useRef, useState, useCallback } from "react";

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  name: string;
}

export function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, name: "" });

  // Store projected nodes for hit testing
  const projectedNodesRef = useRef<{ x: number; y: number; z: number; name: string; active: boolean; screenX: number; screenY: number }[]>([]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let found = false;
    for (const node of projectedNodesRef.current) {
      if (node.z < -0.15) continue;
      const dx = mx - node.x;
      const dy = my - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = node.active ? 12 : 6;
      if (dist < hitRadius) {
        setTooltip({
          visible: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 30,
          name: node.name,
        });
        found = true;
        break;
      }
    }
    if (!found && tooltip.visible) {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [tooltip.visible]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // ✅ prefers-reduced-motion — zaustavi rotaciju globusa
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animId: number;
    let rotation = 0;
    const size = 500;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.4;

    const cities = [
      { name: "New York", lat: 40.7, lon: -74.0 },
      { name: "London", lat: 51.5, lon: -0.1 },
      { name: "Berlin", lat: 52.5, lon: 13.4 },
      { name: "Paris", lat: 48.9, lon: 2.3 },
      { name: "Dubai", lat: 25.2, lon: 55.3 },
      { name: "Singapore", lat: 1.4, lon: 103.8 },
      { name: "Tokyo", lat: 35.7, lon: 139.7 },
      { name: "Sydney", lat: -33.9, lon: 151.2 },
      { name: "Sarajevo", lat: 43.9, lon: 18.4 },
      { name: "Vienna", lat: 48.2, lon: 16.4 },
      { name: "Zurich", lat: 47.4, lon: 8.5 },
      { name: "Munich", lat: 48.1, lon: 11.6 },
      { name: "Milan", lat: 45.5, lon: 9.2 },
      { name: "Stockholm", lat: 59.3, lon: 18.1 },
      { name: "Amsterdam", lat: 52.4, lon: 4.9 },
      { name: "Toronto", lat: 43.7, lon: -79.4 },
      { name: "São Paulo", lat: -23.6, lon: -46.6 },
      { name: "Lagos", lat: 6.5, lon: 3.4 },
      { name: "Cairo", lat: 30.0, lon: 31.2 },
      { name: "Mumbai", lat: 19.1, lon: 72.9 },
      { name: "Shanghai", lat: 31.2, lon: 121.5 },
      { name: "Seoul", lat: 37.6, lon: 127.0 },
      { name: "Istanbul", lat: 41.0, lon: 29.0 },
      { name: "Moscow", lat: 55.8, lon: 37.6 },
      { name: "Riyadh", lat: 24.7, lon: 46.7 },
      { name: "Nairobi", lat: -1.3, lon: 36.8 },
      { name: "Cape Town", lat: -33.9, lon: 18.4 },
      { name: "Mexico City", lat: 19.4, lon: -99.1 },
      { name: "Buenos Aires", lat: -34.6, lon: -58.4 },
      { name: "Lima", lat: -12.0, lon: -77.0 },
      { name: "Bangkok", lat: 13.8, lon: 100.5 },
      { name: "Jakarta", lat: -6.2, lon: 106.8 },
      { name: "Kuala Lumpur", lat: 3.1, lon: 101.7 },
      { name: "Warsaw", lat: 52.2, lon: 21.0 },
      { name: "Prague", lat: 50.1, lon: 14.4 },
      { name: "Budapest", lat: 47.5, lon: 19.0 },
      { name: "Athens", lat: 37.98, lon: 23.7 },
      { name: "Zagreb", lat: 45.8, lon: 16.0 },
      { name: "Belgrade", lat: 44.8, lon: 20.5 },
      { name: "Bucharest", lat: 44.4, lon: 26.1 },
      { name: "Helsinki", lat: 60.2, lon: 24.9 },
      { name: "Oslo", lat: 59.9, lon: 10.8 },
      { name: "Copenhagen", lat: 55.7, lon: 12.6 },
      { name: "Lisbon", lat: 38.7, lon: -9.1 },
      { name: "Madrid", lat: 40.4, lon: -3.7 },
      { name: "Dublin", lat: 53.3, lon: -6.3 },
      { name: "Doha", lat: 25.3, lon: 51.5 },
      { name: "Taipei", lat: 25.0, lon: 121.5 },
      { name: "Manila", lat: 14.6, lon: 121.0 },
      { name: "Hanoi", lat: 21.0, lon: 105.9 },
    ];

    const cityNodes = cities.map((c) => {
      const phi = ((90 - c.lat) / 180) * Math.PI;
      const theta = ((c.lon + 180) / 360) * Math.PI * 2;
      return { ...c, phi, theta };
    });

    let activeSet = new Set<number>();
    const pulsePhase: number[] = new Array(cities.length).fill(0);

    const refreshActive = () => {
      const count = 20 + Math.floor(Math.random() * 31);
      const indices = Array.from({ length: cities.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      activeSet = new Set(indices.slice(0, count));
    };
    refreshActive();
    const refreshInterval = setInterval(refreshActive, 4000);

    const project = (phi: number, theta: number, rot: number) => {
      const x3d = Math.cos(theta + rot) * Math.sin(phi);
      const y3d = Math.sin(theta + rot) * Math.sin(phi);
      const z3d = Math.cos(phi);
      return {
        x: cx + x3d * radius,
        y: cy + z3d * radius,
        z: y3d,
        opacity: 0.15 + (y3d + 1) * 0.42,
      };
    };

    const meridians = 8;
    const parallels = 6;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      rotation += prefersReduced ? 0 : 0.0015;

      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.2);
      outerGlow.addColorStop(0, "hsla(210, 82%, 55%, 0.04)");
      outerGlow.addColorStop(1, "hsla(210, 82%, 55%, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      for (let m = 0; m < meridians; m++) {
        const mTheta = (m / meridians) * Math.PI * 2;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 40; i++) {
          const phi = (i / 40) * Math.PI;
          const p = project(phi, mTheta, rotation);
          if (p.z < -0.05) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "hsla(210, 82%, 55%, 0.06)";
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      for (let p = 1; p < parallels; p++) {
        const phi = (p / parallels) * Math.PI;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 60; i++) {
          const theta = (i / 60) * Math.PI * 2;
          const pt = project(phi, theta, rotation);
          if (pt.z < -0.05) { started = false; continue; }
          if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = "hsla(210, 82%, 55%, 0.05)";
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      const projected = cityNodes.map((n, i) => ({
        ...project(n.phi, n.theta, rotation),
        index: i,
        active: activeSet.has(i),
        name: n.name,
      }));

      // Store for hit testing
      projectedNodesRef.current = projected.map(p => ({
        x: p.x,
        y: p.y,
        z: p.z,
        name: p.name,
        active: p.active,
        screenX: p.x,
        screenY: p.y,
      }));

      const activeNodes = projected.filter((p) => p.active && p.z > -0.1);
      for (let i = 0; i < activeNodes.length; i++) {
        for (let j = i + 1; j < activeNodes.length; j++) {
          const a = activeNodes[i];
          const b = activeNodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius * 0.6) {
            const op = Math.min(a.opacity, b.opacity) * 0.3 * (1 - dist / (radius * 0.6));
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(160, 64%, 50%, ${op})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      for (const p of projected) {
        if (p.z < -0.15) continue;
        pulsePhase[p.index] = (pulsePhase[p.index] + 0.03) % (Math.PI * 2);

        if (p.active) {
          const pulse = 0.6 + Math.sin(pulsePhase[p.index]) * 0.4;
          const nodeSize = 2.5 + p.opacity * 2;

          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeSize * 5, 0, Math.PI * 2);
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, nodeSize * 5);
          grd.addColorStop(0, `hsla(160, 64%, 55%, ${p.opacity * 0.25 * pulse})`);
          grd.addColorStop(1, "hsla(160, 64%, 55%, 0)");
          ctx.fillStyle = grd;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(160, 64%, 55%, ${p.opacity * 0.9 * pulse})`;
          ctx.fill();
        } else {
          const nodeSize = 1.2 + p.opacity * 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, nodeSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(210, 82%, 60%, ${p.opacity * 0.3})`;
          ctx.fill();
        }
      }

      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.3);
      coreGrd.addColorStop(0, "hsla(160, 64%, 50%, 0.08)");
      coreGrd.addColorStop(1, "hsla(210, 82%, 55%, 0)");
      ctx.fillStyle = coreGrd;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
        style={{ opacity: 0.75 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-50 px-2.5 py-1 bg-card/95 backdrop-blur-sm rounded-lg border border-accent/30 text-xs font-medium text-accent shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
          }}
        >
          <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full mr-1.5 animate-pulse" />
          {tooltip.name}
        </div>
      )}
    </div>
  );
}
