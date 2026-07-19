import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function GlowBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Floating Japanese fighter/battle terms
  const kanji = ["闘", "斬", "極", "刃", "影", "勇", "覇", "天"];

  useEffect(() => {
    // Generate organic particles for floating effect
    const temp: Particle[] = [];
    for (let i = 0; i < 25; i++) {
      temp.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size: Math.random() * 3 + 2, // 2px to 5px
        duration: Math.random() * 15 + 15, // 15s to 30s
        delay: Math.random() * -20 // offset delay to start floating immediately
      });
    }
    setParticles(temp);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Mystical deep charcoal/green background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-[#040605] to-brand-black opacity-95" />

      {/* Radiant glow spotlights from Elegant Dark design */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-brown/40 opacity-35 filter blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-gold/10 opacity-15 filter blur-[150px]" />

      {/* Vertical Japanese Script Style Decorative Text */}
      <div className="absolute right-8 top-24 text-brand-gold text-4xl md:text-5xl opacity-15 font-serif leading-none select-none z-10" style={{ writingMode: "vertical-rl" }}>
        最強の百人
      </div>

      {/* Atmospheric Fog Clouds */}
      <div className="absolute top-[10%] -left-[10%] w-[120%] h-[60%] opacity-15 filter blur-3xl pointer-events-none">
        <div className="absolute w-full h-full bg-gradient-to-r from-brand-brown via-[#0A110D] to-brand-black fog-bg" />
      </div>
      <div className="absolute bottom-[5%] -right-[15%] w-[130%] h-[40%] opacity-15 filter blur-3xl pointer-events-none">
        <div className="absolute w-full h-full bg-gradient-to-l from-brand-gold/20 via-brand-brown to-transparent fog-bg" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Floating Gold Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-brand-gold opacity-30 shadow-[0_0_8px_#C6FF00]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          animate={{
            y: ["0vh", "-110vh"],
            x: ["0px", `${Math.sin(p.id) * 30}px`, "0px"],
            opacity: [0, 0.4, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Ambient Floating Japanese Kanji Cryptograms */}
      {kanji.map((char, index) => {
        const leftPos = (index * 12) + 6 + Math.random() * 4;
        const speed = 25 + (index % 3) * 10;
        const delay = index * -5;
        const scale = 0.8 + (index % 2) * 0.4;
        
        return (
          <motion.div
            key={index}
            className="absolute font-serif text-brand-gold text-[12vmin] font-bold tracking-widest leading-none pointer-events-none select-none opacity-5 hover:opacity-10 transition-opacity"
            style={{
              left: `${leftPos}%`,
              top: "105%",
            }}
            animate={{
              y: ["0%", "-115vh"],
              rotate: [0, index % 2 === 0 ? 15 : -15],
            }}
            transition={{
              duration: speed,
              repeat: Infinity,
              delay: delay,
              ease: "linear",
            }}
          >
            {char}
          </motion.div>
        );
      })}
    </div>
  );
}
