import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

/**
 * Animated progress bar with smooth transitions
 * Perfect for step indicators, loading progress, etc.
 */
const ProgressBar = ({
  progress = 0,
  height = 6,
  backgroundColor = colors.gray200,
  progressColor = colors.primary,
  animated = true,
  borderRadius = tokens.radius.pill,
  style
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: Math.min(Math.max(progress, 0), 100),
        friction: 8,
        tension: 40,
        useNativeDriver: false
      }).start();
    } else {
      animatedWidth.setValue(Math.min(Math.max(progress, 0), 100));
    }
  }, [progress, animated]);

  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
          borderRadius
        },
        style
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            width,
            backgroundColor: progressColor,
            borderRadius
          }
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden'
  },
  progress: {
    height: '100%'
  }
});

export default ProgressBar;
