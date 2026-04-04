import React, { useRef } from 'react';
import { Animated, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Universal pressable component with scale animation and haptic feedback
 * Perfect for buttons, cards, and any interactive element
 */
const PressableScale = ({
  children,
  onPress,
  onLongPress,
  scale = 0.95,
  haptics = true,
  disabled = false,
  style,
  animatedStyle,
  duration = 150,
  ...rest
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;

    Animated.spring(scaleAnim, {
      toValue: scale,
      useNativeDriver: true,
      friction: 8,
      tension: 100
    }).start();

    // Haptic feedback on press
    if (haptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (disabled) return;

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100
    }).start();
  };

  const handlePress = () => {
    if (disabled || !onPress) return;
    onPress();
  };

  const handleLongPress = () => {
    if (disabled || !onLongPress) return;

    // Stronger haptic for long press
    if (haptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onLongPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      disabled={disabled}
      style={style}
      {...rest}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }]
          },
          animatedStyle
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default PressableScale;
