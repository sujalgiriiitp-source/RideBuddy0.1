import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const SubscriptionPlanCard = ({ 
  plan, 
  isCurrentPlan = false, 
  onSelect, 
  isPopular = false 
}) => {
  const tierColors = plan.gradient || [colors.primary, colors.secondary];

  return (
    <View style={styles.container}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      
      <LinearGradient
        colors={isCurrentPlan ? tierColors : ['#FFFFFF', '#F9FAFB']}
        style={[
          styles.card,
          isCurrentPlan && styles.currentCard
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View>
            <View style={styles.titleRow}>
              <Text style={[
                styles.planName,
                isCurrentPlan && styles.currentPlanText
              ]}>
                {plan.name}
              </Text>
              {plan.badge && (
                <Text style={styles.badgeIcon}>{plan.badge}</Text>
              )}
            </View>
            {isCurrentPlan && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current Plan</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.priceContainer}>
          {plan.price === 0 ? (
            <Text style={[
              styles.priceText,
              isCurrentPlan && styles.currentPlanText
            ]}>
              Free
            </Text>
          ) : (
            <View style={styles.priceRow}>
              <Text style={[
                styles.currency,
                isCurrentPlan && styles.currentPlanText
              ]}>
                {plan.currency}
              </Text>
              <Text style={[
                styles.priceText,
                isCurrentPlan && styles.currentPlanText
              ]}>
                {plan.price}
              </Text>
              <Text style={[
                styles.interval,
                isCurrentPlan && styles.currentPlanText
              ]}>
                /{plan.interval}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={isCurrentPlan ? '#FFFFFF' : colors.primary}
              />
              <Text style={[
                styles.featureText,
                isCurrentPlan && styles.currentPlanText
              ]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {!isCurrentPlan && (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => onSelect(plan)}
          >
            <LinearGradient
              colors={tierColors}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {plan.price === 0 ? 'Current Plan' : 'Upgrade'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    position: 'relative'
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: colors?.accent || '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  currentCard: {
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  currentPlanText: {
    color: '#FFFFFF'
  },
  badgeIcon: {
    fontSize: 24
  },
  currentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start'
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  priceContainer: {
    marginBottom: 20
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginRight: 2
  },
  priceText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text
  },
  interval: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4
  },
  featuresContainer: {
    marginBottom: 20
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    flex: 1
  },
  selectButton: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});

export default SubscriptionPlanCard;
