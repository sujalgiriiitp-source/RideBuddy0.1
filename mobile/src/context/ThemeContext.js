
import React, { createContext, useContext, useMemo, useState } from 'react';
import colors from '../theme/colors';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((previous) => !previous);

  const palette = useMemo(() => {
    if (isDarkMode) {
      return {
        background: colors.dark.background,
        backgroundAlt: colors.dark.backgroundAlt,
        surface: colors.dark.surface,
        card: colors.dark.card,
        border: colors.dark.border,
        text: colors.dark.text,
        textSecondary: colors.dark.textSecondary,
        textTertiary: colors.dark.textTertiary,
        overlay: colors.dark.overlay,
        primary: colors.primary,
        secondaryAccent: colors.secondaryAccent,
        glassBorder: 'rgba(148,163,184,0.25)'
      };
    }

    return {
      background: colors.background,
      backgroundAlt: colors.backgroundAlt,
      surface: colors.surface,
      card: colors.card,
      border: colors.border,
      text: colors.text,
      textSecondary: colors.textSecondary,
      textTertiary: colors.textTertiary,
      overlay: colors.overlay,
      primary: colors.primary,
      secondaryAccent: colors.secondaryAccent,
      glassBorder: colors.glassBorder
    };
  }, [isDarkMode]);

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      theme: palette
    }),
    [isDarkMode, palette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
