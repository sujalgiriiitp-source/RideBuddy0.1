import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import ScreenTransition from '../components/ScreenTransition';
import PremiumInput from '../components/PremiumInput';
import PremiumButton from '../components/PremiumButton';
import PremiumCard from '../components/PremiumCard';
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
      const message = String(error?.message || 'Unable to login right now.');
      const isWrongCredentials = /invalid|incorrect|credential|password|unauthorized|401/i.test(message);
      Toast.show({
        type: 'error',
        text1: isWrongCredentials ? 'Wrong email or password' : 'Login failed',
        text2: isWrongCredentials
          ? 'Please check your password and try again.'
          : message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenTransition variant="fadeSlide">
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
            <Ionicons name="car-sport" size={20} color={colors.white} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>RideBuddy</Text>
            <Text style={styles.subtitle}>Share rides, save money</Text>
          </View>
        </View>

        <PremiumCard glass elevation="md">
          <PremiumInput
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
          <PremiumInput
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
            showPasswordToggle
            icon="lock-closed-outline"
            error={errors.password}
          />
          <PremiumButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            icon="log-in-outline"
            disabled={loading || !email.trim() || !password}
            fullWidth
          />
          <PremiumButton
            title="Forgot Password?"
            onPress={() => navigation.navigate('Forgot Password')}
            variant="secondary"
            icon="help-circle-outline"
            fullWidth
            style={styles.forgotCta}
          />
          <PremiumButton
            title="Create Account"
            onPress={() => navigation.navigate('Signup')}
            variant="secondary"
            icon="person-add-outline"
            style={styles.secondaryCta}
            fullWidth
          />
          <Text style={styles.legalText}>
            By creating an account you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('Legal')}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('Legal')}>Privacy Policy</Text>
          </Text>
        </PremiumCard>
      </View>
    </ScreenTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: tokens.spacing['2xl']
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.lg
  },
  logoBubble: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.lg
  },
  title: {
    ...tokens.typography.styles.h2,
    color: colors.text,
    marginBottom: tokens.spacing.sm
  },
  subtitle: {
    ...tokens.typography.styles.body,
    color: colors.textSecondary,
    maxWidth: 280
  },
  secondaryCta: {
    marginTop: tokens.spacing.md
  },
  forgotCta: {
    marginTop: tokens.spacing.sm
  },
  legalText: {
    marginTop: tokens.spacing.md,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600'
  },
  legalLink: {
    color: colors.primary,
    fontWeight: '800'
  }
});

export default LoginScreen;
