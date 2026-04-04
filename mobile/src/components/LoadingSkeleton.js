import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const Skeleton = ({ width = '100%', height = 16, borderRadius = tokens.radius.md, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false
        })
      ])
    ).start();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3]
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: shimmerOpacity
        },
        style
      ]}
    />
  );
};

const SkeletonCard = ({ lines = 3, style }) => (
  <View style={[styles.cardSkeleton, style]}>
    <Skeleton height={24} width="80%" style={{ marginBottom: tokens.spacing.md }} />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={14}
        width={i === lines - 1 ? '60%' : '100%'}
        style={{ marginBottom: i === lines - 1 ? 0 : tokens.spacing.sm }}
      />
    ))}
  </View>
);

const SkeletonRideCard = () => (
  <View style={[styles.rideCardSkeleton, tokens.shadows.soft]}>
    <View style={styles.rideCardHeader}>
      <View style={{ flex: 1 }}>
        <Skeleton height={18} width="70%" style={{ marginBottom: tokens.spacing.sm }} />
        <Skeleton height={14} width="50%" />
      </View>
      <Skeleton width={40} height={40} borderRadius={tokens.radius.lg} />
    </View>
    <View style={styles.rideCardBody}>
      <View style={styles.routeItem}>
        <Skeleton width={20} height={20} borderRadius={10} />
        <Skeleton height={14} width="85%" style={{ marginLeft: tokens.spacing.md }} />
      </View>
      <View style={[styles.routeItem, { marginTop: tokens.spacing.md }]}>
        <Skeleton width={20} height={20} borderRadius={10} />
        <Skeleton height={14} width="75%" style={{ marginLeft: tokens.spacing.md }} />
      </View>
    </View>
  </View>
);

const LoadingSkeletonList = ({ count = 3, cardType = 'ride' }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={{ marginBottom: tokens.spacing.lg }}>
        {cardType === 'ride' ? <SkeletonRideCard /> : <SkeletonCard lines={3} />}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray200,
    borderRadius: tokens.radius.md
  },
  cardSkeleton: {
    padding: tokens.spacing.lg,
    backgroundColor: colors.card,
    borderRadius: tokens.radius.lg,
    ...tokens.shadows.soft
  },
  rideCardSkeleton: {
    padding: tokens.spacing.lg,
    backgroundColor: colors.card,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.lg
  },
  rideCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  rideCardBody: {
    marginTop: tokens.spacing.md
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

export { Skeleton, SkeletonCard, SkeletonRideCard, LoadingSkeletonList };
