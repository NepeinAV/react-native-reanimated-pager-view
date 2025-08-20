import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

import { chatStyles } from '../styles/chatStyles';

import { Avatar } from './Avatar';

import type { Chat } from '../types';

interface ChatItemProps {
  chat: Chat;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat }) => (
  <TouchableOpacity style={chatStyles.chatContainer} onPress={() => {}}>
    <View style={chatStyles.chatAvatarContainer}>
      <Avatar text={chat.avatar} size="medium" />
      {chat.isOnline && <View style={chatStyles.onlineIndicator} />}
    </View>
    <View style={chatStyles.chatInfo}>
      <View style={chatStyles.chatHeader}>
        <Text style={chatStyles.chatName}>{chat.name}</Text>
        <Text style={chatStyles.chatTime}>{chat.time}</Text>
      </View>
      <Text style={chatStyles.chatMessage} numberOfLines={1}>
        {chat.lastMessage}
      </Text>
    </View>
    {chat.unread > 0 && (
      <View style={chatStyles.unreadBadge}>
        <Text style={chatStyles.unreadText}>{chat.unread}</Text>
      </View>
    )}
  </TouchableOpacity>
);
