import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import ScreenContainer from '../components/ScreenContainer';
import CustomButton from '../components/CustomButton';
import AnimatedReveal from '../components/AnimatedReveal';
import { AnimatedEmptyState, RideCardSkeleton } from '../components';
import RatingModal from '../components/RatingModal';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import tokens from '../theme/tokens';
import { apiRequest } from '../api';
import { formatReadableDateTime } from '../utils/dateTime';
import { formatRatingLabel, getRatingBadge } from '../utils/rating';

const canCancelBooking = (rideDateTime) => {
  const rideTime = new Date(rideDateTime).getTime();
  if (!Number.isFinite(rideTime)) {
    return false;
  }

  return rideTime - Date.now() >= 2 * 60 * 60 * 1000;
};

const ProfileScreen = ({ route }) => {
  const { user, refreshProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(route?.params?.tab === 'bookings' ? 'bookings' : 'profile');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancelLoadingBookingId, setCancelLoadingBookingId] = useState('');
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviews: 0, totalRideCount: 0, ratings: [] });
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratedRideIds, setRatedRideIds] = useState([]);

  const now = Date.now();
  const upcomingBookings = bookings.filter((booking) => {
    if (booking.status !== 'confirmed') {
      return false;
    }

    const rideTime = new Date(booking?.ride?.dateTime).getTime();
    return Number.isFinite(rideTime) && rideTime >= now;
  });

  const pastBookings = bookings.filter((booking) => {
    const rideTime = new Date(booking?.ride?.dateTime).getTime();
    if (!Number.isFinite(rideTime)) {
      return booking.status !== 'confirmed';
    }

    return booking.status !== 'confirmed' || rideTime < now;
  });

  const fetchBookings = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setBookings([]);
      return;
    }

    setBookingsLoading(true);
    try {
      const response = await apiRequest('/bookings/my', { token });
      setBookings(response.data || []);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to load bookings', text2: error.message });
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchMyRatings = async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
      return;
    }

    try {
      const response = await apiRequest(`/ratings/user/${userId}`);
      const nextSummary = response?.data || { averageRating: 0, totalReviews: 0, totalRideCount: 0, ratings: [] };
      setRatingSummary(nextSummary);
    } catch (error) {
      setRatingSummary({ averageRating: 0, totalReviews: 0, totalRideCount: 0, ratings: [] });
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([refreshProfile(), fetchMyRatings()]);
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Profile load failed', text2: error.message });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshProfile]);

  useEffect(() => {
    if (route?.params?.tab === 'bookings') {
      setActiveTab('bookings');
    }
  }, [route?.params?.tab]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await Promise.all([refreshProfile(), fetchMyRatings()]);
      Toast.show({ type: 'success', text1: 'Profile updated' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Refresh failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    const bookingId = booking?._id;
    if (!bookingId) {
      return;
    }

    try {
      setCancelLoadingBookingId(bookingId);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Please login again');
      }

      await apiRequest(`/bookings/${bookingId}/cancel`, {
        method: 'POST',
        token
      });

      Toast.show({ type: 'success', text1: 'Booking cancelled' });
      await fetchBookings();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Cancel failed', text2: error.message });
    } finally {
      setCancelLoadingBookingId('');
    }
  };

  const openRatingModal = (booking) => {
    setSelectedBookingForRating(booking);
    setRatingModalVisible(true);
  };

  const closeRatingModal = () => {
    setRatingModalVisible(false);
    setSelectedBookingForRating(null);
  };

  const submitRating = async ({ stars, review }) => {
    const booking = selectedBookingForRating;
    if (!booking?._id || !booking?.ride?._id) {
      closeRatingModal();
      return;
    }

    const ride = booking.ride;
    const ratedUserId = ride?.createdBy?._id || ride?.createdBy?.id || ride?.createdBy;

    if (!ratedUserId) {
      Toast.show({ type: 'error', text1: 'Unable to submit rating', text2: 'Driver information is missing.' });
      closeRatingModal();
      return;
    }

    try {
      setSubmittingRating(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Please login again');
      }

      await apiRequest('/ratings', {
        method: 'POST',
        token,
        body: {
          rideId: ride._id,
          ratedUserId,
          stars,
          review
        }
      });

      setRatedRideIds((previous) => [...new Set([...previous, String(ride._id)])]);
      Toast.show({ type: 'success', text1: 'Thanks for rating!', text2: 'Your review has been submitted.' });
      await fetchMyRatings();
      closeRatingModal();
    } catch (error) {
      if (error?.status === 409) {
        setRatedRideIds((previous) => [...new Set([...previous, String(ride._id)])]);
      }
      Toast.show({ type: 'error', text1: 'Rating failed', text2: error.message });
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderBookingCard = (booking) => {
    const ride = booking?.ride;
    const driverName = ride?.createdBy?.name || 'Unknown Driver';
    const canCancel = booking.status === 'confirmed' && canCancelBooking(ride?.dateTime);
    const isCancelled = booking.status === 'cancelled';
    const rideTime = new Date(ride?.dateTime).getTime();
    const isPastRide = Number.isFinite(rideTime) && rideTime < Date.now();
    const showRatingPrompt = booking.status === 'confirmed' && isPastRide;
    const isAlreadyRated = ratedRideIds.includes(String(ride?._id));

    return (
      <View key={booking._id} style={styles.bookingCard}>
        <Text style={styles.bookingRoute}>{ride?.source || ride?.pickup} → {ride?.destination || ride?.drop}</Text>
        <Text style={styles.bookingMeta}>{formatReadableDateTime(ride?.dateTime)}</Text>
        <Text style={styles.bookingMeta}>Driver: {driverName}</Text>
        <Text style={styles.bookingMeta}>Price: ₹{booking?.totalAmount ?? ride?.price ?? 0}</Text>

        <View style={styles.bookingFooter}>
          <View style={[styles.bookingStatusBadge, isCancelled ? styles.statusCancelled : styles.statusConfirmed]}>
            <Text style={[styles.bookingStatusText, isCancelled ? styles.statusCancelledText : styles.statusConfirmedText]}>
              {String(booking.status || 'confirmed').toUpperCase()}
            </Text>
          </View>

          {showRatingPrompt && !isAlreadyRated ? (
            <CustomButton
              title="Rate your ride"
              variant="secondary"
              icon="star-outline"
              onPress={() => openRatingModal(booking)}
              style={styles.rateButton}
            />
          ) : null}

          {canCancel ? (
            <CustomButton
              title="Cancel"
              variant="danger"
              icon="close-circle-outline"
              onPress={() => handleCancelBooking(booking)}
              loading={cancelLoadingBookingId === booking._id}
              style={styles.cancelButton}
            />
          ) : null}
        </View>
      </View>
    );
  };

  if (loading && !user) {
    return (
      <ScreenContainer contentContainerStyle={styles.screenContent}>
        <RideCardSkeleton />
        <RideCardSkeleton />
      </ScreenContainer>
    );
  }

  const ratingBadge = getRatingBadge(ratingSummary.averageRating, ratingSummary.totalReviews);

  return (
    <ScreenContainer contentContainerStyle={styles.screenContent}>
      <View style={styles.tabRow}>
        <CustomButton
          title="Profile"
          variant={activeTab === 'profile' ? 'primary' : 'secondary'}
          onPress={() => setActiveTab('profile')}
          icon="person-outline"
          style={styles.tabButton}
        />
        <CustomButton
          title="My Bookings"
          variant={activeTab === 'bookings' ? 'primary' : 'secondary'}
          onPress={() => setActiveTab('bookings')}
          icon="receipt-outline"
          style={styles.tabButton}
        />
      </View>

      {activeTab === 'profile' ? (
        <>
          <AnimatedReveal>
            <View style={styles.heroCard}>
              <LinearGradient colors={['rgba(37,99,235,0.16)', 'rgba(124,58,237,0.12)']} style={styles.heroGlow} />
              <View style={styles.topRow}>
                <Text style={styles.topLabel}>My Profile</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>

              <View style={styles.identityRow}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={30} color="#0A84FF" />
                </View>
                <View style={styles.identityTextWrap}>
                  <Text style={styles.name}>{user?.name || 'RideBuddy User'}</Text>
                  <Text style={styles.caption}>Campus Commuter</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="mail-outline" size={14} color="#1D4ED8" />
                  </View>
                  <Text style={styles.value}>{user?.email || '-'}</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="call-outline" size={14} color="#1D4ED8" />
                  </View>
                  <Text style={styles.value}>{user?.phone || 'Not added'}</Text>
                </View>
              </View>

              <View style={styles.ratingCard}>
                <Text style={styles.ratingHeading}>Your Rating</Text>
                <View style={styles.ratingSummaryRow}>
                  <Text style={styles.ratingSummaryText}>
                    {formatRatingLabel(ratingSummary.averageRating, ratingSummary.totalRideCount)}
                  </Text>
                  <View
                    style={[
                      styles.ratingSummaryBadge,
                      ratingBadge.tone === 'success'
                        ? styles.ratingBadgeSuccess
                        : ratingBadge.tone === 'warning'
                          ? styles.ratingBadgeWarning
                          : ratingBadge.tone === 'neutral'
                            ? styles.ratingBadgeNeutral
                            : styles.ratingBadgePrimary
                    ]}
                  >
                    <Text style={styles.ratingSummaryBadgeText}>{ratingBadge.label}</Text>
                  </View>
                </View>
                <Text style={styles.ratingMetaText}>{ratingSummary.totalReviews || 0} reviews received</Text>
              </View>

              <Text style={styles.reviewsHeading}>Recent Reviews</Text>
              {ratingSummary.ratings?.length ? (
                ratingSummary.ratings.slice(0, 5).map((rating) => (
                  <View key={rating._id} style={styles.reviewCard}>
                    <Text style={styles.reviewStars}>{'⭐'.repeat(Number(rating.stars || 0))}</Text>
                    <Text style={styles.reviewText}>{rating.review || 'No written review provided.'}</Text>
                    <Text style={styles.reviewMeta}>By {rating?.raterId?.name || 'Rider'} • {formatReadableDateTime(rating?.createdAt)}</Text>
                  </View>
                ))
              ) : (
                <AnimatedEmptyState
                  icon="star-outline"
                  title="No reviews yet"
                  message="Your reviews will appear here after completed rides are rated."
                />
              )}
            </View>
          </AnimatedReveal>

          <AnimatedReveal delay={120}>
            <CustomButton title="Refresh Profile" onPress={handleRefresh} loading={loading} variant="secondary" icon="refresh-outline" />
          </AnimatedReveal>
          <AnimatedReveal delay={180}>
            <CustomButton title="Logout" onPress={logout} variant="danger" icon="log-out-outline" style={styles.logoutButton} />
          </AnimatedReveal>
        </>
      ) : (
        <>
          {bookingsLoading ? (
            <>
              <RideCardSkeleton />
              <RideCardSkeleton />
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {upcomingBookings.length === 0 ? (
                <AnimatedEmptyState
                  icon="calendar-outline"
                  title="No upcoming bookings"
                  message="Your confirmed upcoming rides will appear here."
                />
              ) : (
                upcomingBookings.map(renderBookingCard)
              )}

              <Text style={[styles.sectionTitle, styles.sectionGap]}>Past</Text>
              {pastBookings.length === 0 ? (
                <AnimatedEmptyState
                  icon="time-outline"
                  title="No past bookings"
                  message="Completed or cancelled rides will appear here."
                />
              ) : (
                pastBookings.map(renderBookingCard)
              )}
            </>
          )}
        </>
      )}

      <RatingModal
        visible={ratingModalVisible}
        title="Rate your ride"
        subtitle={
          selectedBookingForRating
            ? `${selectedBookingForRating?.ride?.source || selectedBookingForRating?.ride?.pickup} → ${selectedBookingForRating?.ride?.destination || selectedBookingForRating?.ride?.drop}`
            : ''
        }
        submitting={submittingRating}
        onSubmit={submitRating}
        onSkip={closeRatingModal}
        onClose={closeRatingModal}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: tokens.spacing['5xl']
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  tabButton: {
    flex: 1
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#D8E4FA',
    borderRadius: tokens.radius.xl,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...tokens.shadows.soft
  },
  heroGlow: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: -10,
    height: 90,
    borderRadius: tokens.radius.xl
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  topLabel: {
    fontSize: tokens.typography.caption,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#DCFCE7'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534'
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  identityTextWrap: {
    flex: 1
  },
  name: {
    fontSize: tokens.typography.h1,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3
  },
  caption: {
    marginTop: 4,
    fontSize: 13,
    color: colors.mutedText,
    fontWeight: '600'
  },
  infoCard: {
    borderWidth: 1,
    borderColor: '#DDE7F9',
    borderRadius: tokens.radius.md,
    backgroundColor: 'rgba(255,255,255,0.86)',
    padding: 14
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E7ECF2',
    marginVertical: 12
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1
  },
  logoutButton: {
    marginTop: 10
  },
  sectionTitle: {
    fontSize: tokens.typography.h3,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8
  },
  sectionGap: {
    marginTop: 16
  },
  bookingCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    borderRadius: tokens.radius.lg,
    padding: 14,
    marginBottom: 10,
    ...tokens.shadows.soft
  },
  bookingRoute: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6
  },
  bookingMeta: {
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: 4,
    fontWeight: '600'
  },
  bookingFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },
  bookingStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  statusConfirmed: {
    backgroundColor: '#DCFCE7'
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2'
  },
  bookingStatusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  statusConfirmedText: {
    color: '#166534'
  },
  statusCancelledText: {
    color: '#991B1B'
  },
  cancelButton: {
    width: 132
  },
  rateButton: {
    width: 148
  },
  ratingCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#DDE7F9',
    borderRadius: tokens.radius.md,
    backgroundColor: '#F8FAFF',
    padding: 12
  },
  ratingHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.mutedText,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  ratingSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ratingSummaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  ratingSummaryBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  ratingBadgePrimary: {
    backgroundColor: '#DBEAFE'
  },
  ratingBadgeSuccess: {
    backgroundColor: '#DCFCE7'
  },
  ratingBadgeWarning: {
    backgroundColor: '#FEF3C7'
  },
  ratingBadgeNeutral: {
    backgroundColor: '#E5E7EB'
  },
  ratingSummaryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155'
  },
  ratingMetaText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  reviewsHeading: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#DCE6F8',
    borderRadius: tokens.radius.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 12,
    marginBottom: 8
  },
  reviewStars: {
    fontSize: 14,
    marginBottom: 6
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 6
  },
  reviewMeta: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '600'
  }
});

export default ProfileScreen;
