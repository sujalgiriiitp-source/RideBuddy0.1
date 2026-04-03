import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import RideCard from '../components/RideCard';
import colors from '../theme/colors';

const HomeScreen = ({ navigation }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = useCallback(async () => {
    if (__DEV__) {
      console.log('[HomeScreen] Fetching rides...');
    }
    const response = await apiRequest('/rides');
    setRides(response.data || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchRides();
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Unable to load rides', text2: error.message });
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchRides]);

  useFocusEffect(
    useCallback(() => {
      fetchRides().catch((error) => {
        Toast.show({ type: 'error', text1: 'Unable to refresh rides', text2: error.message });
      });
    }, [fetchRides])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchRides();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Refresh failed', text2: error.message });
    } finally {
      setRefreshing(false);
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
    <View style={styles.page}>
      <ScreenContainer refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.heroCard}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.topLabel}>Good day</Text>
            <Text style={styles.title}>Find your next ride</Text>
          </View>
          <View style={styles.mapIconWrap}>
            <Ionicons name="location" size={20} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#8C98A8" />
          <TextInput
            placeholder="Where to?"
            placeholderTextColor="#9AA4B2"
            style={styles.searchInput}
            editable={false}
          />
        </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.heading}>Available rides</Text>
          <Text style={styles.count}>{rides.length}</Text>
        </View>

        {rides.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={28} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No rides available</Text>
            <Text style={styles.emptySub}>Pull to refresh or tap Create Ride.</Text>
          </View>
        ) : (
          rides.map((ride) => (
            <RideCard
              key={ride._id}
              ride={ride}
              onPress={() => navigation.navigate('Ride Details', { rideId: ride._id })}
            />
          ))
        )}
      </ScreenContainer>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('Create Ride')}
        accessibilityRole="button"
        accessibilityLabel="Create Ride"
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Create Ride</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    padding: 18,
    marginBottom: 18,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  topLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  mapIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#F8FAFC'
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text
  },
  count: {
    minWidth: 30,
    height: 30,
    borderRadius: 999,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
    overflow: 'hidden'
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: '#E6EAF0',
    borderWidth: 1,
    padding: 22,
    alignItems: 'center'
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text
  },
  emptySub: {
    marginTop: 6,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 20
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});

export default HomeScreen;
