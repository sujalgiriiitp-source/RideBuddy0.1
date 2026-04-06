import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import ScreenContainer from '../components/ScreenContainer';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
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

const numberPlateRegex = /^[A-Za-z]{2}[\s-]?\d{1,2}[\s-]?[A-Za-z]{1,3}[\s-]?\d{4}$/;

const normalizePlate = (plate = '') => String(plate).toUpperCase().replace(/[\s-]/g, '');

const hasVehicleFields = (profile) => {
  return Boolean(
    profile?.vehicleType &&
      profile?.vehicleBrand &&
      profile?.vehicleModel &&
      profile?.vehicleColor &&
      profile?.numberPlate
  );
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
  const [editVisible, setEditVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    vehicleType: 'Car',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleColor: '',
    numberPlate: '',
    profilePhoto: ''
  });

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

  useEffect(() => {
    setEditForm({
      name: user?.name || '',
      phone: user?.phone || '',
      vehicleType: user?.vehicleType || 'Car',
      vehicleBrand: user?.vehicleBrand || '',
      vehicleModel: user?.vehicleModel || '',
      vehicleColor: user?.vehicleColor || '',
      numberPlate: user?.numberPlate || '',
      profilePhoto: user?.profilePhoto || ''
    });
    setEditErrors({});
  }, [user]);

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

  const setEditField = (field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value
    }));

    if (editErrors[field]) {
      setEditErrors((previous) => ({
        ...previous,
        [field]: undefined
      }));
    }
  };

  const validateEditForm = () => {
    const nextErrors = {};

    if (!String(editForm.name || '').trim()) {
      nextErrors.name = 'Full name is required';
    }

    if (!String(editForm.phone || '').trim()) {
      nextErrors.phone = 'Phone number is required';
    }

    if (!['Car', 'Auto', 'Bike'].includes(editForm.vehicleType)) {
      nextErrors.vehicleType = 'Please select vehicle type';
    }

    if (!String(editForm.vehicleBrand || '').trim()) {
      nextErrors.vehicleBrand = 'Vehicle brand is required';
    }

    if (!String(editForm.vehicleModel || '').trim()) {
      nextErrors.vehicleModel = 'Vehicle model is required';
    }

    if (!String(editForm.vehicleColor || '').trim()) {
      nextErrors.vehicleColor = 'Vehicle color is required';
    }

    const normalizedNumberPlate = normalizePlate(editForm.numberPlate);
    if (!normalizedNumberPlate) {
      nextErrors.numberPlate = 'Number plate is required';
    } else if (!numberPlateRegex.test(String(editForm.numberPlate || '').trim())) {
      nextErrors.numberPlate = 'Use Indian format like UP32AB1234';
    }

    if (editForm.profilePhoto && !/^https?:\/\//i.test(editForm.profilePhoto) && !/^data:image\//i.test(editForm.profilePhoto)) {
      nextErrors.profilePhoto = 'Photo must be image URL or base64 image data';
    }

    setEditErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openEditModal = () => {
    setEditVisible(true);
  };

  const closeEditModal = () => {
    if (savingProfile || uploadingPhoto) {
      return;
    }
    setEditVisible(false);
  };

  const handlePickPhoto = async () => {
    if (Platform.OS === 'web') {
      Toast.show({
        type: 'info',
        text1: 'Photo upload on web',
        text2: 'Use the Profile Photo URL field for web uploads.'
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.7,
        maxWidth: 720,
        maxHeight: 720
      });

      if (result?.didCancel) {
        return;
      }

      const asset = result?.assets?.[0];
      if (!asset) {
        return;
      }

      const mimeType = asset.type || 'image/jpeg';
      const nextPhoto = asset.base64
        ? `data:${mimeType};base64,${asset.base64}`
        : asset.uri || '';

      if (!nextPhoto) {
        throw new Error('Unable to read selected image');
      }

      setEditField('profilePhoto', nextPhoto);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Image selection failed',
        text2: error.message
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateEditForm()) {
      Toast.show({ type: 'error', text1: 'Please fix form errors' });
      return;
    }

    try {
      setSavingProfile(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Please login again');
      }

      await apiRequest('/users/vehicle', {
        method: 'PUT',
        token,
        body: {
          name: String(editForm.name || '').trim(),
          phone: String(editForm.phone || '').trim(),
          vehicleType: editForm.vehicleType,
          vehicleBrand: String(editForm.vehicleBrand || '').trim(),
          vehicleModel: String(editForm.vehicleModel || '').trim(),
          vehicleColor: String(editForm.vehicleColor || '').trim(),
          numberPlate: normalizePlate(editForm.numberPlate)
        }
      });

      if (editForm.profilePhoto && editForm.profilePhoto !== (user?.profilePhoto || '')) {
        await apiRequest('/users/photo', {
          method: 'POST',
          token,
          body: {
            profilePhoto: String(editForm.profilePhoto || '').trim()
          }
        });
      }

      await Promise.all([refreshProfile(), fetchMyRatings()]);
      setEditVisible(false);
      Toast.show({ type: 'success', text1: 'Profile updated successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Update failed', text2: error.message });
    } finally {
      setSavingProfile(false);
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
                {user?.profilePhoto ? (
                  <Image source={{ uri: user.profilePhoto }} style={styles.avatarPhoto} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={30} color="#0A84FF" />
                  </View>
                )}
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

              <View style={styles.vehicleCard}>
                <Text style={styles.vehicleTitle}>Vehicle Details</Text>
                {hasVehicleFields(user) ? (
                  <>
                    <Text style={styles.vehicleLine}>Type: {user?.vehicleType}</Text>
                    <Text style={styles.vehicleLine}>
                      Vehicle: {user?.vehicleBrand} {user?.vehicleModel} ({user?.vehicleColor})
                    </Text>
                    <Text style={styles.vehicleLine}>Number: {user?.numberPlate}</Text>
                  </>
                ) : (
                  <Text style={styles.vehicleWarningText}>No vehicle details added yet.</Text>
                )}
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
            <CustomButton title="Edit Profile" onPress={openEditModal} icon="create-outline" />
          </AnimatedReveal>
          <AnimatedReveal delay={140}>
            <CustomButton title="Refresh Profile" onPress={handleRefresh} loading={loading} variant="secondary" icon="refresh-outline" />
          </AnimatedReveal>
          <AnimatedReveal delay={180}>
            <CustomButton title="Logout" onPress={logout} variant="danger" icon="log-out-outline" style={styles.logoutButton} />
          </AnimatedReveal>
          <AnimatedReveal delay={220}>
            <View style={styles.legalLinksWrap}>
              <Text style={styles.legalLinkText} onPress={() => Linking.openURL('https://ride-buddy0-1.vercel.app/legal')}>Legal</Text>
            </View>
            <Text style={styles.versionText}>App Version: 1.0.0</Text>
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

      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={closeEditModal}>
        <Pressable style={styles.modalBackdrop} onPress={closeEditModal}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            {editForm.profilePhoto ? (
              <Image source={{ uri: editForm.profilePhoto }} style={styles.modalPhotoPreview} />
            ) : null}

            <CustomButton
              title={uploadingPhoto ? 'Selecting...' : 'Upload Profile Photo'}
              onPress={handlePickPhoto}
              variant="secondary"
              icon="image-outline"
              disabled={uploadingPhoto || savingProfile}
            />

            <InputField
              label="Profile Photo URL"
              value={editForm.profilePhoto}
              onChangeText={(value) => setEditField('profilePhoto', value)}
              placeholder="https://..."
              autoCapitalize="none"
              icon="link-outline"
              error={editErrors.profilePhoto}
            />

            <InputField
              label="Full Name"
              value={editForm.name}
              onChangeText={(value) => setEditField('name', value)}
              placeholder="Your full name"
              icon="person-outline"
              error={editErrors.name}
            />

            <InputField
              label="Phone Number"
              value={editForm.phone}
              onChangeText={(value) => setEditField('phone', value)}
              placeholder="9876543210"
              keyboardType="phone-pad"
              icon="call-outline"
              error={editErrors.phone}
            />

            <Text style={styles.modalSectionLabel}>Vehicle Type</Text>
            <View style={styles.vehicleTypeRow}>
              {['Car', 'Auto', 'Bike'].map((vehicleType) => (
                <CustomButton
                  key={vehicleType}
                  title={vehicleType}
                  variant={editForm.vehicleType === vehicleType ? 'primary' : 'secondary'}
                  onPress={() => setEditField('vehicleType', vehicleType)}
                  style={styles.vehicleTypeButton}
                />
              ))}
            </View>
            {!!editErrors.vehicleType && <Text style={styles.modalErrorText}>{editErrors.vehicleType}</Text>}

            <InputField
              label="Vehicle Brand"
              value={editForm.vehicleBrand}
              onChangeText={(value) => setEditField('vehicleBrand', value)}
              placeholder="Maruti"
              icon="car-outline"
              error={editErrors.vehicleBrand}
            />

            <InputField
              label="Vehicle Model"
              value={editForm.vehicleModel}
              onChangeText={(value) => setEditField('vehicleModel', value)}
              placeholder="Swift"
              icon="speedometer-outline"
              error={editErrors.vehicleModel}
            />

            <InputField
              label="Vehicle Color"
              value={editForm.vehicleColor}
              onChangeText={(value) => setEditField('vehicleColor', value)}
              placeholder="White"
              icon="color-palette-outline"
              error={editErrors.vehicleColor}
            />

            <InputField
              label="Number Plate"
              value={editForm.numberPlate}
              onChangeText={(value) => setEditField('numberPlate', value.toUpperCase())}
              placeholder="UP32AB1234"
              autoCapitalize="characters"
              icon="pricetag-outline"
              error={editErrors.numberPlate}
            />

            <CustomButton
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={savingProfile}
              icon="save-outline"
              disabled={uploadingPhoto}
            />
            <CustomButton
              title="Cancel"
              onPress={closeEditModal}
              variant="secondary"
              icon="close-outline"
              style={styles.modalCancelButton}
              disabled={savingProfile || uploadingPhoto}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  avatarPhoto: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#EEF4FF'
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
  vehicleCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#DDE7F9',
    borderRadius: tokens.radius.md,
    backgroundColor: '#F8FAFF',
    padding: 12
  },
  vehicleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8
  },
  vehicleLine: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4
  },
  vehicleWarningText: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '700'
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    maxHeight: '90%'
  },
  modalTitle: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '800',
    marginBottom: 12
  },
  modalPhotoPreview: {
    width: 82,
    height: 82,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: '#EFF6FF'
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    marginBottom: 8,
    marginTop: 2
  },
  vehicleTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  vehicleTypeButton: {
    flex: 1
  },
  modalErrorText: {
    marginBottom: 8,
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600'
  },
  modalCancelButton: {
    marginTop: 8
  },
  legalLinksWrap: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  legalLinkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  legalLinkDivider: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: '700'
  },
  versionText: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: '600'
  }
});

export default ProfileScreen;
