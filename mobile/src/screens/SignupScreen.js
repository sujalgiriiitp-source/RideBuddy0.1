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

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const SignupScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 980;
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = ({ name, email, password }) => {
    const nextErrors = {};

    if (!name) {
      nextErrors.name = 'Name is required';
    }

    if (!email) {
      nextErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = async () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const phone = form.phone.trim();

    if (!validateForm({ name, email, password })) {
      Toast.show({ type: 'error', text1: 'Please fix form errors' });
      return;
    }

    try {
      setLoading(true);
      await signup({
        name,
        email,
        password,
        phone
      });
      Toast.show({ type: 'success', text1: 'Signup successful ✅' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Signup failed', text2: error.message || 'Failed to connect' });
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
              <Ionicons name="car-sport-outline" size={110} color="rgba(255,255,255,0.9)" />
              <Text style={styles.illustrationText}>Join a premium commuter network and move smarter every day.</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.brandRow}>
            <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
              <Ionicons name="car-sport" size={20} color={colors.white} />
            </LinearGradient>
            <View>
              <Text style={styles.brandTitle}>RideBuddy</Text>
              <Text style={styles.brandSub}>Share rides, save money</Text>
            </View>
          </View>
        )}

        <View style={[styles.heroSection, isDesktop && styles.heroSectionDesktop]}>
          <Text style={styles.title}>Get moving in minutes</Text>
          <Text style={styles.subtitle}>Fast, safe and affordable campus rides.</Text>
        </View>

        <PremiumCard glass elevation="md" style={[styles.formCard, isDesktop && styles.formCardDesktop]}>
          <PremiumInput
            label="Full name"
            value={form.name}
            onChangeText={(value) => setField('name', value)}
            placeholder="Enter your full name"
            autoCapitalize="words"
            icon="person-outline"
            error={errors.name}
          />
          <PremiumInput
            label="Email"
            value={form.email}
            onChangeText={(value) => setField('email', value)}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon="mail-outline"
            error={errors.email}
          />
          <PremiumInput
            label="Password"
            value={form.password}
            onChangeText={(value) => setField('password', value)}
            placeholder="Minimum 6 characters"
            secureTextEntry
            showPasswordToggle
            icon="lock-closed-outline"
            error={errors.password}
          />
          <PremiumInput
            label="Phone (optional)"
            value={form.phone}
            onChangeText={(value) => setField('phone', value)}
            placeholder="98XXXXXXXX"
            keyboardType="phone-pad"
            icon="call-outline"
          />
          <PremiumButton
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            icon="sparkles-outline"
            disabled={loading || !form.name.trim() || !form.email.trim() || !form.password}
            fullWidth
            style={styles.cta}
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
    justifyContent: 'flex-start',
    paddingTop: tokens.spacing.xl
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
  logoBubble: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.lg
  },
  brandTitle: {
    ...tokens.typography.styles.h5,
    color: colors.text
  },
  leftTitle: {
    ...tokens.typography.styles.h2,
    color: '#FFFFFF'
  },
  leftSubtitle: {
    ...tokens.typography.styles.body,
    color: 'rgba(255,255,255,0.85)'
  },
  brandSub: {
    marginTop: tokens.spacing.xs,
    color: colors.textTertiary,
    ...tokens.typography.styles.caption
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
  heroSection: {
    marginBottom: tokens.spacing['2xl']
  },
  heroSectionDesktop: {
    display: 'none'
  },
  formCard: {
    width: '100%'
  },
  formCardDesktop: {
    flex: 1,
    maxWidth: 520,
    justifyContent: 'center'
  },
  title: {
    ...tokens.typography.styles.h2,
    color: colors.text,
    marginBottom: tokens.spacing.md
  },
  subtitle: {
    ...tokens.typography.styles.body,
    color: colors.textSecondary,
    lineHeight: 24
  },
  cta: {
    marginTop: tokens.spacing.md
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

export default SignupScreen;
