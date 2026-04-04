import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import tokens from '../theme/tokens';
import { useChatContext } from '../context/ChatContext';
import { apiRequest } from '../api';
import { ShimmerLoader, AnimatedEmptyState } from '../components';

/**
 * ConversationList Component
 * Display list of chat conversations with last message and unread badge
 */
const ConversationList = ({ navigation }) => {
  const { conversations, setConversations, setUnreadCount } = useChatContext();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await apiRequest('/chat/conversations', {
        method: 'GET'
      });

      if (response.conversations) {
        setConversations(response.conversations);
        
        // Calculate total unread
        const total = response.conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(total);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleConversationPress = (conversation) => {
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    navigation.navigate('ChatScreen', {
      conversationId: conversation._id,
      rideId: conversation.rideId._id,
      rideName: `${conversation.rideId.source} → ${conversation.rideId.destination}`
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderConversation = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.conversationItem,
        pressed && styles.conversationItemPressed
      ]}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="car" size={24} color={colors.white} />
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.rideName} numberOfLines={1}>
            {item.rideId?.source} → {item.rideId?.destination}
          </Text>
          {item.lastMessage?.timestamp && (
            <Text style={styles.timestamp}>
              {formatTimestamp(item.lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <View style={styles.lastMessageContainer}>
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.lastMessageUnread
            ]}
            numberOfLines={1}
          >
            {item.lastMessage?.messageType === 'image' ? '📷 Photo' : item.lastMessage?.text || 'No messages yet'}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3, 4, 5].map(i => (
          <ShimmerLoader key={i} width="100%" height={80} style={styles.skeleton} />
        ))}
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.container}>
        <AnimatedEmptyState
          icon="chatbubbles-outline"
          message="No conversations yet"
          submessage="Start chatting when you join a ride"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item._id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMain
  },
  listContent: {
    padding: tokens.spacing.md
  },
  skeleton: {
    marginBottom: tokens.spacing.md,
    borderRadius: tokens.borderRadius.lg
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    ...tokens.shadows.md
  },
  conversationItemPressed: {
    opacity: 0.7
  },
  avatarContainer: {
    position: 'relative',
    marginRight: tokens.spacing.md
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white
  },
  unreadText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4
  },
  conversationContent: {
    flex: 1
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  rideName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: tokens.spacing.sm
  },
  timestamp: {
    fontSize: 12,
    color: colors.textTertiary
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: colors.textPrimary
  }
});

export default ConversationList;
