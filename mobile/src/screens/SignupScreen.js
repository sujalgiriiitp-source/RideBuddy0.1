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

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const SignupScreen = () => {
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
    <ScreenContainer>
      <AnimatedReveal>
      <View style={styles.heroCard}>
        <View style={styles.brandRow}>
          <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
            <Ionicons name="car-sport" size={20} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={styles.brandTitle}>RideBuddy</Text>
            <Text style={styles.brandSub}>Create your rider account</Text>
          </View>
        </View>

        <Text style={styles.title}>Get moving in minutes</Text>
        <Text style={styles.subtitle}>Fast, safe and affordable campus rides.</Text>

        <View style={styles.formCard}>
          <InputField
            label="Full name"
            value={form.name}
            onChangeText={(value) => setField('name', value)}
            placeholder="Enter your full name"
            autoCapitalize="words"
            icon="person-outline"
            error={errors.name}
          />
          <InputField
            label="Email"
            value={form.email}
            onChangeText={(value) => setField('email', value)}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon="mail-outline"
            error={errors.email}
          />
          <InputField
            label="Password"
            value={form.password}
            onChangeText={(value) => setField('password', value)}
            placeholder="Minimum 6 characters"
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.password}
          />
          <InputField label="Phone (optional)" value={form.phone} onChangeText={(value) => setField('phone', value)} placeholder="98XXXXXXXX" keyboardType="phone-pad" icon="call-outline" />
          <CustomButton
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            icon="sparkles-outline"
            disabled={loading || !form.name.trim() || !form.email.trim() || !form.password}
            style={styles.cta}
          />
        </View>
      </View>
      </AnimatedReveal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    marginTop: 8,
    marginBottom: 24
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18
  },
  logoBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...tokens.shadows.strong
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text
  },
  brandSub: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '600'
  },
  title: {
    fontSize: tokens.typography.hero,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3
  },
  subtitle: {
    marginTop: 8,
    color: colors.mutedText,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 21
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: '#D9E4FA',
    padding: 18,
    ...tokens.shadows.soft
  },
  cta: {
    marginTop: 4
  }
});

export default SignupScreen;
