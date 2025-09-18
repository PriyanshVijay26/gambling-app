import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Confetti particles for wins
export const WinConfetti = ({ active, onComplete }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const particles = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.3,
        life: 1,
        decay: 0.995
      });
    }

    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;

      particles.forEach(particle => {
        if (particle.life <= 0) return;

        // Update physics
        particle.vy += particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.life *= particle.decay;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        
        ctx.restore();

        if (particle.life > 0.01) activeParticles++;
      });

      if (activeParticles > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ zIndex: 9998 }}
    />
  );
};

// Floating coins animation
export const FloatingCoins = ({ count = 10, duration = 3000, onComplete }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const newCoins = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 50,
      size: Math.random() * 20 + 20,
      delay: i * 100
    }));
    setCoins(newCoins);

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [count, duration, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {coins.map(coin => (
        <motion.div
          key={coin.id}
          initial={{ 
            x: coin.x, 
            y: coin.y, 
            scale: 0,
            rotate: 0 
          }}
          animate={{ 
            y: -100, 
            scale: 1,
            rotate: 720 
          }}
          transition={{
            delay: coin.delay / 1000,
            duration: 2,
            ease: "easeOut"
          }}
          className="absolute"
          style={{
            width: coin.size,
            height: coin.size,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-lg flex items-center justify-center text-yellow-900 font-bold">
            $
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Sparkling effect for buttons and interactive elements
export const SparkleEffect = ({ children, active = true, intensity = 'medium' }) => {
  const [sparkles, setSparkles] = useState([]);
  const containerRef = useRef(null);

  const intensityConfig = {
    low: { count: 3, size: 2, duration: 1000 },
    medium: { count: 6, size: 3, duration: 1500 },
    high: { count: 10, size: 4, duration: 2000 }
  };

  const config = intensityConfig[intensity] || intensityConfig.medium;

  useEffect(() => {
    if (!active) return;

    const generateSparkles = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newSparkles = Array.from({ length: config.count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * config.size + 1,
        delay: Math.random() * 500
      }));

      setSparkles(prev => [...prev, ...newSparkles]);

      // Remove sparkles after animation
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => !newSparkles.includes(s)));
      }, config.duration);
    };

    const interval = setInterval(generateSparkles, 800);
    generateSparkles(); // Initial sparkles

    return () => clearInterval(interval);
  }, [active, config]);

  return (
    <div ref={containerRef} className="relative">
      {children}
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: sparkle.x,
            y: sparkle.y
          }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1.5, 0],
            rotate: 180
          }}
          transition={{
            delay: sparkle.delay / 1000,
            duration: 1.5,
            ease: "easeOut"
          }}
          className="absolute pointer-events-none"
          style={{
            width: sparkle.size,
            height: sparkle.size,
            left: sparkle.x,
            top: sparkle.y
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-yellow-200 to-yellow-400 rotate-45 rounded-sm shadow-lg" />
        </motion.div>
      ))}
    </div>
  );
};

// Pulse effect for important elements
export const PulseEffect = ({ children, color = 'blue', intensity = 'medium' }) => {
  const intensityConfig = {
    low: { scale: 1.02, shadow: '0 0 10px' },
    medium: { scale: 1.05, shadow: '0 0 20px' },
    high: { scale: 1.08, shadow: '0 0 30px' }
  };

  const config = intensityConfig[intensity] || intensityConfig.medium;

  const colorConfig = {
    blue: 'rgba(59, 130, 246, 0.4)',
    green: 'rgba(34, 197, 94, 0.4)',
    red: 'rgba(239, 68, 68, 0.4)',
    yellow: 'rgba(234, 179, 8, 0.4)',
    purple: 'rgba(147, 51, 234, 0.4)'
  };

  return (
    <motion.div
      animate={{
        scale: [1, config.scale, 1],
        boxShadow: [
          `${config.shadow} ${colorConfig[color] || colorConfig.blue}`,
          `${config.shadow} transparent`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Shake effect for errors or losses
export const ShakeEffect = ({ children, active = false, intensity = 'medium' }) => {
  const intensityConfig = {
    low: { x: [-2, 2, -2, 2, 0], duration: 0.3 },
    medium: { x: [-5, 5, -5, 5, 0], duration: 0.4 },
    high: { x: [-10, 10, -10, 10, 0], duration: 0.5 }
  };

  const config = intensityConfig[intensity] || intensityConfig.medium;

  return (
    <motion.div
      animate={active ? { x: config.x } : { x: 0 }}
      transition={{ 
        duration: config.duration,
        times: [0, 0.25, 0.5, 0.75, 1]
      }}
    >
      {children}
    </motion.div>
  );
};