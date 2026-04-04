/**
 * Modern Color System
 * Premium color palette with light and dark mode support
 */

const colors = {
  // ============================================
  // BACKGROUNDS (Light mode)
  // ============================================
  background: '#EEF2FF',
  backgroundAlt: '#F8FAFF',
  backgroundTertiary: '#F0F4F8',
  
  // ============================================
  // SURFACES
  // ============================================
  surface: 'rgba(255,255,255,0.88)',
  surfaceGlass: 'rgba(255,255,255,0.7)',
  card: 'rgba(255,255,255,0.9)',
  glassBorder: 'rgba(255,255,255,0.55)',
  overlay: 'rgba(0,0,0,0.25)',
  
  // ============================================
  // PRIMARY COLORS
  // ============================================
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1E40AF',
  primaryVibrant: '#2563EB',
  
  // ============================================
  // SECONDARY COLORS
  // ============================================
  secondary: '#DBEAFE',
  secondaryAccent: '#7C3AED',
  secondaryDark: '#6D28D9',
  
  // ============================================
  // ACCENT COLORS
  // ============================================
  accent: '#22c55e',
  accentLight: '#4ADE80',
  accentDark: '#16A34A',
  
  // ============================================
  // STATE COLORS
  // ============================================
  success: '#22c55e',
  successLight: '#86EFAC',
  successDark: '#15803D',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',
  danger: '#DC2626',
  dangerLight: '#FCA5A5',
  dangerDark: '#991B1B',
  info: '#06B6D4',
  infoLight: '#22D3EE',
  infoDark: '#0891B2',
  
  // ============================================
  // TEXT COLORS
  // ============================================
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  mutedText: '#64748B',
  lightText: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // ============================================
  // BORDER & DIVIDERS
  // ============================================
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  divider: 'rgba(0,0,0,0.08)',
  
  // ============================================
  // SHADOWS
  // ============================================
  shadow: '#0f172a',
  shadowLight: 'rgba(15,23,42,0.08)',
  shadowMedium: 'rgba(15,23,42,0.12)',
  shadowDark: 'rgba(15,23,42,0.16)',
  
  // ============================================
  // DARK MODE (Can be toggled)
  // ============================================
  dark: {
    background: '#0F172A',
    backgroundAlt: '#1E293B',
    surface: 'rgba(30,41,59,0.9)',
    surfaceGlass: 'rgba(30,41,59,0.7)',
    card: 'rgba(30,41,59,0.8)',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    border: '#334155',
    overlay: 'rgba(0,0,0,0.5)'
  },
  
  // ============================================
  // SPECIAL COLORS
  // ============================================
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // ============================================
  // GRADIENT GLOW EFFECTS (for micro-interactions)
  // ============================================
  glow: {
    primary: 'rgba(37, 99, 235, 0.2)',
    success: 'rgba(34, 197, 94, 0.2)',
    danger: 'rgba(220, 38, 38, 0.2)',
    warning: 'rgba(245, 158, 11, 0.2)',
    info: 'rgba(6, 182, 212, 0.2)'
  }
};

export default colors;

