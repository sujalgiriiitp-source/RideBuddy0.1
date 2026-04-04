import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const PremiumInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  icon,
  style,
  inputStyle,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(value ? 1 : 0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  const shouldLift = focused || !!value;

  useEffect(() => {
    Animated.timing(lift, {
      toValue: shouldLift ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }, [lift, shouldLift]);

  const animate = (nextFocused) => {
    setFocused(nextFocused);
    Animated.parallel([
      Animated.timing(scale, {
        toValue: nextFocused ? 1.01 : 1,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(focusAnim, {
        toValue: nextFocused ? 1 : 0,
        duration: 150,
        useNativeDriver: false
      }),
      Animated.timing(lift, {
        toValue: nextFocused || !!value ? 1 : 0,
        duration: 200,
        useNativeDriver: false
      })
    ]).start();
  };

  const floatingLabelStyle = {
    top: lift.interpolate({ inputRange: [0, 1], outputRange: [17, 6] }),
    fontSize: lift.interpolate({ inputRange: [0, 1], outputRange: [15, 12] }),
    color: focused
      ? colors.primary
      : shouldLift
        ? colors.textSecondary
        : colors.lightText
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary]
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.12]
  });

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={[
          styles.shell,
          { transform: [{ scale }] },
          {
            borderColor,
            shadowOpacity
          },
          !!error && styles.shellError
        ]}
      >
        {!!label && (
          <Animated.Text style={[styles.floatingLabel, floatingLabelStyle]}>
            {label}
          </Animated.Text>
        )}
        <View style={styles.inputContainer}>
          {icon && (
            <View style={styles.iconWrap}>
              <Ionicons
                name={icon}
                size={18}
                color={focused ? colors.primary : colors.textTertiary}
              />
            </View>
          )}
          <TextInput
            style={[styles.input, inputStyle]}
            value={value}
            onChangeText={onChangeText}
            placeholder={focused ? placeholder : ''}
            placeholderTextColor={colors.lightText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            onFocus={() => animate(true)}
            onBlur={() => animate(false)}
            {...rest}
          />
        </View>
      </Animated.View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: tokens.spacing.lg
  },
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 56,
    paddingVertical: tokens.spacing.md,
    ...tokens.shadows.xs
  },
  shellError: {
    borderColor: colors.danger,
    shadowOpacity: 0.08
  },
  floatingLabel: {
    position: 'absolute',
    left: tokens.spacing.lg,
    fontWeight: '600',
    zIndex: 10
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
    width: 24,
    height: 24
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    paddingTop: tokens.spacing.sm,
    lineHeight: 20
  },
  errorText: {
    marginTop: tokens.spacing.sm,
    marginLeft: tokens.spacing.md,
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600'
  }
});

export default PremiumInput;
