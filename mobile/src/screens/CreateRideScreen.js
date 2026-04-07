import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { ProgressBar, RideCardSkeleton, SuccessAnimation } from '../components';
import AnimatedReveal from '../components/AnimatedReveal';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { SUBSCRIPTION_TIERS } from '../constants/subscriptionTiers';
import colors from '../theme/colors';
import tokens from '../theme/tokens';
import {
  MIN_RIDE_YEAR,
  formatReadableDateTime,
  getMinimumRideDate,
  parseDateValue
} from '../utils/dateTime';

const CreateRideScreen = () => {
  const router = useRouter();
  const { addInAppNotification } = useNotifications();
  const { refreshProfile } = useAuth();
  const { tier, canCreateRide, getRidesRemaining, dailyRideCount, maxDailyRides, fetchSubscriptionStatus } = useSubscription();
  const [form, setForm] = useState({ source: '', destination: '', dateTime: '', price: '', seatsAvailable: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [checkingVehicle, setCheckingVehicle] = useState(true);
  const [vehicleReady, setVehicleReady] = useState(false);
  
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;
  const minimumRideDate = useMemo(() => getMinimumRideDate(), []);
  const selectedDate = useMemo(
    () => parseDateValue(form.dateTime) || minimumRideDate,
    [form.dateTime, minimumRideDate]
  );

  const isPositiveNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0;
  };

  const isPositiveWholeNumber = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0;
  };

  const getDateStartTimestamp = (value) => {
    const date = parseDateValue(value);
    if (!date) {
      return null;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };

  const isValidRideDateInput = (value) => {
    const date = parseDateValue(value);
    if (!date || date.getFullYear() < MIN_RIDE_YEAR) {
      return false;
    }

    const inputDateStart = getDateStartTimestamp(date);
    const todayDateStart = getDateStartTimestamp(new Date());
    return inputDateStart !== null && todayDateStart !== null && inputDateStart >= todayDateStart;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreparing(false);
    }, 220);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const routeFilled = form.source.trim() && form.destination.trim();
    const detailsFilled = isValidRideDateInput(form.dateTime) && isPositiveNumber(form.price) && isPositiveWholeNumber(form.seatsAvailable);

    if (routeFilled && detailsFilled) {
      setStep(3);
      return;
    }

    if (routeFilled) {
      setStep(2);
      return;
    }

    setStep(1);
  }, [form.source, form.destination, form.dateTime, form.price, form.seatsAvailable]);

  useEffect(() => {
    const checkVehicleDetails = async () => {
      try {
        setCheckingVehicle(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setVehicleReady(false);
          return;
        }

        const profile = (await refreshProfile()) || (await apiRequest('/users/profile', { token })).data;
        const isReady = Boolean(
          profile?.vehicleType &&
            profile?.vehicleBrand &&
            profile?.vehicleModel &&
            profile?.vehicleColor &&
            profile?.numberPlate
        );
        setVehicleReady(isReady);
      } catch (_error) {
        setVehicleReady(false);
      } finally {
        setCheckingVehicle(false);
      }
    };

    checkVehicleDetails();
  }, []);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    const trimmedValue = String(value ?? '').trim();
    let nextFieldError;

    if (field === 'source' && !trimmedValue) {
      nextFieldError = 'Source is required';
    }

    if (field === 'destination' && !trimmedValue) {
      nextFieldError = 'Destination is required';
    }

    if (field === 'dateTime') {
      nextFieldError = isValidRideDateInput(trimmedValue) ? undefined : 'Please select a valid future date';
    }

    if (field === 'price') {
      if (!trimmedValue) {
        nextFieldError = 'Price is required';
      } else if (!isPositiveNumber(trimmedValue)) {
        nextFieldError = 'Price must be greater than 0';
      }
    }

    if (field === 'seatsAvailable') {
      if (!trimmedValue) {
        nextFieldError = 'Seats are required';
      } else if (!isPositiveWholeNumber(trimmedValue)) {
        nextFieldError = 'Seats must be a positive whole number';
      }
    }

    setErrors((prev) => ({
      ...prev,
      [field]: nextFieldError
    }));
  };

  const bumpPrice = (delta) => {
    const next = Math.max(0, Number(form.price || 0) + delta);
    setField('price', String(next));
  };

  const bumpSeats = (delta) => {
    const current = Number(form.seatsAvailable || 1);
    const next = Math.max(1, current + delta);
    setField('seatsAvailable', String(next));
  };

  const validateForm = ({ source, destination, dateTime, price, seatsAvailable }) => {
    const nextErrors = {};

    if (!source) {
      nextErrors.source = 'Source is required';
    }
    if (!destination) {
      nextErrors.destination = 'Destination is required';
    }

    if (!isValidRideDateInput(dateTime)) {
      nextErrors.dateTime = 'Please select a valid future date';
    }

    if (!Number.isFinite(price) || price <= 0) {
      nextErrors.price = 'Price must be greater than 0';
    }

    if (!Number.isInteger(seatsAvailable) || seatsAvailable <= 0) {
      nextErrors.seatsAvailable = 'Seats must be a positive whole number';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isFormValid =
    form.source.trim().length > 0 &&
    form.destination.trim().length > 0 &&
    isValidRideDateInput(form.dateTime.trim()) &&
    isPositiveNumber(form.price) &&
    isPositiveWholeNumber(form.seatsAvailable) &&
    vehicleReady &&
    !checkingVehicle &&
    !loading;

  const handleDateChange = (_, dateValue) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (!dateValue) {
      return;
    }

    setField('dateTime', dateValue.toISOString());
  };

  const handleCreate = async () => {
    if (!canCreateRide()) {
      Alert.alert(
        'Daily Ride Limit Reached',
        `You've reached your daily limit of ${maxDailyRides} rides. Upgrade to Premium for unlimited rides!`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => router.push('/main/subscription')
          }
        ]
      );
      return;
    }

    const source = form.source.trim();
    const destination = form.destination.trim();
    const dateTime = form.dateTime.trim();
    const parsedDate = parseDateValue(dateTime);
    const isoDateTime = parsedDate ? parsedDate.toISOString() : '';
    const price = Number(form.price);
    const seatsAvailable = Number(form.seatsAvailable);

    if (!validateForm({ source, destination, dateTime, price, seatsAvailable })) {
      Toast.show({ type: 'error', text1: 'Please fix form errors' });
      return;
    }

    if (!vehicleReady) {
      Toast.show({
        type: 'error',
        text1: 'Vehicle details required',
        text2: 'Please add vehicle details before creating a ride'
      });
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Please login again to create a ride.');
      }

      if (__DEV__) {
        console.log('[CreateRide] Posting ride', { source, destination, dateTime: isoDateTime, price, seatsAvailable });
      }

      const response = await apiRequest('/rides', {
        method: 'POST',
        token,
        body: {
          source,
          destination,
          dateTime: isoDateTime,
          price,
          seatsAvailable
        }
      });

      await fetchSubscriptionStatus();

      addInAppNotification({
        type: 'ride_created',
        title: 'Ride Created',
        message: `${source} → ${destination} is now live.`,
        rideId: response?.data?._id || null
      });

      Toast.show({ type: 'success', text1: 'Ride created successfully' });
      setForm({ source: '', destination: '', dateTime: '', price: '', seatsAvailable: '' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to create ride', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (preparing) {
    return (
      <ScreenContainer contentContainerStyle={styles.screenContent}>
        <View style={styles.card}>
          <RideCardSkeleton />
          <RideCardSkeleton />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.screenContent}>
      {tier === SUBSCRIPTION_TIERS.FREE && (
        <AnimatedReveal>
          <TouchableOpacity 
            style={styles.limitBanner}
            onPress={() => router.push('/main/subscription')}
            activeOpacity={0.8}
          >
            <View style={styles.limitBannerContent}>
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text style={styles.limitBannerText}>
                {getRidesRemaining()} of {maxDailyRides} rides remaining today
              </Text>
            </View>
            <View style={styles.upgradeLinkRow}>
              <Text style={styles.upgradeLink}>Upgrade to Premium</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </AnimatedReveal>
      )}
      <AnimatedReveal>
        <View style={styles.card}>
          <LinearGradient colors={['rgba(37,99,235,0.14)', 'rgba(124,58,237,0.1)']} style={styles.cardGlow} />
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Ionicons name="car-sport" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.title}>Create Ride</Text>
              <Text style={styles.subtitle}>Select a date and time to publish your ride.</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            {[1, 2, 3].map((stepItem) => (
              <View key={stepItem} style={styles.stepItemWrap}>
                <View style={[styles.stepDot, step >= stepItem && styles.stepDotActive]}>
                  <Text style={[styles.stepDotText, step >= stepItem && styles.stepDotTextActive]}>{stepItem}</Text>
                </View>
                {stepItem < 3 ? <View style={[styles.stepLine, step > stepItem && styles.stepLineActive]} /> : null}
              </View>
            ))}
          </View>

          <View style={styles.stepLabelsRow}>
            <Text style={styles.stepLabelText}>Route</Text>
            <Text style={styles.stepLabelText}>Details</Text>
            <Text style={styles.stepLabelText}>Confirm</Text>
          </View>

          <InputField label="Source" value={form.source} onChangeText={(value) => setField('source', value)} placeholder="City / Area" error={errors.source} icon="navigate-outline" />
          <InputField label="Destination" value={form.destination} onChangeText={(value) => setField('destination', value)} placeholder="City / Area" error={errors.destination} icon="location-outline" />
          <View style={styles.dateFieldWrap}>
            <Text style={styles.dateFieldLabel}>Date & Time</Text>
            <Pressable
              style={styles.dateFieldButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateFieldIconWrap}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.dateFieldValue, !form.dateTime && styles.dateFieldPlaceholder]}>
                {form.dateTime ? formatReadableDateTime(form.dateTime) : 'Select date & time'}
              </Text>
            </Pressable>
            {!!errors.dateTime && <Text style={styles.dateFieldError}>{errors.dateTime}</Text>}
          </View>

          {showDatePicker ? (
            <DateTimePicker
              value={selectedDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={minimumRideDate}
              onChange={handleDateChange}
            />
          ) : null}

          {Platform.OS === 'ios' && showDatePicker ? (
            <View style={styles.iosPickerActions}>
              <CustomButton
                title="Done"
                onPress={() => setShowDatePicker(false)}
                variant="secondary"
              />
            </View>
          ) : null}

          <View style={styles.counterCard}>
            <Text style={styles.counterTitle}>Price (₹)</Text>
            <View style={styles.counterRow}>
              <Pressable style={styles.counterBtn} onPress={() => bumpPrice(-10)}><Ionicons name="remove" size={18} color={colors.primary} /></Pressable>
              <InputField label="Price" value={form.price} onChangeText={(value) => setField('price', value)} placeholder="120" keyboardType="numeric" error={errors.price} icon="wallet-outline" style={styles.counterInput} />
              <Pressable style={styles.counterBtn} onPress={() => bumpPrice(10)}><Ionicons name="add" size={18} color={colors.primary} /></Pressable>
            </View>
          </View>

          <View style={styles.counterCard}>
            <Text style={styles.counterTitle}>Seats Available</Text>
            <View style={styles.seatsCounterRow}>
              <Pressable style={styles.counterBtn} onPress={() => bumpSeats(-1)}><Ionicons name="remove" size={18} color={colors.primary} /></Pressable>
              <Text style={styles.seatsCounterText}>{form.seatsAvailable || '1'}</Text>
              <Pressable style={styles.counterBtn} onPress={() => bumpSeats(1)}><Ionicons name="add" size={18} color={colors.primary} /></Pressable>
            </View>
            {!!errors.seatsAvailable && <Text style={styles.dateFieldError}>{errors.seatsAvailable}</Text>}
          </View>

          {!vehicleReady && !checkingVehicle ? (
            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={18} color="#B45309" />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningText}>Please add vehicle details before creating a ride</Text>
                <Pressable onPress={() => router.push('/(tabs)/profile')}>
                  <Text style={styles.warningLink}>Edit profile</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <CustomButton
            title="Publish Ride"
            onPress={handleCreate}
            loading={loading}
            icon="paper-plane-outline"
            disabled={!isFormValid}
          />
        </View>
      </AnimatedReveal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: tokens.spacing['4xl']
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: '#D9E4FA',
    padding: tokens.spacing.lg,
    overflow: 'hidden',
    ...tokens.shadows.soft
  },
  cardGlow: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: -10,
    height: 80,
    borderRadius: tokens.radius.xl
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  stepItemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepDotActive: {
    borderColor: '#1a56db',
    backgroundColor: '#DBEAFE'
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B'
  },
  stepDotTextActive: {
    color: '#1a56db'
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8
  },
  stepLineActive: {
    backgroundColor: '#93C5FD'
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  stepLabelText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700'
  },
  titleIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: tokens.typography.h1,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3
  },
  subtitle: {
    marginTop: 2,
    color: colors.mutedText,
    lineHeight: 20,
    maxWidth: 260
  },
  dateFieldWrap: {
    marginBottom: 16
  },
  dateFieldLabel: {
    marginBottom: 8,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700'
  },
  dateFieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#D9E3F8',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: tokens.radius.lg,
    paddingHorizontal: 14,
    ...tokens.shadows.soft
  },
  dateFieldIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    width: 24,
    height: 24
  },
  dateFieldValue: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20
  },
  dateFieldPlaceholder: {
    color: '#9AA4B2'
  },
  dateFieldError: {
    marginTop: 7,
    marginLeft: 2,
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600'
  },
  iosPickerActions: {
    marginBottom: 12
  },
  counterCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D9E3F8',
    borderRadius: tokens.radius.md,
    padding: 10,
    backgroundColor: '#FFFFFF'
  },
  counterTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  counterInput: {
    flex: 1,
    marginBottom: 0
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  seatsCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 6
  },
  seatsCounterText: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  warningCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 13,
    fontWeight: '700'
  },
  warningLink: {
    marginTop: 4,
    color: '#1a56db',
    fontSize: 12,
    fontWeight: '800'
  },
  limitBanner: {
    marginBottom: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  limitBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  limitBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E'
  },
  upgradeLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  upgradeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  }
});

export default CreateRideScreen;
