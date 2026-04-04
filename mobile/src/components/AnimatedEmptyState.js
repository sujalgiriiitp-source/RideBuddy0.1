import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import tokens from '../theme/tokens';
import PremiumButton from './PremiumButton';

/**
 * Animated empty state with icon and optional action
 * Shows when no data is available
 */
const AnimatedEmptyState = ({
  icon = 'alert-circle-outline',
  title = 'No Data Found',
  message = 'There are no items to display at the moment.',
  actionText,
  onActionPress,
  iconColor = colors.primary,
  style
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();

    // Subtle floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        },
        style
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ translateY: bounceAnim }]
          }
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={64} color={iconColor} />
        </View>
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionText && onActionPress && (
        <View style={styles.actionContainer}>
          <PremiumButton
            title={actionText}
            onPress={onActionPress}
            variant="primary"
            size="md"
            fullWidth={false}
            style={styles.actionButton}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing['3xl'],
    paddingVertical: tokens.spacing['4xl']
  },
  iconContainer: {
    marginBottom: tokens.spacing['2xl']
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: tokens.typography.h3,
    fontWeight: '700',
    color: colors.text,
    marginBottom: tokens.spacing.md,
    textAlign: 'center'
  },
  message: {
    fontSize: tokens.typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300
  },
  actionContainer: {
    marginTop: tokens.spacing['2xl']
  },
  actionButton: {
    paddingHorizontal: tokens.spacing['3xl']
  }
});

export default AnimatedEmptyState;
