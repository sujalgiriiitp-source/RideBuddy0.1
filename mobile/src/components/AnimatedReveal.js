import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';

const AnimatedReveal = ({
  children,
  delay = 0,
  duration = 380,
  fromY = 14,
  style
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(fromY);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
  }, [delay, duration, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedReveal;