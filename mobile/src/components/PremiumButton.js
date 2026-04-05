import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const PremiumButton = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  style,
  fullWidth = true,
  ...rest
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8
    }).start();
  };

  const getGradient = () => {
    switch (variant) {
      case 'primary':
        return tokens.gradients.primary;
      case 'secondary':
        return tokens.gradients.secondary;
      case 'success':
        return tokens.gradients.success;
      case 'danger':
        return tokens.gradients.danger;
      case 'accent':
        return tokens.gradients.accent;
      default:
        return tokens.gradients.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSmall;
      case 'lg':
        return styles.sizeLarge;
      case 'md':
      default:
        return styles.sizeMedium;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.textSmall;
      case 'lg':
        return styles.textLarge;
      case 'md':
      default:
        return styles.textMedium;
    }
  };

  const isDisabledOrLoading = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={!isDisabledOrLoading ? onPress : null}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabledOrLoading}
        style={({ pressed, hovered }) => [
          styles.wrapper,
          fullWidth && styles.fullWidth,
          hovered && !isDisabledOrLoading && styles.hovered,
          pressed && !isDisabledOrLoading && styles.pressedWrap,
          isDisabledOrLoading && styles.disabledWrap,
          style
        ]}
        {...rest}
      >
        <LinearGradient
          colors={isDisabledOrLoading ? [colors.gray300, colors.gray400] : getGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, getSizeStyles(), isPressed && styles.pressed]}
        >
          <View style={styles.content}>
            {icon && !loading && (
              <Ionicons
                name={icon}
                size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
                color={colors.white}
                style={styles.icon}
              />
            )}
            {loading && (
              <View style={[styles.loader, { marginRight: tokens.spacing.sm }]}>
                <View style={[styles.loaderCircle, { borderColor: colors.white }]} />
              </View>
            )}
            <Text style={[styles.text, getTextSizeStyle()]}>
              {loading ? 'Loading...' : title}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderRadius: tokens.radius.lg
  },
  fullWidth: {
    width: '100%'
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: tokens.radius.lg,
    ...tokens.shadows.md,
    overflow: 'hidden'
  },
  hovered: {
    opacity: 0.96
  },
  pressedWrap: {
    opacity: 0.9
  },
  disabledWrap: {
    opacity: 0.72
  },
  pressed: {
    ...tokens.shadows.sm
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sizeSmall: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg
  },
  sizeMedium: {
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl
  },
  sizeLarge: {
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing['2xl']
  },
  text: {
    color: colors.white,
    fontWeight: '600',
    letterSpacing: 0.3
  },
  textSmall: {
    fontSize: 13,
    fontWeight: '600'
  },
  textMedium: {
    fontSize: 15,
    fontWeight: '600'
  },
  textLarge: {
    fontSize: 16,
    fontWeight: '700'
  },
  icon: {
    marginRight: tokens.spacing.sm
  },
  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: tokens.spacing.sm
  },
  loaderCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent'
  }
});

export default PremiumButton;
