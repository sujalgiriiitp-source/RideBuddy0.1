import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

/**
 * Animated success checkmark with confetti-like effect
 * Perfect for confirmation screens
 */
const SuccessAnimation = ({ visible = true, size = 80, onAnimationComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      // Checkmark animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 4,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true
        })
      ]).start();

      // Subtle rotation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }).start();

      // Confetti burst
      Animated.stagger(
        50,
        confettiAnims.map((anim) =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true
            })
          ])
        )
      ).start(() => {
        if (onAnimationComplete) onAnimationComplete();
      });
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const confettiPositions = [
    { x: 0, y: -60, rotation: '0deg' },
    { x: 50, y: -40, rotation: '45deg' },
    { x: 60, y: 0, rotation: '90deg' },
    { x: 40, y: 50, rotation: '135deg' },
    { x: -40, y: 50, rotation: '225deg' },
    { x: -60, y: 0, rotation: '270deg' }
  ];

  return (
    <View style={styles.container}>
      {/* Confetti particles */}
      {confettiAnims.map((anim, index) => {
        const pos = confettiPositions[index];
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, pos.y]
        });
        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, pos.x]
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                opacity: anim,
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: pos.rotation }
                ]
              }
            ]}
          >
            <View style={[styles.confettiDot, { backgroundColor: colors.success }]} />
          </Animated.View>
        );
      })}

      {/* Checkmark */}
      <Animated.View
        style={[
          styles.checkmarkContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: scaleAnim }, { rotate }]
          }
        ]}
      >
        <Ionicons name="checkmark-circle" size={size} color={colors.success} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  confetti: {
    position: 'absolute'
  },
  confettiDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  }
});

export default SuccessAnimation;
