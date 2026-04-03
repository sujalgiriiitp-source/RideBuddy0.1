import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './CustomButton';
import colors from '../theme/colors';

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

const RideCard = ({ ride, onPress, actionLabel = 'View Details' }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const source = ride.source || ride.from || 'Unknown source';
  const destination = ride.destination || ride.to || 'Unknown destination';
  const dateTime = ride.dateTime || ride.date;
  const seatsLeft = ride.seatsAvailable ?? ride.availableSeats ?? ride.seats ?? 0;
  const driverName = ride?.createdBy?.name || ride?.user?.name || 'Unknown';
  const isLowSeats = Number(seatsLeft) <= 1;

  const animateTo = (toValue) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4
    }).start();
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={() => animateTo(0.985)} onPressOut={() => animateTo(1)}>
        <View style={styles.routeRow}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={styles.route}>{source} → {destination}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={16} color={colors.mutedText} />
          <Text style={styles.meta}>{formatDateTime(dateTime)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>₹{ride.price ?? 0}</Text>
          <View style={[styles.seatBadge, isLowSeats ? styles.seatBadgeLow : styles.seatBadgeGood]}>
            <Text style={[styles.seatBadgeText, isLowSeats ? styles.seatTextLow : styles.seatTextGood]}>
              {seatsLeft} seat{Number(seatsLeft) === 1 ? '' : 's'} left
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={16} color={colors.mutedText} />
          <Text style={styles.meta}>Driver: {driverName}</Text>
        </View>
      </Pressable>

      {onPress ? <CustomButton title={actionLabel} onPress={onPress} variant="secondary" style={styles.cta} /> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  route: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
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
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary
  },
  seatBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
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
