import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import colors from '../theme/colors';

const PrimaryButton = ({ title, onPress, loading = false, variant = 'primary' }) => {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={[styles.button, isSecondary ? styles.secondaryButton : styles.primaryButton]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, isSecondary ? styles.secondaryText : styles.primaryText]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 6
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  secondaryButton: {
    backgroundColor: '#E0EDFF'
  },
  text: {
    fontSize: 16,
    fontWeight: '600'
  },
  primaryText: {
    color: '#fff'
  },
  secondaryText: {
    color: colors.primary
  }
});

export default PrimaryButton;
