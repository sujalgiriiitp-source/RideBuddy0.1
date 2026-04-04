import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

/**
 * Toast-style notification shown at top of screen
 * Appears when notification arrives in foreground
 */
const NotificationToast = ({ notification, onPress, onDismiss }) => {
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notification) {
      // Haptic feedback
      if (Platform.OS !== 'web' && Haptics?.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handleDismiss();
    if (onPress) onPress(notification);
  };

  if (!notification) {
    return null;
  }

  const { title, body } = notification.request.content;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <Pressable onPress={handlePress} style={styles.pressable}>
        <LinearGradient
          colors={[colors?.primary || '#2563EB', colors?.secondaryAccent || '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.body} numberOfLines={2}>
              {body}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: tokens?.spacing?.md || 16,
    right: tokens?.spacing?.md || 16,
    zIndex: 1000,
    ...(tokens?.shadows?.strong || {
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10
    })
  },
  pressable: {
    borderRadius: tokens?.borderRadius?.lg || tokens?.radius?.lg || 16
  },
  gradient: {
    borderRadius: tokens?.borderRadius?.lg || tokens?.radius?.lg || 16,
    padding: tokens?.spacing?.md || 16
  },
  content: {
    gap: tokens?.spacing?.xxs || 2
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors?.white || '#FFFFFF'
  },
  body: {
    fontSize: 14,
    color: colors?.white || '#FFFFFF',
    opacity: 0.9
  }
});

export default NotificationToast;
