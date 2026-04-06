import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTransition from '../components/ScreenTransition';
import PremiumButton from '../components/PremiumButton';
import PremiumCard from '../components/PremiumCard';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const VerifyEmailScreen = ({ navigation, email = '' }) => {
  const { resendVerification } = useAuth();
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Email missing', text2: 'Go back and signup again.' });
      return;
    }

    try {
      setSending(true);
      await resendVerification(email);
      Toast.show({
        type: 'success',
        text1: 'Verification email sent',
        text2: 'Check your inbox and spam folder.'
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to resend email', text2: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenTransition variant="fadeSlide">
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
            <Ionicons name="mail-open-outline" size={20} color={colors.white} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>Please verify your email</Text>
            <Text style={styles.subtitle}>We sent a verification link to {email || 'your email'}.</Text>
          </View>
        </View>

        <PremiumCard glass elevation="md">
          <Text style={styles.bodyText}>
            Open the email and verify your account before login.
          </Text>
          <PremiumButton
            title="Resend Verification Email"
            onPress={handleResend}
            loading={sending}
            icon="mail-outline"
            fullWidth
          />
          <PremiumButton
            title="Back to Login"
            onPress={() => navigation.replace('Login')}
            variant="secondary"
            icon="log-in-outline"
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
    ...tokens.typography.styles.h4,
    color: colors.text,
    marginBottom: tokens.spacing.xs
  },
  subtitle: {
    ...tokens.typography.styles.body,
    color: colors.textSecondary,
    maxWidth: 280
  },
  bodyText: {
    ...tokens.typography.styles.body,
    color: colors.textSecondary,
    marginBottom: tokens.spacing.lg,
    lineHeight: 22
  },
  secondaryButton: {
    marginTop: tokens.spacing.md
  }
});

export default VerifyEmailScreen;
