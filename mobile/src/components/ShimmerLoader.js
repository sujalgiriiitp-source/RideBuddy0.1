import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

/**
 * Shimmer skeleton loader for better perceived performance
 * Use while loading ride cards, lists, or any content
 */
const ShimmerLoader = ({ width = '100%', height = 100, borderRadius = tokens.radius.lg, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350]
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius
        },
        style
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }]
          }
        ]}
      >
        <LinearGradient
          colors={[colors.gray200, colors.gray100, colors.gray200]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

/**
 * Pre-built skeleton for ride card
 */
export const RideCardSkeleton = () => (
  <View style={styles.rideCardSkeleton}>
    <ShimmerLoader height={120} borderRadius={tokens.radius.lg} />
    <View style={styles.skeletonContent}>
      <ShimmerLoader width="70%" height={20} borderRadius={tokens.radius.sm} />
      <View style={styles.skeletonRow}>
        <ShimmerLoader width="45%" height={16} borderRadius={tokens.radius.sm} />
        <ShimmerLoader width="45%" height={16} borderRadius={tokens.radius.sm} />
      </View>
      <ShimmerLoader width="100%" height={40} borderRadius={tokens.radius.md} />
    </View>
  </View>
);

/**
 * Pre-built skeleton for list items
 */
export const ListItemSkeleton = ({ count = 5 }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <View key={i} style={styles.listItemSkeleton}>
        <ShimmerLoader width={50} height={50} borderRadius={tokens.radius.full} />
        <View style={styles.listItemContent}>
          <ShimmerLoader width="80%" height={18} borderRadius={tokens.radius.sm} />
          <ShimmerLoader width="60%" height={14} borderRadius={tokens.radius.sm} style={{ marginTop: 6 }} />
        </View>
      </View>
    ))}
  </>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray200,
    overflow: 'hidden'
  },
  shimmer: {
    width: '100%',
    height: '100%'
  },
  gradient: {
    flex: 1,
    width: 350
  },
  rideCardSkeleton: {
    backgroundColor: colors.white,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    ...tokens.shadows.sm
  },
  skeletonContent: {
    marginTop: tokens.spacing.md,
    gap: tokens.spacing.md
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.lg,
    backgroundColor: colors.white,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.sm,
    gap: tokens.spacing.md
  },
  listItemContent: {
    flex: 1
  }
});

export default ShimmerLoader;
