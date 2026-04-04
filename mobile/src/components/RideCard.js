import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import CustomButton from './CustomButton';
import AnimatedReveal from './AnimatedReveal';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const formatDateTime = (value) => {
  if (!value) {
    return 'Date not available';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date not available';
  }

  return parsedDate.toLocaleString();
};

const RideCard = ({ ride, onPress, actionLabel = 'View Details', index = 0, highlight = false }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const source = ride.source || ride.from || 'Unknown source';
  const destination = ride.destination || ride.to || 'Unknown destination';
  const dateTime = ride.dateTime || ride.date;
  const seatsLeft = ride.seatsAvailable ?? ride.availableSeats ?? ride.seats ?? 0;
  const driverName = ride?.createdBy?.name || ride?.user?.name || 'Unknown';
  const seatCount = Number(seatsLeft);
  const isFull = seatCount <= 0;
  const isLowSeats = seatCount > 0 && seatCount <= 1;
  const statusLabel = isFull ? 'Full' : 'Available';

  const animateTo = (toValue, isPress = false) => {
    if (isPress && Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.parallel([
      Animated.spring(scale, {
        toValue,
        useNativeDriver: true,
        friction: 8,
        tension: 100
      }),
      Animated.timing(shadowAnim, {
        toValue: toValue < 1 ? 1 : 0,
        duration: 150,
        useNativeDriver: false
      })
    ]).start();
  };

  const animatedShadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [tokens.shadows.soft.shadowOpacity, tokens.shadows.lg.shadowOpacity]
  });

  return (
    <AnimatedReveal delay={80 + index * 70}>
      <Animated.View 
        style={[
          styles.card, 
          highlight && styles.highlightCard, 
          { 
            transform: [{ scale }],
            shadowOpacity: animatedShadowOpacity
          }
        ]}
      >
        <Pressable 
          onPress={onPress} 
          onPressIn={() => animateTo(0.97, true)} 
          onPressOut={() => animateTo(1)}
        >
          <LinearGradient colors={['rgba(37,99,235,0.12)', 'rgba(124,58,237,0.06)']} style={styles.topStrip} />

          <View style={styles.routeRow}>
            <View style={styles.routeIconWrap}>
              <Ionicons name="navigate" size={14} color={colors.primary} />
            </View>
            <Text style={styles.route}>{source} → {destination}</Text>
            <View style={[styles.statusBadge, isFull ? styles.statusFull : styles.statusAvailable]}>
              <Text style={[styles.statusText, isFull ? styles.statusTextFull : styles.statusTextAvailable]}>{statusLabel}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={colors.mutedText} />
            <Text style={styles.meta}>{formatDateTime(dateTime)}</Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.metaPill}>
              <Ionicons name="wallet-outline" size={14} color={colors.primaryDark} />
              <Text style={styles.price}>₹{ride.price ?? 0}</Text>
            </View>
            <View style={[styles.seatBadge, isLowSeats || isFull ? styles.seatBadgeLow : styles.seatBadgeGood]}>
              <Ionicons name="people-outline" size={13} color={isLowSeats || isFull ? '#991B1B' : '#166534'} />
              <Text style={[styles.seatBadgeText, isLowSeats || isFull ? styles.seatTextLow : styles.seatTextGood]}>
                {seatCount} seat{seatCount === 1 ? '' : 's'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={16} color={colors.mutedText} />
            <Text style={styles.meta}>Driver: {driverName}</Text>
          </View>
        </Pressable>

        {onPress ? <CustomButton title={actionLabel} onPress={onPress} variant="secondary" style={styles.cta} icon="arrow-forward" /> : null}
      </Animated.View>
    </AnimatedReveal>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: '#DCE5F7',
    padding: tokens.spacing.md,
    marginBottom: 14,
    overflow: 'hidden',
    ...tokens.shadows.soft
  },
  highlightCard: {
    borderColor: '#BFD2FF',
    shadowOpacity: 0.14
  },
  topStrip: {
    position: 'absolute',
    left: -8,
    right: -8,
    top: -12,
    height: 56,
    borderRadius: 20
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  routeIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  route: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: tokens.radius.pill
  },
  statusAvailable: {
    backgroundColor: '#DCFCE7'
  },
  statusFull: {
    backgroundColor: '#FEE2E2'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  statusTextAvailable: {
    color: '#166534'
  },
  statusTextFull: {
    color: '#991B1B'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  meta: {
    color: colors.mutedText
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  metaPill: {
    borderRadius: 12,
    backgroundColor: '#ECF2FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDark
  },
  seatBadge: {
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center'
  },
  seatBadgeGood: {
    backgroundColor: '#DCFCE7'
  },
  seatBadgeLow: {
    backgroundColor: '#FEE2E2'
  },
  seatBadgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  seatTextGood: {
    color: '#166534'
  },
  seatTextLow: {
    color: '#991B1B'
  },
  cta: {
    marginTop: 8
  }
});

export default RideCard;
