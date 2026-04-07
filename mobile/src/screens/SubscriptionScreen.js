import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import SubscriptionPlanCard from '../components/SubscriptionPlanCard';
import { useSubscription } from '../context/SubscriptionContext';
import { SUBSCRIPTION_TIERS, TIER_FEATURES } from '../constants/subscriptionTiers';
import colors from '../theme/colors';

const SubscriptionScreen = () => {
  const router = useRouter();
  const { tier, upgradeTo, loading } = useSubscription();
  const [upgrading, setUpgrading] = useState(false);

  const plans = [
    TIER_FEATURES[SUBSCRIPTION_TIERS.FREE],
    TIER_FEATURES[SUBSCRIPTION_TIERS.PREMIUM],
    TIER_FEATURES[SUBSCRIPTION_TIERS.PRO]
  ];

  const handleSelectPlan = async (plan) => {
    if (plan.price === 0) {
      Alert.alert('Info', 'You are already on the Free plan');
      return;
    }

    Alert.alert(
      'Upgrade Subscription',
      `Upgrade to ${plan.name} plan for ${plan.currency}${plan.price}/${plan.interval}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Upgrade',
          onPress: async () => {
            setUpgrading(true);
            const tierKey = Object.keys(TIER_FEATURES).find(
              key => TIER_FEATURES[key].name === plan.name
            );
            
            const result = await upgradeTo(tierKey);
            setUpgrading(false);

            if (result.success) {
              Alert.alert(
                'Success!',
                `You have been upgraded to ${plan.name}!`,
                [
                  {
                    text: 'OK',
                    onPress: () => router.back()
                  }
                ]
              );
            } else {
              Alert.alert('Error', result.error || 'Failed to upgrade subscription');
            }
          }
        }
      ]
    );
  };

  if (loading && !upgrading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading subscription plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <Text style={styles.headerSubtitle}>
          Unlock premium features and enhance your ride experience
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {upgrading && (
          <View style={styles.upgradingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.upgradingText}>Upgrading...</Text>
          </View>
        )}

        <View style={styles.plansContainer}>
          {plans.map((plan, index) => {
            const tierKey = Object.keys(TIER_FEATURES).find(
              key => TIER_FEATURES[key].name === plan.name
            );
            const isCurrentPlan = tier === tierKey;
            const isPopular = tierKey === SUBSCRIPTION_TIERS.PREMIUM;

            return (
              <SubscriptionPlanCard
                key={tierKey}
                plan={plan}
                isCurrentPlan={isCurrentPlan}
                isPopular={isPopular}
                onSelect={handleSelectPlan}
              />
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            • Cancel anytime • No hidden fees • Secure payment
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 20
  },
  plansContainer: {
    marginTop: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary
  },
  upgradingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16
  },
  upgradingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center'
  }
});

export default SubscriptionScreen;
