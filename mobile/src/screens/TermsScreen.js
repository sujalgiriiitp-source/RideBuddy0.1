import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const TermsScreen = () => {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.updated}>Effective: April 2026</Text>

        <Text style={styles.sectionTitle}>1. Service description</Text>
        <Text style={styles.body}>RideBuddy is a peer-to-peer ride sharing platform for campus commuters.</Text>

        <Text style={styles.sectionTitle}>2. User eligibility</Text>
        <Text style={styles.body}>You must be at least 18 years old to use RideBuddy.</Text>

        <Text style={styles.sectionTitle}>3. User responsibilities</Text>
        <Text style={styles.body}>Users must provide accurate information, follow safe behavior, and avoid misuse of the platform.</Text>

        <Text style={styles.sectionTitle}>4. Driver responsibilities</Text>
        <Text style={styles.body}>Drivers must hold a valid license, maintain a roadworthy vehicle, and follow traffic laws and local regulations.</Text>

        <Text style={styles.sectionTitle}>5. Payment terms</Text>
        <Text style={styles.body}>Payments are agreed between driver and passenger. RideBuddy is not responsible for payment disputes or transactions.</Text>

        <Text style={styles.sectionTitle}>6. Cancellation policy</Text>
        <Text style={styles.body}>Rides can be cancelled at least 2 hours before scheduled ride time with no penalty.</Text>

        <Text style={styles.sectionTitle}>7. Prohibited activities</Text>
        <Text style={styles.body}>Fraud, harassment, fake listings, or any unlawful behavior is strictly prohibited.</Text>

        <Text style={styles.sectionTitle}>8. Liability disclaimer</Text>
        <Text style={styles.body}>RideBuddy is a technology platform only and is not a transport company.</Text>

        <Text style={styles.sectionTitle}>9. Governing law</Text>
        <Text style={styles.body}>These Terms are governed by the laws of India.</Text>

        <Text style={styles.sectionTitle}>10. Contact</Text>
        <Text style={styles.link} onPress={() => Linking.openURL('mailto:sujalgiri5@gmail.com')}>sujalgiri5@gmail.com</Text>
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

export default TermsScreen;
