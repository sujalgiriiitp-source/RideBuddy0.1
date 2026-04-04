import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
  style,
  inputStyle,
  icon,
  haptics = true,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(value ? 1 : 0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const shouldLift = focused || !!value;

  useEffect(() => {
    Animated.timing(lift, {
      toValue: shouldLift ? 1 : 0,
      duration: 180,
      useNativeDriver: false
    }).start();
  }, [lift, shouldLift]);

  const animate = (nextFocused) => {
    setFocused(nextFocused);
    
    // Haptic feedback on focus
    if (nextFocused && haptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.parallel([
      Animated.timing(scale, {
        toValue: nextFocused ? 1.01 : 1,
        duration: 140,
        useNativeDriver: true
      }),
      Animated.timing(lift, {
        toValue: nextFocused || !!value ? 1 : 0,
        duration: 180,
        useNativeDriver: false
      }),
      // Border glow animation
      Animated.timing(glowAnim, {
        toValue: nextFocused ? 1 : 0,
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
        ? colors.mutedText
        : colors.lightText
  };

  const borderGlow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(37, 99, 235, 0)', colors.glow.primary]
  });

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={[
          styles.shell,
          focused && styles.shellFocused,
          !!error && styles.shellError,
          { 
            transform: [{ scale }],
            shadowColor: borderGlow
          }
        ]}
      >
        {!!label ? <Animated.Text style={[styles.floatingLabel, floatingLabelStyle]}>{label}</Animated.Text> : null}
        <View style={styles.inputContainer}>
          {icon ? (
            <View style={styles.iconWrap}>
              <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.mutedText} />
            </View>
          ) : null}
          <TextInput
            style={[styles.input, inputStyle]}
            value={value}
            onChangeText={onChangeText}
            placeholder={focused ? placeholder : ''}
            placeholderTextColor="#9AA4B2"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
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
    marginBottom: 16
  },
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#D9E3F8',
    backgroundColor: 'rgba(255,255,255,0.88)',
    minHeight: 56,
    paddingVertical: 12,
    ...tokens.shadows.soft
  },
  shellFocused: {
    borderColor: colors.primary,
    shadowOpacity: 0.16
  },
  shellError: {
    borderColor: colors.danger,
    shadowOpacity: 0.08
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    fontWeight: '700'
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    width: 24,
    height: 24
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    paddingTop: 6,
    lineHeight: 20,
    verticalAlign: 'middle'
  },
  errorText: {
    marginTop: 7,
    marginLeft: 2,
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600'
  }
});

export default InputField;
