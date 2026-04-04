import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const PULL_DISTANCE = 80;
const TRIGGER_THRESHOLD = 60;

/**
 * Custom pull-to-refresh component with smooth animation
 * Wrap around ScrollView content
 */
const PullToRefresh = ({ children, onRefresh, refreshing = false }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullDistance = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate when pulling down at the top
        return gestureState.dy > 5 && gestureState.dy > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 && gestureState.dy <= PULL_DISTANCE) {
          pullDistance.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy >= TRIGGER_THRESHOLD && !isRefreshing) {
          // Trigger refresh
          triggerRefresh();
        } else {
          // Reset
          Animated.spring(pullDistance, {
            toValue: 0,
            useNativeDriver: false,
            friction: 8
          }).start();
        }
      }
    })
  ).current;

  const triggerRefresh = async () => {
    setIsRefreshing(true);

    // Animate to full pull position
    Animated.spring(pullDistance, {
      toValue: PULL_DISTANCE,
      useNativeDriver: false,
      friction: 8
    }).start();

    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      })
    ).start();

    // Execute refresh
    if (onRefresh) {
      await onRefresh();
    }

    // Reset
    spinValue.setValue(0);
    Animated.spring(pullDistance, {
      toValue: 0,
      useNativeDriver: false,
      friction: 8
    }).start(() => {
      setIsRefreshing(false);
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const opacity = pullDistance.interpolate({
    inputRange: [0, TRIGGER_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Refresh indicator */}
      <Animated.View
        style={[
          styles.refreshIndicator,
          {
            height: pullDistance,
            opacity
          }
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          {isRefreshing || refreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.pullIcon} />
          )}
        </Animated.View>
      </Animated.View>

      {/* Content */}
      <Animated.View style={{ transform: [{ translateY: pullDistance }] }}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  refreshIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  pullIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderTopColor: 'transparent'
  }
});

export default PullToRefresh;
