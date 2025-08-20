import React, { useCallback } from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

import { notificationStyles } from '../styles/notificationStyles';
import { getNotificationIcon } from '../utils/notificationUtils';

import { Avatar } from './Avatar';

import type { Notification } from '../types';

interface SimpleNotificationItemProps {
  notification: Notification;
  onPress?: (id: string) => void;
}

export const NotificationItem: React.FC<SimpleNotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const handlePress = useCallback(() => {
    onPress?.(notification.id);
  }, [onPress, notification.id]);

  return (
    <TouchableOpacity
      style={[notificationStyles.notificationContainer]}
      onPress={handlePress}
    >
      <View style={notificationStyles.notificationContent}>
        <Avatar text={notification.avatar} size="small" />
        <View style={notificationStyles.notificationInfo}>
          <Text style={notificationStyles.notificationText}>
            <Text style={notificationStyles.notificationAuthor}>
              {notification.author}
            </Text>{' '}
            {notification.content}
          </Text>
          <Text style={notificationStyles.notificationTime}>
            {notification.time}
          </Text>
        </View>
        <Text style={notificationStyles.notificationIcon}>
          {getNotificationIcon(notification.type)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
