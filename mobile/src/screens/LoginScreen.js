import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import AnimatedReveal from '../components/AnimatedReveal';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

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
      <AnimatedReveal>
        <View style={styles.container}>
          <View style={styles.brandRow}>
            <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
              <Ionicons name="car-sport" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={styles.title}>RideBuddy</Text>
              <Text style={styles.subtitle}>Welcome back. Find your next ride in seconds.</Text>
            </View>
          </View>

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
            icon="mail-outline"
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
            icon="lock-closed-outline"
            error={errors.password}
          />
          <CustomButton title="Login" onPress={handleLogin} loading={loading} icon="log-in-outline" disabled={loading || !email.trim() || !password} />
          <CustomButton title="Create Account" onPress={() => navigation.navigate('Signup')} variant="secondary" icon="person-add-outline" style={styles.secondaryCta} />
          </View>
        </View>
      </AnimatedReveal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12
  },
  logoBubble: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.strong
  },
  title: {
    fontSize: tokens.typography.hero,
    fontWeight: '800',
    color: colors.text
  },
  subtitle: {
    marginTop: 8,
    color: colors.mutedText,
    marginBottom: 16
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: '#D9E4FA',
    padding: 18,
    ...tokens.shadows.soft
  },
  secondaryCta: {
    marginTop: 8
  }
});

export default LoginScreen;
