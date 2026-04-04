import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(value ? 1 : 0)).current;

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

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={[
          styles.shell,
          focused && styles.shellFocused,
          !!error && styles.shellError,
          { transform: [{ scale }] }
        ]}
      >
        {icon ? (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={17} color={focused ? colors.primary : colors.mutedText} />
          </View>
        ) : null}
        {!!label ? <Animated.Text style={[styles.floatingLabel, floatingLabelStyle]}>{label}</Animated.Text> : null}
        <TextInput
          style={[styles.input, icon ? styles.inputWithIcon : undefined, inputStyle]}
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
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#D9E3F8',
    backgroundColor: 'rgba(255,255,255,0.88)',
    minHeight: 58,
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
  iconWrap: {
    position: 'absolute',
    left: 14,
    top: 21,
    zIndex: 2
  },
  input: {
    height: 58,
    paddingHorizontal: 16,
    paddingTop: 22,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text
  },
  inputWithIcon: {
    paddingLeft: 40
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
