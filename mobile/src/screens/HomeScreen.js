import React, { useCallback, useEffect, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { apiRequest } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import RideCard from '../components/RideCard';
import { RideCardSkeleton, AnimatedEmptyState, StaggeredItem } from '../components';
import { useTheme } from '../context/ThemeContext';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const HomeScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fabPressed, setFabPressed] = useState(false);
  const fabScale = React.useRef(new Animated.Value(1)).current;

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

  const onFabPressIn = () => {
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
  };

  const onFabPressOut = () => {
    setFabPressed(false);
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100
    }).start();
  };

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

  const renderHeader = () => (
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
          />
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={[styles.heading, { color: theme.text }]}>Available rides</Text>
        <Text style={styles.count}>{rides.length}</Text>
      </View>
    </>
  );

  const renderRide = ({ item, index }) => (
    <StaggeredItem delay={index * 80}>
      <RideCard
        ride={item}
        index={index}
        onPress={() => navigation.navigate('Ride Details', { rideId: item._id })}
      />
    </StaggeredItem>
  );

  const renderEmpty = () => (
    <AnimatedEmptyState
      icon="car-outline"
      title="No rides available"
      message="Pull to refresh or create a new ride to get started."
      actionText="Create Ride"
      onActionPress={() => navigation.navigate('Create Ride')}
      iconColor={colors.primary}
    />
  );

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenContainer scroll={false}>
        <FlatList
          data={rides}
          renderItem={renderRide}
          keyExtractor={(item, index) => item?._id || String(index)}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.pageScrollContent, rides.length === 0 && styles.emptyListContent]}
        />
      </ScreenContainer>

      <Animated.View style={[styles.fabWrap, { transform: [{ scale: fabScale }] }]}>
        <Pressable
          style={styles.fabPress}
          onPress={() => navigation.navigate('Create Ride')}
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
    justifyContent: 'center'
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
  },
  skeletonHeader: {
    gap: 12,
    paddingTop: 20
  }
});

export default HomeScreen;
