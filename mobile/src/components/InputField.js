import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../theme/colors';

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
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (nextFocused) => {
    setFocused(nextFocused);
    Animated.timing(scale, {
      toValue: nextFocused ? 1.01 : 1,
      duration: 140,
      useNativeDriver: true
    }).start();
  };

  return (
    <View style={[styles.wrapper, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.shell,
          focused && styles.shellFocused,
          !!error && styles.shellError,
          { transform: [{ scale }] }
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
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
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
    letterSpacing: 0.2
  },
  shell: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3
  },
  shellFocused: {
    borderColor: colors.primary,
    shadowOpacity: 0.12
  },
  shellError: {
    borderColor: colors.danger,
    shadowOpacity: 0.08
  },
  input: {
    height: 54,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text
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
