import React, { useEffect, useRef } from 'react';

/**
 * Interface representing a delicate silver needle cross (+) glint
 */
interface CrossBling {
  id: number;
  x: number; // Viewport X
  y: number; // Viewport Y
  size: number; // Arm half-length in pixels
  rotation: number; // Subtle tilt angle
  age: number; // in milliseconds
  lifespan: number; // in milliseconds
  silverHue: 'diamond' | 'platinum' | 'ice';
}

export const GoldBlingOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let idCounter = 0;

    // Handle Retina / High DPI displays
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Active cross blings pool
    const sparkles: CrossBling[] = [];

    // Helper to spawn a new cross bling
    const createBling = (customX?: number, customY?: number): CrossBling => {
      // Sparkle size: 3.5px to 7px arm half-length
      const size = 3.5 + Math.random() * 3.5;
      const lifespan = 1500 + Math.random() * 1500; // 1.5s - 3.0s

      const hues: CrossBling['silverHue'][] = ['diamond', 'platinum', 'ice'];
      const silverHue = hues[Math.floor(Math.random() * hues.length)];

      const x = customX !== undefined ? customX : Math.random() * width;
      const y = customY !== undefined ? customY : Math.random() * height;

      // Pure upright cross (+) with very slight natural variation (0 to ±8 degrees)
      const rotation = (Math.random() - 0.5) * 0.14;

      return {
        id: ++idCounter,
        x,
        y,
        size,
        rotation,
        age: 0,
        lifespan,
        silverHue,
      };
    };

    // Populate initial sparkles
    for (let i = 0; i < 25; i++) {
      const sp = createBling();
      sp.age = Math.random() * sp.lifespan;
      sparkles.push(sp);
    }

    // Subtle interactive mouse bling
    let lastMouseSpawn = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMouseSpawn > 150) {
        lastMouseSpawn = now;
        if (Math.random() < 0.3) {
          const offsetX = (Math.random() - 0.5) * 40;
          const offsetY = (Math.random() - 0.5) * 40;
          sparkles.push(createBling(e.clientX + offsetX, e.clientY + offsetY));
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 60;
        const offsetY = (Math.random() - 0.5) * 60;
        sparkles.push(createBling(e.clientX + offsetX, e.clientY + offsetY));
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    // Drawing helper: Dấu thập (+) với 4 đầu nhọn hoắt, phần giữa KHÔNG phình to
    const drawNeedleCross = (
      targetCtx: CanvasRenderingContext2D,
      armLength: number,
      coreColor: string,
      midColor: string,
      tipColor: string
    ) => {
      // Bề ngang phần giữa cực kỳ thanh mảnh (0.45px - 0.85px)
      const halfThick = Math.max(0.45, Math.min(0.85, armLength * 0.09));

      // 1. Tia thẳng đứng (Vertical needle arm)
      const vGrad = targetCtx.createLinearGradient(0, -armLength, 0, armLength);
      vGrad.addColorStop(0, tipColor);
      vGrad.addColorStop(0.25, midColor);
      vGrad.addColorStop(0.5, coreColor);
      vGrad.addColorStop(0.75, midColor);
      vGrad.addColorStop(1, tipColor);

      targetCtx.fillStyle = vGrad;
      targetCtx.beginPath();
      targetCtx.moveTo(0, -armLength); // Đỉnh nhọn trên
      targetCtx.lineTo(halfThick, 0); // Điểm giao ngang bên phải
      targetCtx.lineTo(0, armLength); // Đỉnh nhọn dưới
      targetCtx.lineTo(-halfThick, 0); // Điểm giao ngang bên trái
      targetCtx.closePath();
      targetCtx.fill();

      // 2. Tia nằm ngang (Horizontal needle arm)
      const hGrad = targetCtx.createLinearGradient(-armLength, 0, armLength, 0);
      hGrad.addColorStop(0, tipColor);
      hGrad.addColorStop(0.25, midColor);
      hGrad.addColorStop(0.5, coreColor);
      hGrad.addColorStop(0.75, midColor);
      hGrad.addColorStop(1, tipColor);

      targetCtx.fillStyle = hGrad;
      targetCtx.beginPath();
      targetCtx.moveTo(-armLength, 0); // Đỉnh nhọn trái
      targetCtx.lineTo(0, halfThick); // Điểm giao dọc bên dưới
      targetCtx.lineTo(armLength, 0); // Đỉnh nhọn phải
      targetCtx.lineTo(0, -halfThick); // Điểm giao dọc bên trên
      targetCtx.closePath();
      targetCtx.fill();
    };

    let lastScanTime = 0;

    const render = (time: number) => {
      const delta = Math.min(time - lastTime, 100);
      lastTime = time;

      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Light blend mode cho hiệu ứng ánh kim lấp lánh phản quang
      ctx.globalCompositeOperation = 'lighter';

      // 1. Update and draw current sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.age += delta;

        if (s.age >= s.lifespan) {
          sparkles.splice(i, 1);
          continue;
        }

        const progress = s.age / s.lifespan;

        // Chu kỳ sáng: nở nhanh, nhấp nháy ánh kim, sau đó mờ dần
        let scale = 0;
        let alpha = 0;

        if (progress < 0.25) {
          const t = progress / 0.25;
          scale = t * (2 - t);
          alpha = scale * 0.95;
        } else if (progress < 0.65) {
          const shimmer = Math.sin((progress - 0.25) * Math.PI * 6 + s.id) * 0.08;
          scale = 1 + shimmer;
          alpha = 0.9 + shimmer;
        } else {
          const t = (progress - 0.65) / 0.35;
          scale = 1 - t * t;
          alpha = (1 - t) * 0.9;
        }

        const currentArm = s.size * Math.max(0, scale);
        if (currentArm <= 0.2 || alpha <= 0.01) continue;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);

        // Màu bạc ánh kim kim cương (Silver Diamond Bling)
        const coreColor = `rgba(255, 255, 255, ${alpha * 1.0})`; // Pure white diamond center
        let midColor = `rgba(248, 250, 252, ${alpha * 0.98})`; // Bright metallic silver
        let tipColor = `rgba(203, 213, 225, ${alpha * 0.25})`; // Platinum fade
        let glowColor = 'rgba(255, 255, 255, 0.85)';

        if (s.silverHue === 'platinum') {
          midColor = `rgba(226, 232, 240, ${alpha * 0.98})`;
          tipColor = `rgba(148, 163, 184, ${alpha * 0.25})`;
          glowColor = 'rgba(203, 213, 225, 0.8)';
        } else if (s.silverHue === 'ice') {
          midColor = `rgba(224, 242, 254, ${alpha * 0.98})`; // Subtle ice-blue crystal silver
          tipColor = `rgba(186, 230, 253, ${alpha * 0.25})`;
          glowColor = 'rgba(186, 230, 253, 0.75)';
        }

        // Đổ bóng sắc nét, sáng trong
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = Math.min(3.5, currentArm * 0.45);

        // Vẽ dấu thập (+)
        drawNeedleCross(ctx, currentArm, coreColor, midColor, tipColor);

        ctx.restore();
      }

      // 2. Replenish sparkles across the screen
      if (time - lastScanTime > 300) {
        lastScanTime = time;
        const targetCount = Math.floor((width * height) / 30000); 
        const maxSparkles = Math.min(targetCount, 60);
        
        if (sparkles.length < maxSparkles && Math.random() < 0.8) {
          sparkles.push(createBling());
          if (Math.random() < 0.5) {
            sparkles.push(createBling());
          }
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="gold-image-bling-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 125,
        display: 'block',
      }}
    />
  );
};

export default GoldBlingOverlay;
