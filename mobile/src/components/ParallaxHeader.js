import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Animated parallax header for screens
 * Scrolls at different speed than content for depth effect
 */
const ParallaxHeader = ({
  children,
  scrollY,
  headerHeight = 200,
  minHeight = 80,
  gradient = ['#2563EB', '#1E40AF'],
  style
}) => {
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight / 2],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2, headerHeight],
    outputRange: [1, 0.8, 0.3],
    extrapolate: 'clamp'
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-headerHeight, 0],
    outputRange: [2, 1],
    extrapolate: 'clamp'
  });

  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: headerHeight,
          transform: [{ translateY: headerTranslate }, { scale: headerScale }],
          opacity: headerOpacity
        },
        style
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );
};

/**
 * Floating Action Button with entrance animation
 */
export const FloatingActionButton = ({ icon, onPress, bottom = 20, right = 20, style }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    if (onPress) onPress();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg']
  });

  return (
    <Animated.View
      style={[
        styles.fab,
        {
          bottom,
          right,
          transform: [{ scale: scaleAnim }, { rotate }]
        },
        style
      ]}
    >
      <LinearGradient
        colors={tokens.gradients.fab}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fabGradient}
      >
        <Pressable onPress={handlePress} style={styles.fabPressable}>
          {icon}
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    overflow: 'hidden'
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    ...tokens.shadows.lg,
    zIndex: tokens.zIndex.fab
  },
  fabGradient: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fabPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ParallaxHeader;
