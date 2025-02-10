import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '../../lib/utils';

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  color?: string;
}

export function Particles({
  className,
  quantity = 100,
  staticity = 0,
  ease = 30,
  color = "#fff"
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const particleColor = color || (theme === 'dark' ? '#fff' : '#000');

    let width = 0;
    let height = 0;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      origX: number;
      origY: number;
      isComet: boolean;
      angle: number;
      radius: number;
    }> = [];

    const centerX = () => width / 2;
    const centerY = () => height / 2;
    const rotationSpeed = 0.0005;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const createParticles = () => {
      particles = Array.from({ length: quantity }, (_, index) => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 0.5;
        const isComet = Math.random() < 0.01; // 1% chance to be a comet
        const baseSpeed = isComet ? 10.0 : 0.1; // Comets are faster
        const angle = Math.atan2(y - centerY(), x - centerX());
        const radius = Math.sqrt((x - centerX()) ** 2 + (y - centerY()) ** 2);
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * baseSpeed + 0.05,
          vy: (Math.random() - 0.5) * baseSpeed + 0.05,
          size,
          origX: x,
          origY: y,
          isComet,
          angle,
          radius
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        if (particle.isComet) {
          let tailLength = 10;
          let alpha = 0.7;
          for (let i = 0; i < tailLength; i++) {
            ctx.fillStyle = particleColor;
            ctx.globalAlpha = alpha *= 0.7;
            ctx.beginPath();
            ctx.arc(particle.x - i * particle.vx, particle.y - i * particle.vy,
                    particle.size * (1 - i * 0.05), 0, 2 * Math.PI);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = particleColor;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1; // Reset alpha after drawing
    };

    const update = () => {
      particles.forEach((particle) => {
        if (!particle.isComet) {
          particle.angle += rotationSpeed;
          particle.x = centerX() + particle.radius * Math.cos(particle.angle);
          particle.y = centerY() + particle.radius * Math.sin(particle.angle);
        } else {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x > width) particle.x = 0;
          if (particle.x < 0) particle.x = width;
          if (particle.y > height) particle.y = 0;
          if (particle.y < 0) particle.y = height;
        }
      });
    };

    const loop = () => {
      update();
      draw();
      window.requestAnimationFrame(loop);
    };

    const init = () => {
      resize();
      createParticles();
      loop();
    };

    init();

    window.addEventListener('resize', () => {
      resize();
      createParticles(); // Re-create particles on resize
    });

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [quantity, staticity, ease, color, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
      aria-hidden="true"
    />
  );
}
