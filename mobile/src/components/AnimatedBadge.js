import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

/**
 * Animated badge for status indicators, counts, etc.
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  outlined = false,
  style,
  textStyle
}) => {
  const getVariantStyles = () => {
    const variants = {
      primary: {
        bg: colors.primary,
        text: colors.white,
        border: colors.primaryDark
      },
      success: {
        bg: colors.success,
        text: colors.white,
        border: colors.successDark
      },
      warning: {
        bg: colors.warning,
        text: colors.white,
        border: colors.warningDark
      },
      danger: {
        bg: colors.danger,
        text: colors.white,
        border: colors.dangerDark
      },
      info: {
        bg: colors.info,
        text: colors.white,
        border: colors.infoDark
      },
      neutral: {
        bg: colors.gray200,
        text: colors.text,
        border: colors.gray400
      }
    };

    return variants[variant] || variants.primary;
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: { paddingH: tokens.spacing.sm, paddingV: 2, fontSize: 11 },
      md: { paddingH: tokens.spacing.md, paddingV: 4, fontSize: 12 },
      lg: { paddingH: tokens.spacing.lg, paddingV: 6, fontSize: 14 }
    };

    return sizes[size] || sizes.md;
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: outlined ? 'transparent' : variantStyle.bg,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
          borderWidth: outlined ? 1 : 0,
          borderColor: variantStyle.border
        },
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: outlined ? variantStyle.bg : variantStyle.text,
            fontSize: sizeStyle.fontSize
          },
          textStyle
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: tokens.radius.pill,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3
  }
});

export default Badge;
