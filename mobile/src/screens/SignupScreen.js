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

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const SignupScreen = ({ navigation }) => {
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
      Toast.show({ type: 'success', text1: 'Signup successful', text2: 'Please verify your email to continue.' });
      navigation.replace('Verify Email', { email });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Signup failed', text2: error.message || 'Failed to connect' });
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
            <Text style={styles.brandTitle}>RideBuddy</Text>
            <Text style={styles.brandSub}>Create your rider account</Text>
          </View>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.title}>Get moving in minutes</Text>
          <Text style={styles.subtitle}>Fast, safe and affordable campus rides.</Text>
        </View>

        <PremiumCard glass elevation="md">
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
  brandSub: {
    marginTop: tokens.spacing.xs,
    color: colors.textTertiary,
    ...tokens.typography.styles.caption
  },
  heroSection: {
    marginBottom: tokens.spacing['2xl']
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
  }
});

export default SignupScreen;
