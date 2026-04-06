import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
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

const extractResetToken = (url) => {
  if (!url) {
    return '';
  }

  const parsed = Linking.parse(url);
  const queryToken = parsed?.queryParams?.token;
  if (queryToken) {
    return String(queryToken);
  }

  const hashIndex = url.indexOf('#');
  if (hashIndex >= 0) {
    const hashPart = url.slice(hashIndex + 1);
    const hashParams = new URLSearchParams(hashPart);
    const hashToken = hashParams.get('token');
    if (hashToken) {
      return String(hashToken);
    }
  }

  return '';
};

const ResetPasswordScreen = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const [resetToken, setResetToken] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    const resolveToken = async (url) => {
      const token = extractResetToken(url);
      if (token) {
        setResetToken(token);
      }
      return Boolean(token);
    };

    const prepareResetToken = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        const hasToken = await resolveToken(initialUrl);

        if (isMounted && hasToken) {
          return;
        }
      } catch (error) {
        if (isMounted) {
          Toast.show({ type: 'error', text1: 'Invalid reset link', text2: error.message });
        }
      } finally {
        if (isMounted) {
          setPreparing(false);
        }
      }
    };

    const subscription = Linking.addEventListener('url', async ({ url }) => {
      await resolveToken(url);
    });

    prepareResetToken();

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const validate = () => {
    const nextErrors = {};

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'Please fix form errors' });
      return;
    }

    if (!resetToken) {
      Toast.show({ type: 'error', text1: 'Reset link missing', text2: 'Please open the reset link from your email.' });
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ token: resetToken, password });
      Toast.show({ type: 'success', text1: 'Password updated', text2: 'You can now login with your new password.' });
      navigation.replace('Login');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to reset password', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (preparing) {
    return (
      <ScreenTransition variant="fadeSlide">
        <View style={styles.center}>
          <Text style={styles.infoText}>Preparing reset session...</Text>
        </View>
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition variant="fadeSlide">
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <LinearGradient colors={tokens.gradients.primary} style={styles.logoBubble}>
            <Ionicons name="lock-open-outline" size={20} color={colors.white} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>Choose a strong new password for your account.</Text>
          </View>
        </View>

        <PremiumCard glass elevation="md">
          {!resetToken ? (
            <Text style={styles.infoText}>Open the password reset link from your email on this device first.</Text>
          ) : null}
          <PremiumInput
            label="New password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            placeholder="Minimum 6 characters"
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.password}
          />
          <PremiumInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            placeholder="Re-enter password"
            secureTextEntry
            icon="shield-checkmark-outline"
            error={errors.confirmPassword}
          />
          <PremiumButton
            title="Update Password"
            onPress={handleUpdatePassword}
            loading={loading}
            icon="checkmark-circle-outline"
            disabled={loading || !password || !confirmPassword}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg
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
  infoText: {
    ...tokens.typography.styles.body,
    color: colors.textSecondary,
    marginBottom: tokens.spacing.md,
    lineHeight: 22,
    textAlign: 'center'
  },
  secondaryButton: {
    marginTop: tokens.spacing.md
  }
});

export default ResetPasswordScreen;
