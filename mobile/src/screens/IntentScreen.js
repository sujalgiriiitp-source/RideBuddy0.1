import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }
  return date.toLocaleString();
};

const formatRelative = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const diff = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60));
  if (diff <= 0) {
    return 'starting soon';
  }
  if (diff === 1) {
    return 'in 1 hour';
  }
  return `in ${diff} hours`;
};

const IntentScreen = ({ navigation }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [dateTime, setDateTime] = useState(new Date(Date.now() + 30 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publicIntents, setPublicIntents] = useState([]);
  const [myIntents, setMyIntents] = useState([]);
  const [busyIntentId, setBusyIntentId] = useState('');
  const [hiddenIntentIds, setHiddenIntentIds] = useState([]);
  const [acceptBanner, setAcceptBanner] = useState(null);

  const fetchAll = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    const [nearbyResponse, myResponse, unreadNotificationResponse] = await Promise.all([
      apiRequest('/intents/nearby', { token }),
      apiRequest('/intents/my-intents', { token }),
      apiRequest('/notifications', { token })
    ]);

    setPublicIntents((nearbyResponse.data || []).filter((intent) => !hiddenIntentIds.includes(String(intent._id))));
    setMyIntents(myResponse.data || []);

    const acceptedNotification = (unreadNotificationResponse.data || []).find(
      (item) => item.type === 'RIDE_ACCEPTED'
    );
    setAcceptBanner(acceptedNotification || null);
  }, [hiddenIntentIds]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchAll();
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Unable to load intents', text2: error.message });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchAll]);

  const postIntent = async () => {
    const trimmedSource = source.trim();
    const trimmedDestination = destination.trim();
    if (!trimmedSource || !trimmedDestination) {
      Toast.show({ type: 'error', text1: 'Please fill source and destination' });
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      await apiRequest('/intents', {
        method: 'POST',
        token,
        body: {
          source: trimmedSource,
          destination: trimmedDestination,
          dateTime: dateTime.toISOString()
        }
      });
      setSource('');
      setDestination('');
      Toast.show({
        type: 'success',
        text1: 'Your request has been sent!',
        text2: 'Drivers nearby will be notified.'
      });
      await fetchAll();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to post intent', text2: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const respondToIntent = async (intentId, action) => {
    try {
      setBusyIntentId(String(intentId));
      const token = await AsyncStorage.getItem('token');
      const response = await apiRequest(`/intents/${intentId}/respond`, {
        method: 'POST',
        token,
        body: { action }
      });

      if (action === 'accept') {
        Toast.show({
          type: 'success',
          text1: "Request sent! You'll be connected via chat."
        });

        if (response?.data?.conversationId) {
          navigation.navigate('ChatScreen', {
            conversationId: response.data.conversationId,
            rideName: 'Intent Match'
          });
        }
      } else {
        setHiddenIntentIds((prev) => [...prev, String(intentId)]);
      }

      await fetchAll();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to submit response', text2: error.message });
    } finally {
      setBusyIntentId('');
    }
  };

  const cancelIntent = async (intentId) => {
    try {
      setBusyIntentId(String(intentId));
      const token = await AsyncStorage.getItem('token');
      await apiRequest(`/intents/${intentId}`, { method: 'DELETE', token });
      Toast.show({ type: 'success', text1: 'Intent cancelled' });
      await fetchAll();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to cancel intent', text2: error.message });
    } finally {
      setBusyIntentId('');
    }
  };

  const openBannerChat = async () => {
    if (!acceptBanner) {
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await apiRequest(`/notifications/${acceptBanner._id}/read`, { method: 'PUT', token });
      setAcceptBanner(null);
      if (acceptBanner?.data?.conversationId) {
        navigation.navigate('ChatScreen', {
          conversationId: acceptBanner.data.conversationId,
          rideName: 'Intent Match'
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unable to open chat', text2: error.message });
    }
  };

  const publicIntentData = useMemo(
    () => publicIntents.filter((intent) => !hiddenIntentIds.includes(String(intent._id))),
    [publicIntents, hiddenIntentIds]
  );

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {acceptBanner ? (
        <Pressable style={styles.banner} onPress={openBannerChat}>
          <Text style={styles.bannerText}>
            🎉 {acceptBanner.body} {'\n'}Open Chat →
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.title}>Travel Intent</Text>
        <InputField label="Source" value={source} onChangeText={setSource} placeholder="📍 Starting location" />
        <InputField
          label="Destination"
          value={destination}
          onChangeText={setDestination}
          placeholder="🏁 Destination"
        />

        {Platform.OS === 'web' ? (
          <InputField
            label="Date & Time"
            value={dateTime.toISOString().slice(0, 16)}
            onChangeText={(value) => {
              const next = new Date(value);
              if (!Number.isNaN(next.getTime())) {
                setDateTime(next);
              }
            }}
            type="datetime-local"
            placeholder="Choose date and time"
          />
        ) : (
          <>
            <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
              <Text style={styles.dateButtonText}>📅 {formatDateTime(dateTime)}</Text>
            </Pressable>
            {showPicker ? (
              <DateTimePicker
                value={dateTime}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowPicker(false);
                  }
                  if (selectedDate) {
                    setDateTime(selectedDate);
                  }
                }}
              />
            ) : null}
          </>
        )}

        <CustomButton
          title="Post Intent"
          loading={submitting}
          onPress={postIntent}
          disabled={submitting || loading}
        />
      </View>

      <Text style={styles.sectionHeading}>My Active Intents</Text>
      <FlatList
        data={myIntents}
        keyExtractor={(item) => String(item._id)}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No active intents yet.</Text>}
        renderItem={({ item }) => {
          const acceptedResponse = (item.responses || []).find((response) => response.status === 'accepted');
          const pendingCount = (item.responses || []).filter((response) => response.status === 'pending').length;
          const isMatched = item.status === 'matched' && acceptedResponse;

          return (
            <View style={styles.intentCard}>
              <Text style={styles.routeText}>🗺️ {item.source} → {item.destination}</Text>
              {isMatched ? (
                <>
                  <Text style={styles.matchText}>✅ {acceptedResponse.driverId?.name || 'Driver'} accepted!</Text>
                  <Text style={styles.metaText}>
                    {acceptedResponse.driverId?.vehicleBrand || 'Vehicle'} {acceptedResponse.driverId?.vehicleModel || ''}
                    {acceptedResponse.driverId?.numberPlate ? ` • ${acceptedResponse.driverId.numberPlate}` : ''}
                  </Text>
                  <CustomButton
                    title="💬 Open Chat"
                    variant="secondary"
                    onPress={() =>
                      navigation.navigate('ChatScreen', {
                        conversationId: item.conversationId?._id || item.conversationId,
                        rideName: 'Intent Match'
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <Text style={styles.metaText}>📅 {formatDateTime(item.dateTime)}</Text>
                  <Text style={styles.metaText}>Status: 🟡 Waiting for driver</Text>
                  <Text style={styles.metaText}>[{pendingCount} drivers notified]</Text>
                  <CustomButton
                    title="❌ Cancel Intent"
                    variant="secondary"
                    loading={busyIntentId === String(item._id)}
                    onPress={() => cancelIntent(item._id)}
                  />
                </>
              )}
            </View>
          );
        }}
      />

      <Text style={styles.sectionHeading}>Public Intents</Text>
      <FlatList
        data={publicIntentData}
        keyExtractor={(item) => String(item._id)}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No public intents available right now.</Text>}
        renderItem={({ item }) => (
          <View style={styles.intentCard}>
            <Text style={styles.metaText}>👤 {item?.userId?.name || 'Passenger'}</Text>
            <Text style={styles.routeText}>🗺️ {item.source} → {item.destination}</Text>
            <Text style={styles.metaText}>📅 {formatDateTime(item.dateTime)}</Text>
            <Text style={styles.metaText}>⏱️ {formatRelative(item.dateTime)}</Text>
            <View style={styles.actionsRow}>
              <CustomButton
                title="🚗 Offer Ride"
                loading={busyIntentId === String(item._id)}
                onPress={() => respondToIntent(item._id, 'accept')}
                style={styles.actionButton}
              />
              <CustomButton
                title="❌ Skip"
                variant="secondary"
                loading={busyIntentId === String(item._id)}
                onPress={() => respondToIntent(item._id, 'decline')}
                style={styles.actionButton}
              />
            </View>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: tokens.spacing['4xl']
  },
  banner: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md
  },
  bannerText: {
    color: '#9A3412',
    fontWeight: '700'
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: '#DCE6F8',
    marginBottom: tokens.spacing.lg
  },
  title: {
    fontSize: tokens.typography.h2,
    fontWeight: '800',
    color: colors.text,
    marginBottom: tokens.spacing.sm
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md
  },
  dateButtonText: {
    color: colors.text
  },
  sectionHeading: {
    fontSize: tokens.typography.h3,
    fontWeight: '800',
    color: colors.text,
    marginBottom: tokens.spacing.sm,
    marginTop: tokens.spacing.md
  },
  intentCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm
  },
  routeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6
  },
  matchText: {
    color: '#15803D',
    fontWeight: '700',
    marginBottom: 4
  },
  metaText: {
    color: colors.textSecondary,
    marginBottom: 4
  },
  emptyText: {
    color: colors.textSecondary,
    marginBottom: tokens.spacing.md
  },
  actionsRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.sm
  },
  actionButton: {
    flex: 1
  }
});

export default IntentScreen;
