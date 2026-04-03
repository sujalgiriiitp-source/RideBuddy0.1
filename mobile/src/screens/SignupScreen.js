import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

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
      <View style={styles.heroCard}>
        <View style={styles.brandRow}>
          <View style={styles.logoBubble}>
            <Ionicons name="car-sport" size={20} color="#FFFFFF" />
          </View>
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
            error={errors.name}
          />
          <InputField
            label="Email"
            value={form.email}
            onChangeText={(value) => setField('email', value)}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <InputField
            label="Password"
            value={form.password}
            onChangeText={(value) => setField('password', value)}
            placeholder="Minimum 6 characters"
            secureTextEntry
            error={errors.password}
          />
          <InputField label="Phone (optional)" value={form.phone} onChangeText={(value) => setField('phone', value)} placeholder="98XXXXXXXX" keyboardType="phone-pad" />
          <CustomButton
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            disabled={loading || !form.name.trim() || !form.email.trim() || !form.password}
            style={styles.cta}
          />
        </View>
      </View>
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
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4
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
    fontSize: 32,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    padding: 18,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5
  },
  cta: {
    marginTop: 4
  }
});

export default SignupScreen;
