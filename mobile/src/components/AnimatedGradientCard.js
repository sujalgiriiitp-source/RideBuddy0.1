import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const AnimatedGradientCard = ({
  children,
  onPress,
  style,
  gradient = 'primary',
  elevation = 'md',
  padding = 'lg',
  animateOnPress = true,
  glowOnPress = false,
  disabled = false
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const getGradientColors = () => {
    if (Array.isArray(gradient)) return gradient;
    return tokens.gradients[gradient] || tokens.gradients.primary;
  };

  const getPaddingValue = () => {
    const paddingMap = {
      sm: tokens.spacing.md,
      md: tokens.spacing.lg,
      lg: tokens.spacing.xl,
      xl: tokens.spacing['2xl']
    };
    return paddingMap[padding] || tokens.spacing.lg;
  };

  const handlePressIn = () => {
    if (!animateOnPress || disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        friction: 8,
        tension: 100
      }),
      glowOnPress && Animated.timing(shadowAnim, {
        toValue: 1,
        duration: tokens.animation.duration.fast,
        useNativeDriver: false
      })
    ]).start();
  };

  const handlePressOut = () => {
    if (!animateOnPress || disabled) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100
      }),
      glowOnPress && Animated.timing(shadowAnim, {
        toValue: 0,
        duration: tokens.animation.duration.base,
        useNativeDriver: false
      })
    ]).start();
  };

  const animatedShadow = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.shadows[elevation]?.shadowOpacity || 0.12, 0.25]
  });

  const cardContent = (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        {
          padding: getPaddingValue(),
          borderRadius: tokens.radius.lg
        }
      ]}
    >
      {children}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            ...tokens.shadows[elevation],
            shadowOpacity: animatedShadow
          },
          style
        ]}
      >
        <Pressable
          onPress={disabled ? null : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.pressable}
        >
          {cardContent}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        {
          ...tokens.shadows[elevation]
        },
        style
      ]}
    >
      {cardContent}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden'
  },
  pressable: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden'
  }
});

export default AnimatedGradientCard;
