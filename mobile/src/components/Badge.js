import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const Badge = ({
  label,
  variant = 'primary',
  size = 'md',
  style
}) => {
  const getVariantColors = () => {
    const variants = {
      primary: { bg: colors.primary, text: colors.white },
      secondary: { bg: colors.secondaryAccent, text: colors.white },
      success: { bg: colors.success, text: colors.white },
      danger: { bg: colors.danger, text: colors.white },
      warning: { bg: colors.warning, text: colors.white },
      light: { bg: colors.gray200, text: colors.text }
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: tokens.spacing.xs, fontSize: 11 };
      case 'lg':
        return { padding: tokens.spacing.md, fontSize: 14 };
      case 'md':
      default:
        return { padding: tokens.spacing.sm, fontSize: 12 };
    }
  };

  const { bg, text } = getVariantColors();
  const sizeStyle = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, paddingHorizontal: sizeStyle.padding },
        style
      ]}
    >
      <Text style={[styles.label, { color: text, fontSize: sizeStyle.fontSize }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
    alignSelf: 'flex-start'
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3
  }
});

export default Badge;
