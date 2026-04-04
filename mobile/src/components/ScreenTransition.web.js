import React from 'react';
import { motion } from 'framer-motion';
import ScreenContainer from './ScreenContainer';

const variants = {
  none: {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  slide: {
    initial: { y: 28 },
    animate: { y: 0 }
  },
  fadeSlide: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 }
  }
};

const ScreenTransition = ({ children, duration = 400, variant = 'fadeSlide' }) => {
  const selected = variants[variant] || variants.fadeSlide;

  return (
    <ScreenContainer>
      <motion.div
        initial={selected.initial}
        animate={selected.animate}
        transition={{ duration: duration / 1000, ease: 'easeOut' }}
        style={{ height: '100%' }}
      >
        {children}
      </motion.div>
    </ScreenContainer>
  );
};

export default ScreenTransition;
