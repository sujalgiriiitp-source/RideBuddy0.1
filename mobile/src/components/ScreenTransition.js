import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import ScreenContainer from './ScreenContainer';

const ScreenTransition = ({
  children,
  delay = 0,
  duration = 400,
  variant = 'fadeSlide'
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const startAnimation = setTimeout(() => {
      if (variant === 'fadeSlide' || variant === 'fade') {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true
        }).start();
      }

      if (variant === 'fadeSlide' || variant === 'slide') {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true
        }).start();
      }
    }, delay);

    return () => clearTimeout(startAnimation);
  }, [fadeAnim, slideAnim, delay, duration, variant]);

  const animatedStyle = {
    opacity: variant === 'none' ? 1 : fadeAnim,
    transform:
      variant === 'slide' || variant === 'fadeSlide'
        ? [{ translateY: slideAnim }]
        : undefined
  };

  return (
    <ScreenContainer>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {children}
      </Animated.View>
    </ScreenContainer>
  );
};

export default ScreenTransition;
