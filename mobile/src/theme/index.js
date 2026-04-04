/**
 * Design System Safe Exports
 * Provides fallback values for web and prevents crashes
 */

import colorsBase from './colors';
import tokensBase from './tokens';

// Safe color exports with fallbacks
export const colors = {
  ...colorsBase,
  // Explicit fallbacks for critical values
  white: colorsBase.white || '#FFFFFF',
  black: colorsBase.black || '#000000',
  error: colorsBase.error || '#FF3B30',
  success: colorsBase.success || '#22c55e',
  warning: colorsBase.warning || '#F59E0B',
  info: colorsBase.info || '#06B6D4',
  primary: colorsBase.primary || '#2563EB',
  secondary: colorsBase.secondary || '#DBEAFE',
  background: colorsBase.background || '#EEF2FF',
  text: colorsBase.text || '#0F172A',
  textSecondary: colorsBase.textSecondary || '#475569',
  textTertiary: colorsBase.textTertiary || '#64748B',
  border: colorsBase.border || '#E2E8F0',
  transparent: 'transparent'
};

// Safe token exports with fallbacks
export const tokens = {
  ...tokensBase,
  spacing: tokensBase.spacing || {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20
  },
  borderRadius: tokensBase.borderRadius || tokensBase.radius || {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20
  },
  shadows: tokensBase.shadows || {
    sm: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 4 },
    md: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
    lg: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 12 }
  }
};

// Re-export defaults for compatibility
export default colors;

export { tokensBase as tokensFull };
