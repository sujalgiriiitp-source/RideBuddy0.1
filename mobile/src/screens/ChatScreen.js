import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'react-native-image-picker';
import colors from '../theme/colors';
import tokens from '../theme/tokens';
import { useChatContext } from '../context/ChatContext';
import { apiRequest, API_URL } from '../api';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

/**
 * ChatScreen Component
 * Real-time chat interface for ride conversations
 */
const ChatScreen = ({ route, navigation }) => {
  const { conversationId, rideId, rideName } = route.params;
  const { user, token } = useAuth();
  const { joinConversation, leaveConversation, sendMessage, markAsRead, isConnected, socket } = useChatContext();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: rideName });
    loadMessages();
    joinConversation(conversationId);

    // Listen for new messages
    if (socket) {
      socket.on('chat:message:new', handleNewMessage);
      socket.on('chat:typing', handleTyping);
    }

    return () => {
      leaveConversation(conversationId);
      if (socket) {
        socket.off('chat:message:new', handleNewMessage);
        socket.off('chat:typing', handleTyping);
      }
    };
  }, [conversationId, socket]);

  const loadMessages = async () => {
    try {
      const response = await apiRequest(`/chat/messages/${conversationId}`, {
        method: 'GET',
        token
      });

      if (response.messages) {
        setMessages(response.messages);
        
        // Mark messages as read
        const unreadIds = response.messages
          .filter(m => !m.readBy.some(r => (r?.userId?._id || r?.userId)?.toString() === user._id?.toString()))
          .map(m => m._id);
        
        if (unreadIds.length > 0) {
          await markAsRead(unreadIds);
        }
      }
    } catch (error) {
      console.error('Load messages error:', error);
      Toast.show({
        type: 'error',
        text1: 'Unable to load messages',
        text2: error?.message || 'Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    const incomingMessage = data?.message || data;
    const incomingConversationId =
      incomingMessage?.conversationId?._id || incomingMessage?.conversationId;

    if (String(incomingConversationId) === String(conversationId)) {
      setMessages(prev => {
        if (prev.some((existing) => String(existing._id) === String(incomingMessage._id))) {
          return prev;
        }
        return [...prev, incomingMessage];
      });
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Mark as read if not from current user
      const senderId = incomingMessage?.sender?._id || incomingMessage?.senderId?._id || incomingMessage?.senderId;
      if (String(senderId) !== String(user._id)) {
        markAsRead([incomingMessage._id]);
      }
    }
  };

  const handleTyping = (data) => {
    if (data.userId !== user._id) {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev, data.userId]);
      } else {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const sentMessage = await sendMessage(conversationId, 'text', messageText);

      if (sentMessage?._id) {
        setMessages((previousMessages) => {
          if (previousMessages.some((existing) => String(existing._id) === String(sentMessage._id))) {
            return previousMessages;
          }
          return [...previousMessages, sentMessage];
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      
      if (Platform.OS !== 'web' && Haptics?.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Send message error:', error);
      setInputText(messageText); // Restore text on error
      Toast.show({
        type: 'error',
        text1: 'Message failed',
        text2: error?.message || 'Unable to send message'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTextChange = (text) => {
    setInputText(text);

    // Send typing indicator
    if (text.length > 0) {
      // Implement debounced typing indicator here if needed
    }
  };

  const handleImagePick = async () => {
    if (Platform.OS === 'web') {
      return;
    }

    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920
    });

    if (result.assets && result.assets[0]) {
      // Upload image and send message
      // Implementation would require multipart upload
      console.log('Image selected:', result.assets[0]);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId?._id === user._id || item.sender?._id === user._id;
    const showAvatar = index === 0 || messages[index - 1].senderId !== item.senderId;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && showAvatar && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.senderId?.name?.charAt(0) || item.sender?.name?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {item.messageType === 'image' ? (
            <Image
              source={{ uri: `${API_URL}${item.metadata?.imageUrl}` }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {item.content}
            </Text>
          )}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {typingUsers.length > 0 && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Someone is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Pressable style={styles.imageButton} onPress={handleImagePick}>
          <Ionicons name="image-outline" size={24} color={colors.primary} />
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          value={inputText}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
        />

        <Pressable
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </Pressable>
      </View>

      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Connecting...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  messagesList: {
    padding: tokens.spacing.md
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.md,
    alignItems: 'flex-end'
  },
  ownMessageContainer: {
    justifyContent: 'flex-end'
  },
  otherMessageContainer: {
    justifyContent: 'flex-start'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.xs
  },
  avatarText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.sm,
    ...tokens.shadows.sm
  },
  ownMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4
  },
  otherMessageBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  ownMessageText: {
    color: colors.white
  },
  otherMessageText: {
    color: colors.text
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right'
  },
  otherMessageTime: {
    color: colors.textTertiary
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: tokens.radius.md,
    marginBottom: 4
  },
  typingIndicator: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs
  },
  typingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  imageButton: {
    padding: tokens.spacing.sm,
    marginRight: tokens.spacing.xs
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.sm
  },
  sendButtonDisabled: {
    backgroundColor: colors.textTertiary
  },
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    padding: tokens.spacing.xs,
    alignItems: 'center'
  },
  offlineText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600'
  }
});

export default ChatScreen;
