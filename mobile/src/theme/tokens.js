const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
};

const radius = {
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999
};

const typography = {
  hero: 32,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  caption: 12
};

const shadows = {
  soft: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4
  },
  strong: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 7
  }
};

const gradients = {
  primary: ['#2563EB', '#7C3AED'],
  softSurface: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.75)'],
  fab: ['#2563EB', '#4F46E5']
};

export default {
  spacing,
  radius,
  typography,
  shadows,
  gradients
};