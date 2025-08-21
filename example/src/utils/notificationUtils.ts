import type { Notification } from '../types';

export const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'like':
      return '❤️';
    case 'comment':
      return '💬';
    case 'follow':
      return '👤';
    case 'message':
      return '📩';
    default:
      return '🔔';
  }
};

export const getTimeGroupKey = (time: string): string => {
  if (time.includes('m') || time.includes('h')) {
    return 'Today';
  } else if (time.includes('d') && !time.includes('w')) {
    return 'This Week';
  } else {
    return 'Earlier';
  }
};

export const groupNotificationsByTime = (
  notifications: Notification[],
): { [key: string]: Notification[] } => {
  const groups: { [key: string]: Notification[] } = {};

  notifications.forEach((notification) => {
    const groupKey = getTimeGroupKey(notification.time);

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey]!.push(notification);
  });

  return groups;
};

export const createFlatListDataWithHeaders = (groupedNotifications: {
  [key: string]: Notification[];
}): Array<{ type: 'header' | 'item'; data: string | Notification }> => {
  const sections = Object.keys(groupedNotifications);
  const data: Array<{
    type: 'header' | 'item';
    data: string | Notification;
  }> = [];

  sections.forEach((section) => {
    data.push({ type: 'header', data: section });
    groupedNotifications[section]!.forEach((notification) => {
      data.push({ type: 'item', data: notification });
    });
  });

  return data;
};
