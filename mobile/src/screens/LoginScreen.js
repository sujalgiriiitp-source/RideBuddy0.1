import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 960;
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
      <View style={[styles.container, isDesktop && styles.desktopContainer]}>
        {isDesktop ? (
          <LinearGradient colors={['#0F1F4B', '#1a56db']} style={styles.leftPanel}>
            <View style={styles.leftBrandRow}>
              <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
                <Ionicons name="car-sport" size={20} color={colors.white} />
              </LinearGradient>
              <Text style={styles.leftTitle}>RideBuddy</Text>
            </View>
            <Text style={styles.leftHeadline}>Share rides, save money</Text>
            <Text style={styles.leftSubheadline}>Professional campus commuting, made simple.</Text>
            <View style={styles.illustrationWrap}>
              <Ionicons name="people-circle" size={86} color="rgba(255,255,255,0.9)" />
              <Ionicons name="car-sport" size={54} color="rgba(255,255,255,0.85)" />
            </View>
          </LinearGradient>
        ) : null}

        <View style={[styles.formPanel, !isDesktop && styles.mobilePanel]}>
          <View style={styles.brandRow}>
            <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
              <Ionicons name="car-sport" size={20} color={colors.white} />
            </LinearGradient>
            <View>
              <Text style={styles.title}>RideBuddy</Text>
              <Text style={styles.subtitle}>Share rides, save money</Text>
            </View>
          </View>

          <PremiumCard glass elevation="md" style={styles.formCard}>
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

          <Pressable onPress={() => navigation.navigate('Forgot Password')} style={styles.forgotLinkWrap}>
            <Text style={styles.forgotLinkText}>Forgot Password?</Text>
          </Pressable>

          <View style={styles.socialWrap}>
            <Text style={styles.socialLabel}>or continue with</Text>
            <View style={styles.socialRow}>
              <Pressable style={styles.socialButton}><Ionicons name="logo-google" size={16} color={colors.text} /><Text style={styles.socialText}>Google</Text></Pressable>
              <Pressable style={styles.socialButton}><Ionicons name="logo-apple" size={16} color={colors.text} /><Text style={styles.socialText}>Apple</Text></Pressable>
            </View>
          </View>

          <PremiumButton
            title="Create Account"
            onPress={() => navigation.navigate('Signup')}
            variant="secondary"
            icon="person-add-outline"
            style={styles.secondaryCta}
            fullWidth
          />
          <Text style={styles.legalText}>
            By signing up you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('Legal')}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => navigation.navigate('Legal')}>Privacy Policy</Text>
          </Text>
          </PremiumCard>
        </View>
      </View>
    </ScreenTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  desktopContainer: {
    flexDirection: 'row',
    gap: 0
  },
  leftPanel: {
    flex: 1,
    padding: 42,
    justifyContent: 'center'
  },
  formPanel: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing['2xl']
  },
  mobilePanel: {
    paddingVertical: tokens.spacing['2xl']
  },
  formCard: {
    borderRadius: 16
  },
  leftBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18
  },
  leftTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800'
  },
  leftHeadline: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 10,
    maxWidth: 420
  },
  leftSubheadline: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 420
  },
  illustrationWrap: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
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
  forgotLinkWrap: {
    marginTop: 8,
    alignSelf: 'flex-end'
  },
  forgotLinkText: {
    color: '#1a56db',
    fontSize: 13,
    fontWeight: '700'
  },
  socialWrap: {
    marginTop: 10
  },
  socialLabel: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 12,
    marginBottom: 8
  },
  socialRow: {
    flexDirection: 'row',
    gap: 8
  },
  socialButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF'
  },
  socialText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700'
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
