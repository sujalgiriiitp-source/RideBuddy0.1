import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import AnimatedReveal from '../components/AnimatedReveal';
import { useNotifications } from '../context/NotificationContext';
import colors from '../theme/colors';
import tokens from '../theme/tokens';
import { formatReadableDateTime } from '../utils/dateTime';

const extractApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const RideDetailsScreen = ({ route }) => {
  const { rideId } = route.params;
  const { addInAppNotification } = useNotifications();
  const [ride, setRide] = useState(null);
  const [seatsBooked, setSeatsBooked] = useState('1');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);

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

  const joinRide = async (parsedSeats, availableSeats) => {
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

      const nextAvailableSeats = Math.max(0, availableSeats - parsedSeats);
      setRide((previousRide) => {
        if (!previousRide) {
          return previousRide;
        }

        return {
          ...previousRide,
          seatsAvailable: nextAvailableSeats,
          availableSeats: nextAvailableSeats
        };
      });
      setSeatsBooked('1');

      addInAppNotification({
        type: 'ride_booked',
        title: 'Ride Booked',
        message: `You booked ${parsedSeats} seat${parsedSeats > 1 ? 's' : ''} for ${ride.source || ride.from} → ${ride.destination || ride.to}.`,
        rideId
      });

      Toast.show({
        type: 'success',
        text1: 'Ride booked successfully',
        text2: `${parsedSeats} seat${parsedSeats > 1 ? 's' : ''} confirmed`
      });

      try {
        await fetchRide();
      } catch (refreshError) {
        console.warn('Ride refresh failed after booking:', refreshError);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to join ride',
        text2: extractApiErrorMessage(error, 'Unable to complete your booking right now.')
      });
    } finally {
      setJoining(false);
    }
  };

  const handleJoin = () => {
    const parsedSeats = Number(seatsBooked);
    const availableSeats = Number(ride?.seatsAvailable ?? ride?.availableSeats ?? 0);

    if (availableSeats <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Ride is full',
        text2: 'No seats are available for this ride.'
      });
      return;
    }

    if (!Number.isInteger(parsedSeats) || parsedSeats <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid seat count', text2: 'Please enter a valid positive number' });
      return;
    }

    if (parsedSeats > availableSeats) {
      Toast.show({ type: 'error', text1: 'Not enough seats', text2: 'Please choose fewer seats' });
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book ${parsedSeats} seat${parsedSeats > 1 ? 's' : ''} for this ride?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Confirm',
          onPress: () => {
            joinRide(parsedSeats, availableSeats);
          }
        }
      ]
    );
  };

  const handleOpenChat = async () => {
    try {
      setOpeningChat(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Please login again to open chat');
      }

      const response = await apiRequest(`/chat/conversations/${rideId}`, {
        method: 'GET',
        token
      });

      const conversation = response?.conversation;
      if (!conversation?._id) {
        throw new Error('Unable to open conversation');
      }

      navigation.navigate('ChatScreen', {
        conversationId: conversation._id,
        rideId,
        rideName: `${ride.source || ride.from} → ${ride.destination || ride.to}`
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to open chat',
        text2: extractApiErrorMessage(error, 'Please try again in a moment.')
      });
    } finally {
      setOpeningChat(false);
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
        <AnimatedReveal>
          <View style={styles.heroCard}>
            <LinearGradient colors={['rgba(37,99,235,0.15)', 'rgba(124,58,237,0.1)']} style={styles.heroGlow} />
            <Text style={styles.route}>{ride.source || ride.from} → {ride.destination || ride.to}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={16} color={colors.mutedText} />
              <Text style={styles.meta}>{formatReadableDateTime(ride.dateTime || ride.date)}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.price}>₹{ride.price ?? 0}</Text>
              <View style={styles.seatBadge}>
                <Text style={styles.seatText}>{ride.seatsAvailable ?? ride.availableSeats ?? 0} seats left</Text>
              </View>
            </View>
          </View>
        </AnimatedReveal>

        <View style={styles.divider} />

        <AnimatedReveal delay={110}>
          <View style={styles.driverCard}>
            <View style={styles.metaRow}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
              <View>
                <Text style={styles.driverTitle}>Driver Info</Text>
                <Text style={styles.driverName}>{ride?.createdBy?.name || 'Unknown Driver'}</Text>
              </View>
            </View>
          </View>
        </AnimatedReveal>

        <InputField
          label="Seats to book"
          value={seatsBooked}
          onChangeText={setSeatsBooked}
          keyboardType="numeric"
          placeholder="1"
          icon="people-outline"
        />
      </ScreenContainer>

      <View style={styles.footerCta}>
        <CustomButton
          title="Message Driver"
          onPress={handleOpenChat}
          loading={openingChat}
          variant="secondary"
          icon="chatbubble-ellipses-outline"
          disabled={openingChat || joining}
          style={styles.chatButton}
        />
        <CustomButton
          title="Join Ride 🚀"
          onPress={handleJoin}
          loading={joining}
          icon="arrow-forward-circle-outline"
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: '#D9E4FA',
    padding: 18,
    overflow: 'hidden',
    ...tokens.shadows.soft,
    marginBottom: 16
  },
  heroGlow: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: -10,
    height: 90,
    borderRadius: tokens.radius.xl
  },
  route: {
    fontSize: tokens.typography.h1,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#D9E4FA',
    padding: 16,
    marginBottom: 16,
    ...tokens.shadows.soft
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
    borderTopColor: '#DCE6F8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    gap: 10
  },
  chatButton: {
    marginBottom: 2
  }
});

export default RideDetailsScreen;
