import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import AnimatedReveal from '../components/AnimatedReveal';
import CustomButton from '../components/CustomButton';
import AnimatedEmptyState from '../components/AnimatedEmptyState';
import { useNotifications } from '../context/NotificationContext';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const formatTimeAgo = (value) => {
  if (!value) {
    return 'Just now';
  }

  const timestamp = new Date(value).getTime();
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

const NotificationsScreen = ({ navigation }) => {
  const {
    notifications,
    markNotificationAsRead,
    clearInAppNotifications
  } = useNotifications();

  const handleNotificationPress = (item) => {
    markNotificationAsRead(item.id);

    if (item.rideId) {
      navigation?.navigate?.('Ride Details', { rideId: item.rideId });
    }
  };

  const renderItem = ({ item, index }) => (
    <AnimatedReveal delay={index * 50}>
      <Pressable
        onPress={() => handleNotificationPress(item)}
        style={({ pressed }) => [
          styles.card,
          !item.read && styles.unreadCard,
          pressed && styles.pressedCard
        ]}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name={item.read ? 'notifications-outline' : 'notifications'}
            size={18}
            color={item.read ? colors.textTertiary : colors.primary}
          />
        </View>

        <View style={styles.contentWrap}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.read && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
        </View>
      </Pressable>
    </AnimatedReveal>
  );

  if (notifications.length === 0) {
    return (
      <ScreenContainer>
        <AnimatedEmptyState
          icon="notifications-off-outline"
          title="No notifications yet"
          message="Ride updates will appear here as you create and book rides."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerActions}>
            <CustomButton
              title="Clear All"
              variant="secondary"
              icon="trash-outline"
              onPress={clearInAppNotifications}
            />
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: tokens.spacing['4xl'],
    gap: tokens.spacing.sm
  },
  headerActions: {
    marginBottom: tokens.spacing.md
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#DCE6F8',
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.md,
    ...tokens.shadows.soft
  },
  unreadCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF'
  },
  pressedCard: {
    opacity: 0.85
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentWrap: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text
  },
  unreadTitle: {
    color: colors.primaryDark
  },
  time: {
    fontSize: 12,
    color: colors.textTertiary
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20
  }
});

export default NotificationsScreen;
