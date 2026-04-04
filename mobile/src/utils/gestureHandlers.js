import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';

/**
 * Gesture-based navigation utilities
 * Provides swipe-back and hardware back button handling
 */

/**
 * Hook for Android hardware back button
 * @param {Function} handler - Function to execute on back press
 * @param {Array} dependencies - Dependencies array
 */
export const useBackHandler = (handler, dependencies = []) => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (handler) {
        return handler();
      }
      return false;
    });

    return () => subscription.remove();
  }, dependencies);
};

/**
 * Hook for swipe-back gesture on iOS
 * Note: React Navigation handles this natively, but this is for custom implementations
 */
export const useSwipeBack = (navigation, enabled = true) => {
  useEffect(() => {
    if (!enabled || !navigation) return;

    navigation.setOptions({
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      gestureResponseDistance: 50
    });
  }, [navigation, enabled]);
};

/**
 * Debounce function for preventing rapid taps
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in ms
 */
export const useDebounce = (func, wait = 300) => {
  const timeout = useRef(null);

  return (...args) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Long press handler with haptic feedback
 * @param {Function} onLongPress - Callback for long press
 * @param {number} duration - Long press duration in ms
 */
export const useLongPress = (onLongPress, duration = 500) => {
  const timeout = useRef(null);
  const isLongPress = useRef(false);

  const handlePressIn = () => {
    isLongPress.current = false;
    timeout.current = setTimeout(() => {
      isLongPress.current = true;
      if (onLongPress) onLongPress();
    }, duration);
  };

  const handlePressOut = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    return isLongPress.current;
  };

  return {
    onPressIn: handlePressIn,
    onPressOut: handlePressOut
  };
};

export default {
  useBackHandler,
  useSwipeBack,
  useDebounce,
  useLongPress
};
