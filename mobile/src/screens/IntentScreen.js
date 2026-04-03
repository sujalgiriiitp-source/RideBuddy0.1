import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import RideCard from '../components/RideCard';
import colors from '../theme/colors';

const IntentScreen = () => {
  const [form, setForm] = useState({ source: '', destination: '', dateTime: '' });
  const [errors, setErrors] = useState({});
  const [intents, setIntents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = ({ source, destination, dateTime }) => {
    const nextErrors = {};
    if (!source) {
      nextErrors.source = 'Source is required';
    }
    if (!destination) {
      nextErrors.destination = 'Destination is required';
    }
    if (!dateTime) {
      nextErrors.dateTime = 'Date & time are required';
    } else {
      const parsedDate = new Date(dateTime);
      if (Number.isNaN(parsedDate.getTime())) {
        nextErrors.dateTime = 'Enter valid ISO datetime';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fetchIntents = async () => {
    const response = await apiRequest('/intents');
    setIntents(response.data || []);
  };

  const fetchMatches = async () => {
    const token = await AsyncStorage.getItem('token');
    const response = await apiRequest('/intents/match', { token });
    setMatches(response.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchIntents(), fetchMatches()]);
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Unable to load intents', text2: error.message });
        setIntents([]);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const postIntent = async () => {
    const source = form.source.trim();
    const destination = form.destination.trim();
    const dateTime = form.dateTime.trim();

    if (!validateForm({ source, destination, dateTime })) {
      Toast.show({ type: 'error', text1: 'Please fix form errors' });
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      await apiRequest('/intents', {
        method: 'POST',
        token,
        body: {
          source,
          destination,
          dateTime
        }
      });
      setForm({ source: '', destination: '', dateTime: '' });
      await Promise.all([fetchIntents(), fetchMatches()]);
      Toast.show({ type: 'success', text1: 'Travel intent posted' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to post intent', text2: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.title}>Travel Intent</Text>
        <Text style={styles.subtitle}>Tell others where and when you plan to travel.</Text>

        <InputField
          label="Source"
          value={form.source}
          onChangeText={(value) => setField('source', value)}
          placeholder="From"
          error={errors.source}
        />
        <InputField
          label="Destination"
          value={form.destination}
          onChangeText={(value) => setField('destination', value)}
          placeholder="To"
          error={errors.destination}
        />
        <InputField
          label="Date & Time (ISO)"
          value={form.dateTime}
          onChangeText={(value) => setField('dateTime', value)}
          placeholder="2026-04-10T16:00:00.000Z"
          error={errors.dateTime}
        />
        <CustomButton
          title="Post Intent"
          onPress={postIntent}
          loading={submitting}
          disabled={submitting || !form.source.trim() || !form.destination.trim() || !form.dateTime.trim()}
        />
      </View>

      <Text style={styles.section}>Matched Rides</Text>
      {matches.length === 0 ? <Text style={styles.empty}>No matches yet.</Text> : matches.map((ride) => <RideCard key={ride._id} ride={ride} />)}

      <Text style={styles.section}>Public Intents</Text>
      {intents.length === 0 ? (
        <Text style={styles.empty}>No travel intents posted yet.</Text>
      ) : (
        intents.map((intent) => (
          <View style={styles.intentCard} key={intent._id}>
            <Text style={styles.intentRoute}>{intent.source} → {intent.destination}</Text>
            <Text style={styles.intentMeta}>When: {formatDisplayDate(intent.dateTime || intent.date)}</Text>
            <Text style={styles.intentMeta}>By: {intent?.user?.name || 'Anonymous'}</Text>
          </View>
        ))
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 14,
    color: colors.mutedText,
    lineHeight: 20
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
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
  section: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  empty: {
    color: colors.mutedText,
    marginBottom: 8
  },
  intentCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  intentRoute: {
    fontWeight: '700',
    color: colors.text
  },
  intentMeta: {
    marginTop: 4,
    color: colors.mutedText
  }
});

export default IntentScreen;
