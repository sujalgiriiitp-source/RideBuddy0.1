import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTransition from '../components/ScreenTransition';
import PremiumCard from '../components/PremiumCard';
import PremiumInput from '../components/PremiumInput';
import PremiumButton from '../components/PremiumButton';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const ForgotPasswordScreen = ({ navigation }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendResetLink = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isEmailValid) {
      setError('Enter a valid email address');
      Toast.show({ type: 'error', text1: 'Invalid email', text2: 'Please enter a valid email.' });
      return;
    }

    try {
      setLoading(true);
      setError('');
      await forgotPassword(normalizedEmail);
      Toast.show({
        type: 'success',
        text1: 'Reset email sent',
        text2: 'Check your inbox and open the link to set a new password.'
      });
      navigation.replace('Login');
    } catch (requestError) {
      Toast.show({ type: 'error', text1: 'Unable to send reset email', text2: requestError.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenTransition variant="fadeSlide">
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
            <Ionicons name="key-outline" size={20} color={colors.white} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a password reset link.</Text>
          </View>
        </View>

        <PremiumCard glass elevation="md">
          <PremiumInput
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) {
                setError('');
              }
            }}
            placeholder="you@email.com"
            keyboardType="email-address"
            icon="mail-outline"
            error={error}
          />

          <PremiumButton
            title="Send Reset Link"
            onPress={handleSendResetLink}
            loading={loading}
            icon="send-outline"
            disabled={loading || !email.trim()}
            fullWidth
          />
          <PremiumButton
            title="Back to Login"
            onPress={() => navigation.replace('Login')}
            variant="secondary"
            icon="arrow-back-outline"
            fullWidth
            style={styles.secondaryButton}
          />
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
    ...tokens.typography.styles.h3,
    color: colors.text,
    marginBottom: tokens.spacing.xs
  },
  subtitle: {
    ...tokens.typography.styles.body,
    color: colors.textSecondary,
    maxWidth: 280
  },
  secondaryButton: {
    marginTop: tokens.spacing.md
  }
});

export default ForgotPasswordScreen;
