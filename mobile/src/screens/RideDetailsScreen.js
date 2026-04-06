import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import CustomButton from '../components/CustomButton';
import AnimatedReveal from '../components/AnimatedReveal';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [myRideBooking, setMyRideBooking] = useState(null);
  const [isCheckingBooking, setIsCheckingBooking] = useState(false);

  const seatsToBook = 1;

  const userId = user?.id || user?._id || null;

  const isOwnRide = Boolean(ride?.createdBy?._id && userId && String(ride.createdBy._id) === String(userId));
  const alreadyBooked = myRideBooking?.status === 'confirmed';

  const fetchRide = async () => {
    const response = await apiRequest(`/rides/${rideId}`);
    setRide(response.data);
  };

  const fetchRideBookingStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setMyRideBooking(null);
      return;
    }

    setIsCheckingBooking(true);
    try {
      const response = await apiRequest(`/bookings/ride/${rideId}/mine`, { token });
      setMyRideBooking(response?.data?.booking || null);
    } catch (error) {
      setMyRideBooking(null);
    } finally {
      setIsCheckingBooking(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchRide(), fetchRideBookingStatus()]);
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Unable to load ride', text2: error.message });
        setRide(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [rideId]);

  const joinRide = async (availableSeats) => {
    try {
      setJoining(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Please login again to join this ride');
      }

      const response = await apiRequest('/bookings', {
        method: 'POST',
        token,
        body: {
          rideId,
          userId,
          seats: seatsToBook
        }
      });

      const booking = response?.data;
      const nextAvailableSeats = Math.max(0, availableSeats - seatsToBook);
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

      setMyRideBooking(booking);
      setShowConfirmSheet(false);
      setBookingSuccess(booking);

      addInAppNotification({
        type: 'ride_booked',
        title: 'Ride Booked',
        message: `You booked ${seatsToBook} seat for ${ride.source || ride.from} → ${ride.destination || ride.to}.`,
        rideId
      });

      Toast.show({
        type: 'success',
        text1: 'Ride booked successfully',
        text2: `${seatsToBook} seat confirmed`
      });

      try {
        await Promise.all([fetchRide(), fetchRideBookingStatus()]);
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
    const availableSeats = Number(ride?.seatsAvailable ?? ride?.availableSeats ?? 0);

    if (alreadyBooked) {
      Toast.show({ type: 'info', text1: 'Already booked', text2: 'You already have a confirmed booking for this ride.' });
      return;
    }

    if (isOwnRide) {
      Toast.show({ type: 'error', text1: 'Not allowed', text2: 'You cannot book your own ride.' });
      return;
    }

    if (availableSeats <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Ride is full',
        text2: 'No seats are available for this ride.'
      });
      return;
    }

    setShowConfirmSheet(true);
  };

  const handleOpenChat = async () => {
    try {
      setOpeningChat(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Please login again to open chat');
      }

      const driverId = ride?.createdBy?._id || ride?.createdBy?.id || ride?.createdBy;

      if (!driverId) {
        throw new Error('Driver information is missing for this ride');
      }

      const response = await apiRequest('/conversations', {
        method: 'POST',
        token
        ,
        body: {
          rideId,
          driverId
        }
      });

      const conversation = response?.conversation || response?.data;
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

  if (bookingSuccess) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenContainer>
          <AnimatedReveal>
            <View style={styles.successCard}>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark-circle" size={72} color="#16A34A" />
              </View>
              <Text style={styles.successTitle}>Booking Confirmed!</Text>
              <Text style={styles.successSub}>Booking ID: {bookingSuccess?._id || 'N/A'}</Text>

              <View style={styles.successSummary}>
                <Text style={styles.successLine}>{ride.source || ride.from} → {ride.destination || ride.to}</Text>
                <Text style={styles.successLine}>{formatReadableDateTime(ride.dateTime || ride.date)}</Text>
                <Text style={styles.successLine}>Driver: {ride?.createdBy?.name || 'Unknown Driver'}</Text>
                <Text style={styles.successLine}>Total: ₹{bookingSuccess?.totalAmount ?? ride?.price ?? 0}</Text>
              </View>

              <CustomButton
                title="View My Bookings"
                onPress={() => navigation.navigate('Profile', { tab: 'bookings' })}
                icon="receipt-outline"
              />
              <CustomButton
                title="Go Home"
                onPress={() => navigation.navigate('Home')}
                variant="secondary"
                icon="home-outline"
                style={styles.successSecondaryBtn}
              />
            </View>
          </AnimatedReveal>
        </ScreenContainer>
      </SafeAreaView>
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

        <View style={styles.fixedSeatCard}>
          <Ionicons name="people-outline" size={18} color={colors.primary} />
          <Text style={styles.fixedSeatText}>Seats being booked: {seatsToBook}</Text>
        </View>
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
          title={alreadyBooked ? 'Already Booked' : isOwnRide ? 'Your Ride' : 'Join Ride 🚀'}
          onPress={handleJoin}
          loading={joining}
          icon="arrow-forward-circle-outline"
          disabled={
            joining ||
            isCheckingBooking ||
            alreadyBooked ||
            isOwnRide ||
            Number(ride.seatsAvailable ?? ride.availableSeats ?? 0) <= 0
          }
        />
      </View>

      <Modal
        visible={showConfirmSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmSheet(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setShowConfirmSheet(false)}>
          <Pressable style={styles.sheetCard}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Confirm Booking</Text>

            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Route</Text>
              <Text style={styles.sheetValue}>{ride.source || ride.from} → {ride.destination || ride.to}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Date & Time</Text>
              <Text style={styles.sheetValue}>{formatReadableDateTime(ride.dateTime || ride.date)}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Driver</Text>
              <Text style={styles.sheetValue}>{ride?.createdBy?.name || 'Unknown Driver'}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Price</Text>
              <Text style={styles.sheetValue}>₹{ride?.price ?? 0}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Seats</Text>
              <Text style={styles.sheetValue}>{seatsToBook}</Text>
            </View>

            <CustomButton
              title="Confirm Booking"
              onPress={() => joinRide(Number(ride?.seatsAvailable ?? ride?.availableSeats ?? 0))}
              loading={joining}
              icon="checkmark-circle-outline"
            />
            <CustomButton
              title="Cancel"
              onPress={() => setShowConfirmSheet(false)}
              variant="secondary"
              icon="close-outline"
              style={styles.sheetCancelBtn}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  fixedSeatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF4FF',
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: '#D7E4FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10
  },
  fixedSeatText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark
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
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end'
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E7ECF2'
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#CBD5E1',
    marginBottom: 12
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14
  },
  sheetRow: {
    marginBottom: 9
  },
  sheetLabel: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  sheetValue: {
    marginTop: 2,
    fontSize: 15,
    color: colors.text,
    fontWeight: '600'
  },
  sheetCancelBtn: {
    marginTop: 10
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 20,
    ...tokens.shadows.soft
  },
  successIconWrap: {
    alignItems: 'center',
    marginBottom: 10
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#166534',
    textAlign: 'center'
  },
  successSub: {
    marginTop: 6,
    marginBottom: 14,
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: '600'
  },
  successSummary: {
    borderWidth: 1,
    borderColor: '#D9E4FA',
    borderRadius: tokens.radius.md,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#F8FAFF'
  },
  successLine: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600'
  },
  successSecondaryBtn: {
    marginTop: 10
  }
});

export default RideDetailsScreen;
