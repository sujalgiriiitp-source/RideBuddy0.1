import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import RideCard from '../components/RideCard';
import { RideCardSkeleton, AnimatedEmptyState, StaggeredItem } from '../components';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { MIN_RIDE_YEAR } from '../utils/dateTime';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const HomeScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { unreadCount } = useNotifications();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fabPressed, setFabPressed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [driverRatings, setDriverRatings] = useState({});
  const fabScale = React.useRef(new Animated.Value(1)).current;

  const fetchDriverRatings = useCallback(async (rideList = []) => {
    const uniqueDriverIds = Array.from(
      new Set(
        rideList
          .map((ride) => ride?.createdBy?._id || ride?.createdBy?.id || ride?.createdBy)
          .filter(Boolean)
          .map((id) => String(id))
      )
    );

    if (uniqueDriverIds.length === 0) {
      setDriverRatings({});
      return;
    }

    const results = await Promise.all(
      uniqueDriverIds.map(async (driverId) => {
        try {
          const response = await apiRequest(`/ratings/user/${driverId}`);
          return {
            driverId,
            summary: response?.data || { averageRating: 0, totalRideCount: 0 }
          };
        } catch (error) {
          return {
            driverId,
            summary: { averageRating: 0, totalRideCount: 0 }
          };
        }
      })
    );

    const nextMap = {};
    results.forEach((item) => {
      nextMap[item.driverId] = item.summary;
    });

    setDriverRatings(nextMap);
  }, []);

  const normalizeDateString = (value) => {
    if (!value) {
      return '';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredRides = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedDate = filterDate.trim();
    const parsedMinPrice = minPrice.trim() ? Number(minPrice) : null;
    const parsedMaxPrice = maxPrice.trim() ? Number(maxPrice) : null;

    const nextRides = rides.filter((ride) => {
      const source = String(ride?.source || ride?.from || '').toLowerCase();
      const destination = String(ride?.destination || ride?.to || '').toLowerCase();
      const parsedRideDate = new Date(ride?.dateTime || ride?.date || '');
      const isValidRideDate = Number.isFinite(parsedRideDate.getTime());
      const isFutureRide = isValidRideDate && parsedRideDate.getFullYear() >= MIN_RIDE_YEAR && parsedRideDate.getTime() >= Date.now();
      const rideDate = normalizeDateString(ride?.dateTime || ride?.date);
      const ridePrice = Number(ride?.price ?? 0);

      const matchesQuery =
        !normalizedQuery || source.includes(normalizedQuery) || destination.includes(normalizedQuery);

      const matchesDate = !normalizedDate || rideDate === normalizedDate;

      const matchesMinPrice =
        parsedMinPrice === null || (Number.isFinite(parsedMinPrice) && ridePrice >= parsedMinPrice);

      const matchesMaxPrice =
        parsedMaxPrice === null || (Number.isFinite(parsedMaxPrice) && ridePrice <= parsedMaxPrice);

      return isFutureRide && matchesQuery && matchesDate && matchesMinPrice && matchesMaxPrice;
    });

    const sortedRides = [...nextRides];

    if (sortBy === 'price') {
      sortedRides.sort((firstRide, secondRide) => {
        const firstPrice = Number(firstRide?.price ?? 0);
        const secondPrice = Number(secondRide?.price ?? 0);
        return firstPrice - secondPrice;
      });
      return sortedRides;
    }

    sortedRides.sort((firstRide, secondRide) => {
      const firstTime = new Date(firstRide?.dateTime || firstRide?.date || 0).getTime();
      const secondTime = new Date(secondRide?.dateTime || secondRide?.date || 0).getTime();
      return firstTime - secondTime;
    });

    return sortedRides;
  }, [rides, searchQuery, filterDate, minPrice, maxPrice, sortBy]);

  const handleFilterDateChange = useCallback((_, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (!selectedDate) {
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    setFilterDate(`${year}-${month}-${day}`);
  }, []);

  const fetchRides = useCallback(async () => {
    if (__DEV__) {
      console.log('[HomeScreen] Fetching rides...');
    }
    const response = await apiRequest('/rides');
    const nextRides = response.data || [];
    setRides(nextRides);
    fetchDriverRatings(nextRides).catch(() => {
      setDriverRatings({});
    });
  }, [fetchDriverRatings]);

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

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchRides();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Refresh failed', text2: error.message });
    } finally {
      setRefreshing(false);
    }
  }, [fetchRides]);

  const onFabPressIn = useCallback(() => {
    setFabPressed(true);
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.spring(fabScale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
      tension: 100
    }).start();
  }, [fabScale]);

  const onFabPressOut = useCallback(() => {
    setFabPressed(false);
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100
    }).start();
  }, [fabScale]);

  const goToNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const goToCreateRide = useCallback(() => {
    navigation.navigate('Create Ride');
  }, [navigation]);

  const goToRideDetails = useCallback(
    (rideId) => {
      navigation.navigate('Ride Details', { rideId });
    },
    [navigation]
  );

  const onSortByTime = useCallback(() => {
    setSortBy('time');
  }, []);

  const onSortByPrice = useCallback(() => {
    setSortBy('price');
  }, []);

  const keyExtractor = useCallback((item, index) => item?._id || String(index), []);

  const renderHeader = useCallback(() => (
    <>
      <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
        <LinearGradient colors={['rgba(37,99,235,0.16)', 'rgba(124,58,237,0.12)']} style={styles.heroGlow} />
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.topLabel, { color: theme.textSecondary }]}>Good Morning, Sujal</Text>
            <Text style={[styles.title, { color: theme.text }]}>Find your next ride</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={[styles.themeToggle, { borderColor: theme.border, backgroundColor: theme.surface }]} onPress={toggleTheme}>
              <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={18} color={theme.primary} />
            </Pressable>
            <Pressable
              style={[styles.themeToggle, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={goToNotifications}
            >
              <Ionicons name="notifications-outline" size={18} color={theme.primary} />
              {unreadCount > 0 ? (
                <View style={styles.unreadDot}>
                  <Text style={styles.unreadDotText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
            <View style={[styles.mapIconWrap, { backgroundColor: theme.primary }]}> 
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <View style={[styles.searchWrap, { borderColor: theme.border, backgroundColor: theme.surface }]}> 
          <Ionicons name="search-outline" size={18} color="#8C98A8" />
          <TextInput
            placeholder="Search routes, destination, pickup"
            placeholderTextColor="#9AA4B2"
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filtersGrid}>
          <View style={[styles.filterInputWrap, { borderColor: theme.border, backgroundColor: theme.surface }]}> 
            <Ionicons name="calendar-outline" size={16} color="#8C98A8" />
            <Pressable style={styles.datePressArea} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.filterInput, { color: filterDate ? theme.text : '#9AA4B2' }]}>
                {filterDate || 'Select date'}
              </Text>
            </Pressable>
            {filterDate ? (
              <Pressable onPress={() => setFilterDate('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </Pressable>
            ) : null}
          </View>

          {showDatePicker ? (
            <DateTimePicker
              value={filterDate ? new Date(`${filterDate}T00:00:00`) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleFilterDateChange}
            />
          ) : null}

          {Platform.OS === 'ios' && showDatePicker ? (
            <Pressable style={styles.dateDoneBtn} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.dateDoneText}>Done</Text>
            </Pressable>
          ) : null}

          <View style={styles.priceRow}>
            <View style={[styles.filterInputWrap, styles.priceInputWrap, { borderColor: theme.border, backgroundColor: theme.surface }]}> 
              <TextInput
                placeholder="Min ₹"
                placeholderTextColor="#9AA4B2"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                style={[styles.filterInput, { color: theme.text }]}
              />
            </View>
            <View style={[styles.filterInputWrap, styles.priceInputWrap, { borderColor: theme.border, backgroundColor: theme.surface }]}> 
              <TextInput
                placeholder="Max ₹"
                placeholderTextColor="#9AA4B2"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                style={[styles.filterInput, { color: theme.text }]}
              />
            </View>
          </View>

          <View style={styles.sortRow}>
            <Pressable
              onPress={onSortByTime}
              style={[
                styles.sortChip,
                { borderColor: theme.border, backgroundColor: sortBy === 'time' ? '#DBEAFE' : theme.surface }
              ]}
            >
              <Ionicons name="time-outline" size={14} color={sortBy === 'time' ? '#1D4ED8' : '#64748B'} />
              <Text style={[styles.sortChipText, { color: sortBy === 'time' ? '#1D4ED8' : theme.textSecondary }]}>Time</Text>
            </Pressable>
            <Pressable
              onPress={onSortByPrice}
              style={[
                styles.sortChip,
                { borderColor: theme.border, backgroundColor: sortBy === 'price' ? '#DBEAFE' : theme.surface }
              ]}
            >
              <Ionicons name="wallet-outline" size={14} color={sortBy === 'price' ? '#1D4ED8' : '#64748B'} />
              <Text style={[styles.sortChipText, { color: sortBy === 'price' ? '#1D4ED8' : theme.textSecondary }]}>Price</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={[styles.heading, { color: theme.text }]}>Available rides</Text>
        <Text style={styles.count}>{filteredRides.length}</Text>
      </View>
    </>
  ), [
    theme,
    toggleTheme,
    isDarkMode,
    unreadCount,
    searchQuery,
    filterDate,
    minPrice,
    maxPrice,
    sortBy,
    filteredRides.length,
    goToNotifications,
    onSortByTime,
    onSortByPrice
  ]);

  const renderRide = useCallback(({ item, index }) => (
    <StaggeredItem delay={index * 80}>
      <RideCard
        ride={item}
        index={index}
        ratingSummary={driverRatings[String(item?.createdBy?._id || item?.createdBy?.id || item?.createdBy || '')]}
        onPress={() => goToRideDetails(item._id)}
      />
    </StaggeredItem>
  ), [goToRideDetails, driverRatings]);

  const renderEmpty = useCallback(() => (
    <AnimatedEmptyState
      icon="car-outline"
      title={rides.length === 0 ? 'No rides available' : 'No rides found'}
      message={
        rides.length === 0
          ? 'Pull to refresh or create a new ride to get started.'
          : 'Try updating your search, calendar date, or price filters.'
      }
      actionText="Create Ride"
      onActionPress={goToCreateRide}
      iconColor={colors.primary}
    />
  ), [goToCreateRide, rides.length]);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.heroCard}>
          <View style={styles.skeletonHeader}>
            <RideCardSkeleton />
            <RideCardSkeleton />
            <RideCardSkeleton />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenContainer scroll={false}>
        <FlatList
          data={filteredRides}
          renderItem={renderRide}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.pageScrollContent, filteredRides.length === 0 && styles.emptyListContent]}
        />
      </ScreenContainer>

      <Animated.View style={[styles.fabWrap, { transform: [{ scale: fabScale }] }]}>
        <Pressable
          style={styles.fabPress}
          onPress={goToCreateRide}
          onPressIn={onFabPressIn}
          onPressOut={onFabPressOut}
          accessibilityRole="button"
          accessibilityLabel="Create Ride"
        >
          <LinearGradient colors={fabPressed ? ['#1E40AF', '#4338CA'] : tokens.gradients.fab} style={styles.fab}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.fabText}>Create Ride</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  pageScrollContent: {
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    paddingBottom: 130
  },
  emptyListContent: {
    flexGrow: 1
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  unreadDot: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  unreadDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
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
  filtersGrid: {
    marginTop: 12,
    gap: 10
  },
  filterInputWrap: {
    height: 44,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8
  },
  filterInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500'
  },
  datePressArea: {
    flex: 1,
    justifyContent: 'center'
  },
  dateDoneBtn: {
    alignSelf: 'flex-end',
    marginTop: -4
  },
  dateDoneText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 13
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10
  },
  priceInputWrap: {
    flex: 1
  },
  sortRow: {
    flexDirection: 'row',
    gap: 10
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '700'
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
  },
  skeletonHeader: {
    gap: 12,
    paddingTop: 20
  }
});

export default HomeScreen;
