import React from 'react';
import { motion } from 'framer-motion';

const MotionPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    style={{ height: '100%' }}
  >
    {children}
  </motion.div>
);

export default MotionPage;
