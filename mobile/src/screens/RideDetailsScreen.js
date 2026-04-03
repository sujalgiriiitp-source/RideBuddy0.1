import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import colors from '../theme/colors';

const formatDisplayDate = (value) => {
  if (!value) {
    return 'Date not available';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date not available';
  }

  return parsedDate.toLocaleString();
};

const RideDetailsScreen = ({ route }) => {
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [seatsBooked, setSeatsBooked] = useState('1');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const fetchRide = async () => {
    const response = await apiRequest(`/rides/${rideId}`);
    setRide(response.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchRide();
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Unable to load ride', text2: error.message });
        setRide(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [rideId]);

  const handleJoin = async () => {
    const parsedSeats = Number(seatsBooked);
    const availableSeats = Number(ride?.seatsAvailable ?? ride?.availableSeats ?? 0);

    if (!Number.isInteger(parsedSeats) || parsedSeats <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid seat count', text2: 'Please enter a valid positive number' });
      return;
    }

    if (parsedSeats > availableSeats) {
      Toast.show({ type: 'error', text1: 'Not enough seats', text2: 'Please choose fewer seats' });
      return;
    }

    try {
      setJoining(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Please login again to join this ride');
      }

      await apiRequest(`/rides/${rideId}/join`, {
        method: 'POST',
        token,
        body: { seatsBooked: parsedSeats }
      });
      Toast.show({ type: 'success', text1: 'Ride joined successfully' });
      await fetchRide();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to join ride', text2: error.message });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.center}>
        <Text>Ride unavailable.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenContainer>
        <View style={styles.heroCard}>
          <Text style={styles.route}>{ride.source || ride.from} → {ride.destination || ride.to}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={colors.mutedText} />
            <Text style={styles.meta}>{formatDisplayDate(ride.dateTime || ride.date)}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.price}>₹{ride.price ?? 0}</Text>
            <View style={styles.seatBadge}>
              <Text style={styles.seatText}>{ride.seatsAvailable ?? ride.availableSeats ?? 0} seats left</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.driverCard}>
          <View style={styles.metaRow}>
            <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
            <View>
              <Text style={styles.driverTitle}>Driver Info</Text>
              <Text style={styles.driverName}>{ride?.createdBy?.name || 'Unknown Driver'}</Text>
            </View>
          </View>
        </View>

        <InputField
          label="Seats to book"
          value={seatsBooked}
          onChangeText={setSeatsBooked}
          keyboardType="numeric"
          placeholder="1"
        />
      </ScreenContainer>

      <View style={styles.footerCta}>
        <CustomButton
          title="Join Ride 🚀"
          onPress={handleJoin}
          loading={joining}
          disabled={joining || !seatsBooked.trim() || Number(ride.seatsAvailable ?? ride.availableSeats ?? 0) <= 0}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16
  },
  route: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  meta: {
    color: colors.mutedText
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary
  },
  seatBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#DCFCE7'
  },
  seatText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534'
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16
  },
  driverTitle: {
    fontSize: 13,
    color: colors.mutedText,
    fontWeight: '600'
  },
  driverName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700'
  },
  footerCta: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff'
  }
});

export default RideDetailsScreen;
