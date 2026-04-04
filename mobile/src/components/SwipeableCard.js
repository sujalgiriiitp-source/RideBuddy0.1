import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

/**
 * Swipeable card with left/right actions
 * Perfect for quick actions like accept/reject, like/dislike
 */
const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActionColor = colors.danger,
  rightActionColor = colors.success,
  leftActionIcon = 'close-circle',
  rightActionIcon = 'checkmark-circle',
  disabled = false,
  style
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !disabled && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right
          swipeRight();
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left
          swipeLeft();
        } else {
          // Return to original position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 8
          }).start();
        }
      }
    })
  ).current;

  const swipeRight = () => {
    Animated.parallel([
      Animated.timing(pan.x, {
        toValue: SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: false
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false
      })
    ]).start(() => {
      if (onSwipeRight) onSwipeRight();
      resetPosition();
    });
  };

  const swipeLeft = () => {
    Animated.parallel([
      Animated.timing(pan.x, {
        toValue: -SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: false
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false
      })
    ]).start(() => {
      if (onSwipeLeft) onSwipeLeft();
      resetPosition();
    });
  };

  const resetPosition = () => {
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
  };

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  const leftActionOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const rightActionOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.container}>
      {/* Left action indicator */}
      <Animated.View
        style={[
          styles.actionIndicator,
          styles.leftAction,
          { backgroundColor: leftActionColor, opacity: leftActionOpacity }
        ]}
      >
        <Ionicons name={leftActionIcon} size={40} color={colors.white} />
      </Animated.View>

      {/* Right action indicator */}
      <Animated.View
        style={[
          styles.actionIndicator,
          styles.rightAction,
          { backgroundColor: rightActionColor, opacity: rightActionOpacity }
        ]}
      >
        <Ionicons name={rightActionIcon} size={40} color={colors.white} />
      </Animated.View>

      {/* Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          {
            transform: [{ translateX: pan.x }, { rotate }],
            opacity
          },
          style
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  actionIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: tokens.radius.lg,
    zIndex: -1
  },
  leftAction: {
    left: 0
  },
  rightAction: {
    right: 0
  }
});

export default SwipeableCard;
