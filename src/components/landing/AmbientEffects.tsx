import { useEffect, useRef } from 'react';

/**
 * Global ambient effects layer: reactive grid + sector scans
 * Renders behind all content on every page
 */
const AmbientEffects = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
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

    const GRID_SIZE = 40;
    const INFLUENCE_RADIUS = 120;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw grid with magnetic distortion
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        for (let y = 0; y <= canvas.height; y += 4) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = dist < INFLUENCE_RADIUS ? (1 - dist / INFLUENCE_RADIUS) * 8 : 0;
          const offsetX = pull > 0 ? (dx / dist) * pull * -1 : 0;
          if (y === 0) ctx.moveTo(x + offsetX, y);
          else ctx.lineTo(x + offsetX, y);
        }
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 4) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = dist < INFLUENCE_RADIUS ? (1 - dist / INFLUENCE_RADIUS) * 8 : 0;
          const offsetY = pull > 0 ? (dy / dist) * pull * -1 : 0;
          if (x === 0) ctx.moveTo(x, y + offsetY);
          else ctx.lineTo(x, y + offsetY);
        }
        ctx.stroke();
      }

      // Sector scan (radar sweep) - top right corner
      angle += 0.008;
      const scanX = canvas.width - 80;
      const scanY = 80;
      const scanR = 60;

      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.moveTo(scanX, scanY);
      ctx.arc(scanX, scanY, scanR, angle, angle + 0.5);
      ctx.closePath();
      const grad = ctx.createRadialGradient(scanX, scanY, 0, scanX, scanY, scanR);
      grad.addColorStop(0, 'rgba(0,200,255,0.3)');
      grad.addColorStop(1, 'rgba(0,200,255,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Scan ring
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = 'rgba(0,200,255,0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(scanX, scanY, scanR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(scanX, scanY, scanR * 0.5, 0, Math.PI * 2);
      ctx.stroke();
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
      style={{ background: '#000000' }}
    />
  );
};

export default AmbientEffects;
