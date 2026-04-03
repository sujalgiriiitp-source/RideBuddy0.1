import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import colors from '../theme/colors';

const CreateRideScreen = () => {
  const [form, setForm] = useState({ source: '', destination: '', dateTime: '', price: '', seatsAvailable: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    const parsedDate = new Date(dateTime);
    if (!dateTime) {
      nextErrors.dateTime = 'Date & time are required';
    } else if (Number.isNaN(parsedDate.getTime())) {
      nextErrors.dateTime = 'Enter valid ISO datetime';
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
    const dateTime = form.dateTime.trim();
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
        console.log('[CreateRide] Posting ride', { source, destination, dateTime, price, seatsAvailable });
      }

      await apiRequest('/rides', {
        method: 'POST',
        token,
        body: {
          source,
          destination,
          dateTime,
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
      <View style={styles.card}>
        <Text style={styles.title}>Create Ride</Text>
        <Text style={styles.subtitle}>Use ISO datetime format, e.g. 2026-04-10T16:00:00.000Z</Text>

        <InputField label="Source" value={form.source} onChangeText={(value) => setField('source', value)} placeholder="City / Area" error={errors.source} />
        <InputField label="Destination" value={form.destination} onChangeText={(value) => setField('destination', value)} placeholder="City / Area" error={errors.destination} />
        <InputField label="Date & Time (ISO)" value={form.dateTime} onChangeText={(value) => setField('dateTime', value)} placeholder="2026-04-10T16:00:00.000Z" error={errors.dateTime} />
        <InputField label="Price (₹)" value={form.price} onChangeText={(value) => setField('price', value)} placeholder="120" keyboardType="numeric" error={errors.price} />
        <InputField
          label="Seats Available"
          value={form.seatsAvailable}
          onChangeText={(value) => setField('seatsAvailable', value)}
          placeholder="3"
          keyboardType="numeric"
          error={errors.seatsAvailable}
        />
        <CustomButton
          title="Publish Ride"
          onPress={handleCreate}
          loading={loading}
          disabled={loading || !form.source.trim() || !form.destination.trim() || !form.dateTime.trim() || !form.price.trim() || !form.seatsAvailable.trim()}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3
  },
  subtitle: {
    marginBottom: 14,
    color: colors.mutedText,
    lineHeight: 20
  }
});

export default CreateRideScreen;
