import React, { useCallback, useMemo } from 'react';

import { View, Text } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';

import { useOptimizedFlatListConfig } from '../hooks/useFlatListOptimization';
import { notificationStyles } from '../styles/notificationStyles';
import {
  groupNotificationsByTime,
  createFlatListDataWithHeaders,
} from '../utils/notificationUtils';

import { NotificationItem } from './NotificationItem';

import type { Notification } from '../types';

interface NotificationPageProps {
  notifications: Notification[];
  onNotificationPress?: (id: string) => void;
}

const keyExtractor = (item: {
  type: 'header' | 'item';
  data: string | { id: string };
}) =>
  item.type === 'header'
    ? `header-${item.data}`
    : `item-${(item.data as { id: string }).id}`;

export const NotificationPage: React.FC<NotificationPageProps> = ({
  notifications,
  onNotificationPress,
}) => {
  const flatListConfig = useOptimizedFlatListConfig();

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByTime(notifications);
  }, [notifications]);

  const renderSectionHeader = useCallback(
    (title: string) => (
      <View style={notificationStyles.sectionHeader}>
        <Text style={notificationStyles.sectionHeaderText}>{title}</Text>
      </View>
    ),
    []
  );

  const renderNotification = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem notification={item} onPress={onNotificationPress} />
    ),
    [onNotificationPress]
  );

  const renderItem = useCallback(
    ({
      item,
    }: {
      item: { type: 'header' | 'item'; data: string | Notification };
    }) => {
      if (item.type === 'header') {
        return renderSectionHeader(item.data as string);
      }
      return renderNotification({ item: item.data as Notification });
    },
    [renderSectionHeader, renderNotification]
  );

  const flatListData = useMemo(() => {
    return createFlatListDataWithHeaders(groupedNotifications);
  }, [groupedNotifications]);

  if (flatListData.length === 0) {
    return (
      <View style={notificationStyles.emptyState}>
        <Text style={notificationStyles.emptyStateTitle}>No notifications</Text>
        <Text style={notificationStyles.emptyStateText}>
          No notifications found in this category.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={flatListData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.pageContainer}
      {...flatListConfig}
    />
  );
};

const styles = {
  pageContainer: {
    flex: 1,
  },
};
