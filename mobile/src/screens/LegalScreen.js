import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const TAB_PRIVACY = 'privacy';
const TAB_TERMS = 'terms';

const LegalScreen = () => {
  const [activeTab, setActiveTab] = useState(TAB_PRIVACY);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.pageTitle}>Legal</Text>

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setActiveTab(TAB_PRIVACY)}
            style={[styles.tabButton, activeTab === TAB_PRIVACY ? styles.tabButtonActive : styles.tabButtonInactive]}
          >
            <Text style={[styles.tabText, activeTab === TAB_PRIVACY ? styles.tabTextActive : styles.tabTextInactive]}>
              Privacy Policy
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab(TAB_TERMS)}
            style={[styles.tabButton, activeTab === TAB_TERMS ? styles.tabButtonActive : styles.tabButtonInactive]}
          >
            <Text style={[styles.tabText, activeTab === TAB_TERMS ? styles.tabTextActive : styles.tabTextInactive]}>
              Terms of Service
            </Text>
          </Pressable>
        </View>

        {activeTab === TAB_PRIVACY ? (
          <View>
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
        ) : (
          <View>
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
        )}
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
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: tokens.spacing.lg,
    ...tokens.shadows.soft
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  tabButton: {
    flex: 1,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1
  },
  tabButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFD6FF'
  },
  tabButtonInactive: {
    backgroundColor: '#F8FAFF',
    borderColor: '#DCE6F8'
  },
  tabText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '700'
  },
  tabTextActive: {
    color: '#1D4ED8'
  },
  tabTextInactive: {
    color: colors.textSecondary
  },
  title: {
    fontSize: tokens.typography.h2,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6
  },
  updated: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
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

export default LegalScreen;
