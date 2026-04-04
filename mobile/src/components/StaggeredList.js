import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * Stagger animation for list items
 * Provides a cascade effect when lists mount
 */
const StaggeredList = ({ children, staggerDelay = 100, style }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <View style={style}>
      {childrenArray.map((child, index) => (
        <StaggeredItem key={index} delay={index * staggerDelay}>
          {child}
        </StaggeredItem>
      ))}
    </View>
  );
};

const StaggeredItem = ({ children, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}
    >
      {children}
    </Animated.View>
  );
};

export default StaggeredList;
export { StaggeredItem };
