/**
 * Modern Design System Tokens
 * Comprehensive design language with gradients, shadows, spacing, and animations
 */

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48
};

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999
};

const typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40, letterSpacing: -1 },
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 36, letterSpacing: -0.5 },
  h3: { fontSize: 24, fontWeight: '600', lineHeight: 32, letterSpacing: -0.25 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20, letterSpacing: 0.3 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 18 },
  tiny: { fontSize: 11, fontWeight: '500', lineHeight: 16 }
};

const shadows = {
  none: { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  xs: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2 },
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, elevation: 4 },
  soft: { shadowColor: '#0B1220', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, elevation: 6 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, elevation: 8 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, elevation: 12 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, elevation: 16 },
  strong: { shadowColor: '#0B1220', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 7 }
};

const gradients = {
  primary: ['#2563EB', '#1E40AF'],
  secondary: ['#7C3AED', '#5B21B6'],
  accent: ['#06B6D4', '#0891B2'],
  success: ['#22c55e', '#16a34a'],
  danger: ['#DC2626', '#991B1B'],
  warm: ['#F59E0B', '#D97706'],
  cool: ['#06B6D4', '#0EA5E9'],
  purple: ['#A855F7', '#7C3AED'],
  pink: ['#EC4899', '#DB2777'],
  vibrant: ['#6366F1', '#EC4899'],
  softSurface: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.75)'],
  fab: ['#2563EB', '#4F46E5'],
  glassLight: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'],
  glassDark: ['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.15)']
};

const animation = {
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
    slower: 400,
    slowest: 500
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    cubic: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
};

const transitions = {
  fast: 'all 150ms ease',
  base: 'all 200ms ease',
  slow: 'all 300ms ease'
};

const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  backdrop: 400,
  modal: 500,
  fab: 900
};

export default {
  spacing,
  radius,
  typography,
  shadows,
  gradients,
  animation,
  transitions,
  zIndex
};