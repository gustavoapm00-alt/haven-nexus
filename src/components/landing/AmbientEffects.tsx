import { useEffect, useRef } from 'react';

const AmbientEffects = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -2000, y: -2000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);

    const GRID = 44;
    const RADIUS = 160;
    const PULL = 10;
    let angle = 0;
    let scanAngle2 = Math.PI;

    // Particle system
    const PARTICLES: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[] = [];
    const PARTICLE_COUNT = 35;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      PARTICLES.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.25 + 0.05,
        size: Math.random() * 1.2 + 0.4,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── Reactive grid
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += GRID) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(57,255,20,0.022)';
        for (let y = 0; y <= canvas.height; y += 3) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = dist < RADIUS ? (1 - dist / RADIUS) * PULL : 0;
          const ox = pull > 0 ? (dx / (dist || 1)) * pull * -1 : 0;
          const isGlowing = dist < RADIUS * 0.6;
          if (isGlowing) ctx.strokeStyle = `rgba(57,255,20,${0.06 - (dist / (RADIUS * 0.6)) * 0.04})`;
          else ctx.strokeStyle = 'rgba(57,255,20,0.022)';
          y === 0 ? ctx.moveTo(x + ox, y) : ctx.lineTo(x + ox, y);
        }
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += GRID) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(57,255,20,0.022)';
        for (let x = 0; x <= canvas.width; x += 3) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = dist < RADIUS ? (1 - dist / RADIUS) * PULL : 0;
          const oy = pull > 0 ? (dy / (dist || 1)) * pull * -1 : 0;
          x === 0 ? ctx.moveTo(x, y + oy) : ctx.lineTo(x, y + oy);
        }
        ctx.stroke();
      }

      // ── Cursor halo
      if (mx > 0) {
        const halo = ctx.createRadialGradient(mx, my, 0, mx, my, RADIUS * 0.8);
        halo.addColorStop(0, 'rgba(57,255,20,0.04)');
        halo.addColorStop(1, 'rgba(57,255,20,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(mx, my, RADIUS * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Primary radar sweep (top-right)
      angle += 0.007;
      const s1x = canvas.width - 90;
      const s1y = 90;
      const s1r = 64;
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(s1x, s1y);
      ctx.arc(s1x, s1y, s1r, angle, angle + 0.55);
      ctx.closePath();
      const g1 = ctx.createRadialGradient(s1x, s1y, 0, s1x, s1y, s1r);
      g1.addColorStop(0, 'rgba(57,255,20,0.5)');
      g1.addColorStop(1, 'rgba(57,255,20,0)');
      ctx.fillStyle = g1;
      ctx.fill();
      // rings
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = 'rgba(57,255,20,0.6)';
      ctx.lineWidth = 0.5;
      [1, 0.66, 0.33].forEach((f) => {
        ctx.beginPath();
        ctx.arc(s1x, s1y, s1r * f, 0, Math.PI * 2);
        ctx.stroke();
      });
      // crosshairs
      ctx.globalAlpha = 0.05;
      ctx.beginPath();
      ctx.moveTo(s1x - s1r, s1y); ctx.lineTo(s1x + s1r, s1y);
      ctx.moveTo(s1x, s1y - s1r); ctx.lineTo(s1x, s1y + s1r);
      ctx.stroke();
      ctx.restore();

      // ── Secondary radar (bottom-left) — amber tint
      scanAngle2 -= 0.004;
      const s2x = 70;
      const s2y = canvas.height - 80;
      const s2r = 40;
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.moveTo(s2x, s2y);
      ctx.arc(s2x, s2y, s2r, scanAngle2, scanAngle2 + 0.6);
      ctx.closePath();
      const g2 = ctx.createRadialGradient(s2x, s2y, 0, s2x, s2y, s2r);
      g2.addColorStop(0, 'rgba(255,191,0,0.4)');
      g2.addColorStop(1, 'rgba(255,191,0,0)');
      ctx.fillStyle = g2;
      ctx.fill();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = 'rgba(255,191,0,0.6)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(s2x, s2y, s2r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── Drifting particles
      for (const p of PARTICLES) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // repel from cursor
        const dpx = p.x - mx;
        const dpy = p.y - my;
        const dp = Math.sqrt(dpx * dpx + dpy * dpy);
        if (dp < 80) {
          p.vx += (dpx / dp) * 0.04;
          p.vy += (dpy / dp) * 0.04;
        }
        // dampen
        p.vx *= 0.99;
        p.vy *= 0.99;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#39FF14';
        ctx.beginPath();
        ctx.rect(p.x, p.y, p.size, p.size);
        ctx.fill();
        ctx.restore();
      }

      // ── Scanline overlay (subtle horizontal lines)
      ctx.save();
      ctx.globalAlpha = 0.012;
      ctx.fillStyle = 'rgba(0,0,0,1)';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default AmbientEffects;
