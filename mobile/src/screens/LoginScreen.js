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
  const isDesktop = Platform.OS === 'web' && width >= 980;
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
          <LinearGradient colors={['#0B1E4B', '#1a56db', '#1e40af']} style={styles.leftPanel}>
            <View style={styles.brandRow}>
              <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
                <Ionicons name="car-sport" size={20} color={colors.white} />
              </LinearGradient>
              <View>
                <Text style={styles.leftTitle}>RideBuddy</Text>
                <Text style={styles.leftSubtitle}>Share rides, save money</Text>
              </View>
            </View>
            <View style={styles.illustrationCard}>
              <Ionicons name="people-circle-outline" size={120} color="rgba(255,255,255,0.9)" />
              <Text style={styles.illustrationText}>Premium campus ride sharing for modern commuters</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.brandRow}>
            <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
              <Ionicons name="car-sport" size={20} color={colors.white} />
            </LinearGradient>
            <View>
              <Text style={styles.title}>RideBuddy</Text>
              <Text style={styles.subtitle}>Share rides, save money</Text>
            </View>
          </View>
        )}

        <PremiumCard glass elevation="md" style={[styles.formCard, isDesktop && styles.formCardDesktop]}>
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
            <Text style={styles.forgotLink}>Forgot Password?</Text>
          </Pressable>
          <PremiumButton
            title="Create Account"
            onPress={() => navigation.navigate('Signup')}
            variant="secondary"
            icon="person-add-outline"
            style={styles.secondaryCta}
            fullWidth
          />
          <View style={styles.socialWrap}>
            <Text style={styles.socialLabel}>or continue with</Text>
            <View style={styles.socialRow}>
              <Pressable style={styles.socialBtn}><Ionicons name="logo-google" size={18} color="#DB4437" /><Text style={styles.socialText}>Google</Text></Pressable>
              <Pressable style={styles.socialBtn}><Ionicons name="logo-apple" size={18} color="#111827" /><Text style={styles.socialText}>Apple</Text></Pressable>
            </View>
          </View>
          <Text style={styles.legalText}>
            By signing up, you agree to our{' '}
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
  desktopContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between'
  },
  leftPanel: {
    flex: 1,
    borderRadius: tokens.radius.xxl,
    padding: tokens.spacing['3xl'],
    marginRight: tokens.spacing['2xl'],
    justifyContent: 'space-between'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.lg
  },
  leftTitle: {
    ...tokens.typography.styles.h2,
    color: '#FFFFFF'
  },
  leftSubtitle: {
    ...tokens.typography.styles.body,
    color: 'rgba(255,255,255,0.85)'
  },
  illustrationCard: {
    marginTop: tokens.spacing['3xl'],
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: tokens.spacing.xl,
    alignItems: 'center'
  },
  illustrationText: {
    marginTop: tokens.spacing.md,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 22
  },
  formCard: {
    width: '100%'
  },
  formCardDesktop: {
    flex: 1,
    maxWidth: 520,
    justifyContent: 'center'
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
    marginTop: tokens.spacing.sm
  },
  forgotLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right'
  },
  socialWrap: {
    marginTop: tokens.spacing.lg
  },
  socialLabel: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 12,
    marginBottom: tokens.spacing.sm,
    fontWeight: '600'
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10
  },
  socialBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF'
  },
  socialText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 13
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
