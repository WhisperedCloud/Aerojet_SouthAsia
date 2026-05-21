'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Plane } from 'lucide-react';

export default function FlightCursor() {
  const [rotation, setRotation] = useState(0);
  
  // Spring settings optimized for smooth performance
  const mouseX = useSpring(0, { stiffness: 400, damping: 28 });
  const mouseY = useSpring(0, { stiffness: 400, damping: 28 });
  
  useEffect(() => {
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      
      // Calculate angle only if moved enough (saves performance)
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        // Math.atan2 returns angle in radians from -PI to PI
        // Plane icon natively points top-right (which is -45 degrees mathematically or 315)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        setRotation(angle + 45);
        lastX = e.clientX;
        lastY = e.clientY;
      }
      
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    // Use passive listener for better scroll/mouse performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden lg:flex items-center justify-center"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: '-50%',
        translateY: '-50%',
        width: 32,
        height: 32,
      }}
    >
      {/* Subtle engine glow */}
      <div className="absolute inset-0 bg-[#f5a623] rounded-full blur-md opacity-20" />
      
      {/* Airplane icon rotating towards movement direction */}
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
      >
        <Plane 
          className="w-5 h-5" 
          style={{ 
            color: '#f5a623', 
            fill: 'rgba(245,166,35,0.2)',
            filter: 'drop-shadow(0 0 4px rgba(245,166,35,0.6))' 
          }} 
        />
      </motion.div>
    </motion.div>
  );
}
