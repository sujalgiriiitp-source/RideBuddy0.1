/**
 * Modern Design System Tokens
 * Comprehensive design language with gradients, shadows, spacing, and animations
 */

const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
  '7xl': 64,
  '8xl': 80
};

// Responsive spacing helpers
const spacingHelpers = {
  screenPadding: 16,
  cardGap: 12,
  sectionGap: 24,
  componentGap: 8,
  iconMargin: 8,
  inputPadding: 12,
  buttonPadding: 16,
  safeAreaInset: 20
};

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  '2xl': 24,
  pill: 999,
  full: 9999
};

const typography = {
  hero: 32,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  caption: 12,
  styles: {
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
  }
};

const shadows = {
  none: { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0, shadowRadius: 0 },
  xs: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 4 },
  soft: { shadowColor: '#0B1220', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 12 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 16 },
  '2xl': { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 20 },
  strong: { shadowColor: '#0B1220', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 7 }
};

// Material Design Elevation System (dp values)
const elevation = {
  '0dp': { shadowColor: 'transparent', shadowOpacity: 0, elevation: 0, shadowRadius: 0 },
  '1dp': { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 1.5, elevation: 1 },
  '2dp': { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.14, shadowRadius: 2, elevation: 2 },
  '4dp': { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.14, shadowRadius: 4, elevation: 4 },
  '6dp': { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 6, elevation: 6 },
  '8dp': { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 8 },
  '12dp': { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 12 },
  '16dp': { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 16 },
  '24dp': { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 24 }
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
  glassDark: ['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.15)'],
  
  // New gradient combinations for ride cards
  sunset: ['#F59E0B', '#DC2626'],
  ocean: ['#06B6D4', '#2563EB'],
  forest: ['#10B981', '#059669'],
  twilight: ['#6366F1', '#7C3AED'],
  rose: ['#FB7185', '#EC4899'],
  amber: ['#FBBF24', '#F59E0B'],
  
  // Ride status gradients
  pending: ['#94A3B8', '#64748B'],
  active: ['#22c55e', '#16a34a'],
  completed: ['#06B6D4', '#0891B2']
};

const animation = {
  duration: {
    instant: 100,
    fast: 150,
    base: 200,
    slow: 300,
    slower: 400,
    slowest: 500,
    gentle: 600
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    cubic: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
  },
  spring: {
    gentle: { friction: 8, tension: 40 },
    default: { friction: 8, tension: 100 },
    snappy: { friction: 6, tension: 120 },
    bouncy: { friction: 4, tension: 100 }
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
  spacingHelpers,
  radius,
  typography,
  shadows,
  elevation,
  gradients,
  animation,
  transitions,
  zIndex
};