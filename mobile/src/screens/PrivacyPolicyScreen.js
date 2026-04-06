import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const PrivacyPolicyScreen = () => {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: April 2026</Text>

        <Text style={styles.sectionTitle}>1. What data we collect</Text>
        <Text style={styles.body}>We may collect your name, email, phone number, location data, ride history, and device information when you use RideBuddy.</Text>

        <Text style={styles.sectionTitle}>2. How we use data</Text>
        <Text style={styles.body}>Your data is used for ride matching, communication between users, account security, and improving app performance and service quality.</Text>

        <Text style={styles.sectionTitle}>3. Data sharing</Text>
        <Text style={styles.body}>RideBuddy does not sell user data. We use third-party services including MongoDB Atlas, Render.com, and Vercel to operate the platform.</Text>

        <Text style={styles.sectionTitle}>4. User rights</Text>
        <Text style={styles.body}>You can request account deletion, request data export, and update your personal information by contacting us.</Text>

        <Text style={styles.sectionTitle}>5. Cookies policy</Text>
        <Text style={styles.body}>RideBuddy web experience may use cookies or similar technologies for session handling, performance, and analytics.</Text>

        <Text style={styles.sectionTitle}>6. Contact information</Text>
        <Text style={styles.body}>For privacy requests or questions, contact us at:</Text>
        <Text style={styles.link} onPress={() => Linking.openURL('mailto:sujalgiri5@gmail.com')}>sujalgiri5@gmail.com</Text>
        <Text style={styles.link} onPress={() => Linking.openURL('https://ride-buddy0-1.vercel.app')}>https://ride-buddy0-1.vercel.app</Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: tokens.spacing['4xl']
  },
  card: {
    borderWidth: 1,
    borderColor: '#DCE6F8',
    borderRadius: tokens.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: tokens.spacing.lg,
    ...tokens.shadows.soft
  },
  title: {
    fontSize: tokens.typography.h1,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6
  },
  updated: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    fontWeight: '600'
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    fontWeight: '500'
  },
  link: {
    marginTop: 6,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700'
  }
});

export default PrivacyPolicyScreen;
