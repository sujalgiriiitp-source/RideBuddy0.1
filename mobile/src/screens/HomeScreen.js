import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import RideCard from '../components/RideCard';
import AnimatedReveal from '../components/AnimatedReveal';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

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
          <LinearGradient colors={['rgba(37,99,235,0.16)', 'rgba(124,58,237,0.12)']} style={styles.heroGlow} />
          <View style={styles.topRow}>
            <View>
              <Text style={styles.topLabel}>Good Morning, Sujal</Text>
              <Text style={styles.title}>Find your next ride</Text>
            </View>
            <View style={styles.mapIconWrap}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color="#8C98A8" />
            <TextInput
              placeholder="Search routes, destination, pickup"
              placeholderTextColor="#9AA4B2"
              style={styles.searchInput}
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
          rides.map((ride, index) => (
            <RideCard
              key={ride._id}
              ride={ride}
              index={index}
              onPress={() => navigation.navigate('Ride Details', { rideId: ride._id })}
            />
          ))
        )}
      </ScreenContainer>

      <AnimatedReveal delay={240} fromY={24} style={styles.fabWrap}>
        <Pressable
          style={styles.fabPress}
          onPress={() => navigation.navigate('Create Ride')}
          accessibilityRole="button"
          accessibilityLabel="Create Ride"
        >
          <LinearGradient colors={tokens.gradients.fab} style={styles.fab}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.fabText}>Create Ride</Text>
          </LinearGradient>
        </Pressable>
      </AnimatedReveal>
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
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: '#D8E4FA',
    padding: 18,
    marginBottom: 18,
    overflow: 'hidden',
    ...tokens.shadows.soft
  },
  heroGlow: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: -14,
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
    color: colors.mutedText,
    fontSize: tokens.typography.caption,
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
    fontSize: tokens.typography.h1,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DCE6F8',
    borderRadius: tokens.radius.lg,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.92)'
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
    fontSize: tokens.typography.h2,
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
    backgroundColor: '#DFEAFE',
    overflow: 'hidden'
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: tokens.radius.lg,
    borderColor: '#DCE6F8',
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
  fabWrap: {
    position: 'absolute',
    right: 18,
    bottom: 28
  },
  fabPress: {
    borderRadius: tokens.radius.pill
  },
  fab: {
    height: 54,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...tokens.shadows.strong
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});

export default HomeScreen;
