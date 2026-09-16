import React, { useEffect, useRef } from 'react';

export default function StarfieldCanvas({ count = 80, speed = 0.15, opacity = 0.6 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize stars with varying size and alpha
    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      speed: (Math.random() * 0.2 + 0.05) * speed,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseVal: Math.random() * Math.PI
    }));

    // Orbiting satellite dot
    const sat = {
      x: 0,
      y: height * 0.3,
      vx: 0.4,
      vy: 0.1,
      size: 1.8
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle stars
      for (const s of stars) {
        s.y -= s.speed;
        s.pulseVal += s.pulseSpeed;
        if (s.y < 0) {
          s.y = height;
          s.x = Math.random() * width;
        }

        const currentAlpha = (Math.sin(s.pulseVal) * 0.3 + 0.7) * s.alpha * opacity;
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw faint distant satellite
      sat.x += sat.vx;
      sat.y += sat.vy;
      if (sat.x > width + 20) {
        sat.x = -20;
        sat.y = Math.random() * height * 0.6;
      }
      ctx.fillStyle = 'rgba(0, 242, 254, 0.7)';
      ctx.beginPath();
      ctx.arc(sat.x, sat.y, sat.size, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity }}
    />
  );
}
