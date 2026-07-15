import React, { useEffect, useRef } from 'react';

export default function WaterCanvas({ contaminationLevel = 20 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = 140;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let angle = 0;
    // Determine color based on contamination severity
    const getWaveColor = () => {
      if (contaminationLevel > 70) return 'rgba(239, 68, 68, 0.2)'; // Red / Critical
      if (contaminationLevel > 40) return 'rgba(245, 158, 11, 0.2)'; // Amber / Warning
      return 'rgba(20, 184, 166, 0.2)'; // Teal / Safe
    };

    const render = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getWaveColor();
      ctx.beginPath();
      
      // Basic sine wave equation mapping
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x++) {
        // Speed scaling up based on contamination metric severity
        const y = Math.sin(x * 0.006 + angle) * 18 + 70;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Alter horizontal phase angle based on contamination level speed
      angle += 0.015 + (contaminationLevel / 4000);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [contaminationLevel]);

  return <canvas ref={canvasRef} className="w-full pointer-events-none opacity-80 rounded-b-2xl" />;
}
