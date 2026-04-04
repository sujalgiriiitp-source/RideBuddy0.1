import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

/**
 * DistanceTimeDisplay Component
 * Display distance and estimated time with icons
 */
const DistanceTimeDisplay = ({ distance, duration, style, compact = false }) => {
  // Format distance
  const formatDistance = (meters) => {
    if (!meters) return '--';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (compact) {
    return (
      <View style={[styles.containerCompact, style]}>
        <View style={styles.itemCompact}>
          <Ionicons name="navigate" size={14} color={colors.primary} />
          <Text style={styles.textCompact}>{formatDistance(distance)}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.itemCompact}>
          <Ionicons name="time" size={14} color={colors.primary} />
          <Text style={styles.textCompact}>{formatDuration(duration)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.item}>
        <View style={styles.iconContainer}>
          <Ionicons name="navigate" size={20} color={colors.white} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{formatDistance(distance)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <View style={styles.iconContainer}>
          <Ionicons name="time" size={20} color={colors.white} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{formatDuration(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.md,
    ...tokens.shadows.md
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.sm
  },
  textContainer: {
    flex: 1
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
    marginHorizontal: tokens.spacing.md
  },
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: tokens.borderRadius.md,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs
  },
  itemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  textCompact: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
    marginHorizontal: tokens.spacing.xs
  }
});

export default DistanceTimeDisplay;
