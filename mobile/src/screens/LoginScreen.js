import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!isValidEmail.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'Please fix form errors' });
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      Toast.show({ type: 'success', text1: 'Welcome back!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>RideBuddy</Text>
        <Text style={styles.subtitle}>Welcome back. Find your next ride in seconds.</Text>

        <View style={styles.card}>
          <InputField
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="you@email.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <InputField
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            placeholder="Enter password"
            secureTextEntry
            error={errors.password}
          />
          <CustomButton title="Login" onPress={handleLogin} loading={loading} disabled={loading || !email.trim() || !password} />
          <CustomButton title="Create Account" onPress={() => navigation.navigate('Signup')} variant="secondary" style={styles.secondaryCta} />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text
  },
  subtitle: {
    marginTop: 8,
    color: colors.mutedText,
    marginBottom: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  secondaryCta: {
    marginTop: 8
  }
});

export default LoginScreen;
