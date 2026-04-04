import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const PremiumCard = ({
  children,
  onPress,
  style,
  gradient = false,
  glass = false,
  pressable = false,
  padding = 'md',
  elevation = 'md'
}) => {
  const getPaddingValue = () => {
    const paddingMap = { sm: tokens.spacing.md, md: tokens.spacing.lg, lg: tokens.spacing.xl };
    return paddingMap[padding] || tokens.spacing.lg;
  };

  const shadowStyle = tokens.shadows[elevation] || tokens.shadows.md;

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          padding: getPaddingValue(),
          ...shadowStyle
        },
        style
      ]}
    >
      {children}
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={tokens.gradients.glassLight}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            padding: getPaddingValue(),
            ...shadowStyle
          },
          style
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (glass) {
    return (
      <View
        style={[
          styles.card,
          styles.glass,
          {
            padding: getPaddingValue(),
            ...shadowStyle,
            borderWidth: 1,
            borderColor: colors.glassBorder
          },
          style
        ]}
      >
        {children}
      </View>
    );
  }

  if (pressable && onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.card,
    overflow: 'hidden'
  },
  glass: {
    backgroundColor: colors.surfaceGlass,
    backdropFilter: 'blur(10px)'
  },
  pressed: {
    opacity: 0.9
  }
});

export default PremiumCard;
