import { motion } from 'motion/react';

export default function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }} 
      animate={{ opacity: 0 }} 
      transition={{ delay: 2, duration: 1 }}
      className="fixed inset-0 z-[100] bg-[#003366] flex flex-col items-center justify-center pointer-events-none"
    >
      <motion.h1 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-[#FF6600] text-8xl font-bold tracking-tighter"
      >
        KK
      </motion.h1>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white text-xl font-bold mt-4"
      >
        Kaushalya-Karnataka
      </motion.p>
    </motion.div>
  );
}
