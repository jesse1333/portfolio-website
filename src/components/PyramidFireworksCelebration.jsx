import { useEffect, useRef } from 'react';

const COLORS = ['#f5d259', '#f19648', '#f55a3c', '#ececd1', '#63b3ed', '#ffffff'];

function burst(cx, cy, particles, scale = 1) {
  const n = 48 + Math.floor(Math.random() * 24);
  for (let i = 0; i < n; i += 1) {
    const angle = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.9;
    const speed = (3.5 + Math.random() * 5.5) * scale;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2 * scale,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      r: 1 + Math.random() * 2.2,
    });
  }
}

/**
 * Full-viewport canvas fireworks; calls onFinished when the sequence ends.
 */
export default function PyramidFireworksCelebration({ onFinished }) {
  const canvasRef = useRef(null);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onFinishedRef.current?.();
      return undefined;
    }

    const particles = [];
    const startedAt = performance.now();
    const durationMs = 3400;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const scheduleBursts = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const margin = Math.min(80, w * 0.08);
      const times = [0, 280, 560, 920, 1280, 1750, 2200];
      times.forEach((t, i) => {
        window.setTimeout(() => {
          const cx = margin + Math.random() * (w - 2 * margin);
          const cy = h * (0.12 + Math.random() * 0.42);
          burst(cx, cy, particles, i % 2 === 0 ? 1 : 0.85);
        }, t);
      });
    };

    scheduleBursts();

    const gravity = 0.09;

    const tick = (now) => {
      const elapsed = now - startedAt;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.992;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > h + 40 || p.x < -40 || p.x > w + 40) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, p.life)) * 0.92;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (elapsed < durationMs || particles.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        onFinishedRef.current?.();
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pyramid-fireworks-root" aria-hidden="true">
      <canvas ref={canvasRef} className="pyramid-fireworks-canvas" />
    </div>
  );
}
