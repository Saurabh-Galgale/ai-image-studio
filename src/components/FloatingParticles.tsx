import { motion } from "framer-motion";

const FloatingParticles = () => {
  const particles = Array.from({ length: 20 });

  const getRandomWidth = () =>
    typeof window !== "undefined" ? window.innerWidth : 1000;

  const getRandomHeight = () =>
    typeof window !== "undefined" ? window.innerHeight : 1000;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full shadow-lg shadow-indigo-500/50"
          initial={{
            x: Math.random() * getRandomWidth(),
            y: Math.random() * getRandomHeight(),
          }}
          animate={{
            x: Math.random() * getRandomWidth(),
            y: Math.random() * getRandomHeight(),
            scale: [1, 2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
