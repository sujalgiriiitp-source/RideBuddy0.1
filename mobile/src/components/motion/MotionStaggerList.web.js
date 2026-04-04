import React from 'react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

export const MotionStaggerList = ({ children }) => (
  <motion.div variants={container} initial="hidden" animate="show">
    {children}
  </motion.div>
);

export const MotionStaggerItem = ({ children }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);
