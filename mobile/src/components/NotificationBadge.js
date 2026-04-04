import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';

const NotificationBadge = ({ count, animated = true, size = 'md' }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (count > 0 && animated) {
      Animated.sequence([
        Animated.spring(animatedValue, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true
        }),
        Animated.spring(animatedValue, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [count]);

  if (count === 0) {
    return null;
  }

  const displayCount = count > 99 ? '99+' : count.toString();
  const badgeSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          width: displayCount.length > 2 ? badgeSize + 8 : badgeSize,
          height: badgeSize,
          transform: animated ? [{ scale: animatedValue }] : []
        }
      ]}
    >
      <Text style={[styles.badgeText, { fontSize: size === 'sm' ? 10 : size === 'lg' ? 14 : 11 }]}>
        {displayCount}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.error,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundMain,
    minWidth: 20
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center'
  }
});

export default NotificationBadge;
