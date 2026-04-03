import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text } from 'react-native';
import colors from '../theme/colors';

const CustomButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isDisabled = loading || disabled;

  const animateTo = (toValue) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 25,
      bounciness: 5
    }).start();
  };

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
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.985)}
        onPressOut={() => animateTo(1)}
        disabled={isDisabled}
        style={[styles.button, variantContainerStyle, isDisabled && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color={isSecondary ? colors.primary : '#FFFFFF'} size="small" />
        ) : (
          <Text style={[styles.text, variantTextStyle, textStyle]}>{title}</Text>
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
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  secondaryButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  dangerButton: {
    backgroundColor: colors.danger
  },
  buttonDisabled: {
    opacity: 0.72,
    shadowOpacity: 0.02,
    elevation: 1
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2
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
