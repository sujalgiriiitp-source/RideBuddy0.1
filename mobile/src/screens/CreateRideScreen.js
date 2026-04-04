import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { ProgressBar, SuccessAnimation } from '../components';
import AnimatedReveal from '../components/AnimatedReveal';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const CreateRideScreen = () => {
  const [form, setForm] = useState({ source: '', destination: '', dateTime: '', price: '', seatsAvailable: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const normalizeDateInput = (value) => {
    const raw = String(value || '').trim();

    if (!raw) {
      return '';
    }

    return raw.replace(' ', 'T');
  };

  const toIsoDateTime = (value) => {
    const normalized = normalizeDateInput(value);
    if (!normalized) {
      return '';
    }

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString();
  };

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = ({ source, destination, dateTime, price, seatsAvailable }) => {
    const nextErrors = {};

    if (!source) {
      nextErrors.source = 'Source is required';
    }
    if (!destination) {
      nextErrors.destination = 'Destination is required';
    }

    if (!dateTime) {
      nextErrors.dateTime = 'Please select date & time';
    } else if (!toIsoDateTime(dateTime)) {
      nextErrors.dateTime = 'Please select date & time';
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

  const handleCreate = async () => {
    const source = form.source.trim();
    const destination = form.destination.trim();
    const dateTime = normalizeDateInput(form.dateTime);
    const isoDateTime = toIsoDateTime(dateTime);
    const price = Number(form.price);
    const seatsAvailable = Number(form.seatsAvailable);

    if (!validateForm({ source, destination, dateTime, price, seatsAvailable })) {
      Toast.show({ type: 'error', text1: 'Please fix form errors' });
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

      await apiRequest('/rides', {
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
      Toast.show({ type: 'success', text1: 'Ride created successfully' });
      setForm({ source: '', destination: '', dateTime: '', price: '', seatsAvailable: '' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to create ride', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
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

          <InputField label="Source" value={form.source} onChangeText={(value) => setField('source', value)} placeholder="City / Area" error={errors.source} icon="navigate-outline" />
          <InputField label="Destination" value={form.destination} onChangeText={(value) => setField('destination', value)} placeholder="City / Area" error={errors.destination} icon="location-outline" />
          <InputField
            label="Date & Time"
            value={form.dateTime}
            onChangeText={(value) => setField('dateTime', value)}
            placeholder="YYYY-MM-DD HH:mm"
            error={errors.dateTime}
            icon="calendar-outline"
          />
          <InputField label="Price (₹)" value={form.price} onChangeText={(value) => setField('price', value)} placeholder="120" keyboardType="numeric" error={errors.price} icon="wallet-outline" />
          <InputField
            label="Seats Available"
            value={form.seatsAvailable}
            onChangeText={(value) => setField('seatsAvailable', value)}
            placeholder="3"
            keyboardType="numeric"
            error={errors.seatsAvailable}
            icon="people-outline"
          />
          <CustomButton
            title="Publish Ride"
            onPress={handleCreate}
            loading={loading}
            icon="paper-plane-outline"
            disabled={loading || !form.source.trim() || !form.destination.trim() || !form.dateTime.trim() || !form.price.trim() || !form.seatsAvailable.trim()}
          />
        </View>
      </AnimatedReveal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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

});

export default CreateRideScreen;
