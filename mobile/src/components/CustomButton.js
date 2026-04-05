import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const CustomButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
  textStyle,
  haptics = true
}) => {
  const scale = useSharedValue(1);
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isDisabled = loading || disabled;

  const animateTo = (toValue, triggerHaptic = false) => {
    if (triggerHaptic && haptics && Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    scale.value = withSpring(toValue, {
      damping: 16,
      stiffness: 220,
      mass: 0.5
    });
  };

  const wrapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const variantContainerStyle = isDanger
    ? styles.dangerButton
    : isSecondary
      ? styles.secondaryButton
      : styles.primaryButton;

  const variantTextStyle = isDanger
    ? styles.dangerText
    : isSecondary
      ? styles.secondaryText
      : styles.primaryText;

  return (
    <Animated.View style={[styles.wrap, wrapAnimatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.97, true)}
        onPressOut={() => animateTo(1)}
        disabled={isDisabled}
        style={({ pressed, hovered }) => [
          styles.button,
          variantContainerStyle,
          hovered && !isDisabled && styles.buttonHovered,
          pressed && !isDisabled && styles.buttonPressed,
          isDisabled && styles.buttonDisabled
        ]}
      >
        {isSecondary ? (
          loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              {icon ? <Ionicons name={icon} size={18} color={colors.primary} /> : null}
              <Text style={[styles.text, styles.secondaryText, textStyle]}>{title}</Text>
            </>
          )
        ) : (
          <LinearGradient colors={isDanger ? ['#DC2626', '#B91C1C'] : tokens.gradients.primary} style={styles.gradientFill}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                {icon ? <Ionicons name={icon} size={18} color="#FFFFFF" /> : null}
                <Text style={[styles.text, variantTextStyle, textStyle]}>{title}</Text>
              </>
            )}
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%'
  },
  button: {
    height: 54,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gradientFill: {
    width: '100%',
    height: '100%',
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...tokens.shadows.strong
  },
  primaryButton: {
    backgroundColor: 'transparent'
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: '#D7E4FF',
    flexDirection: 'row',
    gap: 8,
    ...tokens.shadows.soft
  },
  dangerButton: {
    backgroundColor: 'transparent'
  },
  buttonDisabled: {
    opacity: 0.72,
    shadowOpacity: 0.02,
    elevation: 1
  },
  buttonHovered: {
    opacity: 0.96
  },
  buttonPressed: {
    opacity: 0.9
  },
  text: {
    fontSize: 16,
    fontWeight: '800'
  },
  primaryText: {
    color: '#FFFFFF'
  },
  secondaryText: {
    color: '#1D4ED8'
  },
  dangerText: {
    color: '#FFFFFF'
  }
});

export default CustomButton;
