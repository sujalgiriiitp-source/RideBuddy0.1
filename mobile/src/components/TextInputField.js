import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../theme/colors';

const TextInputField = ({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14
  },
  label: {
    marginBottom: 6,
    color: colors.text,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12
  }
});

export default TextInputField;
