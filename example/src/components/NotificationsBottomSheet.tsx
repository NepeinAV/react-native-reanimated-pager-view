import { useRef, useState, useCallback, useMemo } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  PagerView,
  type PagerViewRef,
} from 'react-native-reanimated-pager-view';

import { CONSTANTS } from '../constants';
import { NOTIFICATION_TABS } from '../constants/notifications';
import { notificationsData } from '../data/notifications';

import { NotificationPage } from './NotificationPage';

import type { Notification } from '../types';

const { width: screenWidth } = Dimensions.get('window');

export const NotificationsBottomSheet = () => {
  const pagerRef = useRef<PagerViewRef>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>(
    () => notificationsData
  );

  const animatedPage = useSharedValue(0);

  const handleTabPress = useCallback((index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  }, []);

  const handlePageSelected = useCallback((position: number) => {
    setActiveTab(position);
  }, []);

  const onPageScroll = useCallback(
    (e: { position: number; offset: number }) => {
      'worklet';
      animatedPage.value = e.position + e.offset;
    },
    [animatedPage]
  );

  const handleNotificationPress = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const tabBackgroundStyle = useAnimatedStyle(() => {
    const tabWidth = (screenWidth - 32 - 8) / NOTIFICATION_TABS.length;
    const translateX = interpolate(
      animatedPage.value,
      [0, NOTIFICATION_TABS.length - 1],
      [0, tabWidth * (NOTIFICATION_TABS.length - 1)],
      Extrapolation.CLAMP
    );

    return {
      width: tabWidth,
      transform: [{ translateX: 4 + translateX }],
    };
  });

  const filteredNotifications = useMemo(() => {
    return NOTIFICATION_TABS.map((tab) => {
      switch (tab.key) {
        case 'all':
          return notifications;
        case 'unread':
          return notifications.filter((n) => !n.isRead);
        case 'like':
          return notifications.filter((n) => n.type === 'like');
        case 'comment':
          return notifications.filter((n) => n.type === 'comment');
        case 'follow':
          return notifications.filter((n) => n.type === 'follow');
        default:
          return notifications;
      }
    });
  }, [notifications]);

  const memoizedTabs = NOTIFICATION_TABS.map((tab, idx) => (
    <TouchableOpacity
      key={tab.key}
      style={styles.tab}
      onPress={() => handleTabPress(idx)}
    >
      <Text style={styles.tabIcon}>{tab.icon}</Text>
      <Text style={[styles.tabText, activeTab === idx && styles.activeTabText]}>
        {tab.title}
      </Text>
    </TouchableOpacity>
  ));

  const memoizedPages = useMemo(
    () =>
      filteredNotifications.map((pageNotifications, index) => {
        const tab = NOTIFICATION_TABS[index];
        if (!tab) return null;

        return (
          <NotificationPage
            key={tab.key}
            notifications={pageNotifications}
            onNotificationPress={handleNotificationPress}
          />
        );
      }),
    [filteredNotifications, handleNotificationPress]
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <Animated.View style={[styles.tabBackground, tabBackgroundStyle]} />
        {memoizedTabs}
      </View>
      <PagerView
        ref={pagerRef}
        onPageSelected={handlePageSelected}
        onPageScroll={onPageScroll}
      >
        {memoizedPages}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_SECONDARY,
    marginHorizontal: CONSTANTS.SPACING.LARGE,
    marginTop: CONSTANTS.SPACING.SMALL,
    marginBottom: CONSTANTS.SPACING.LARGE,
    borderRadius: CONSTANTS.BORDER_RADIUS.MEDIUM,
    padding: 4,
    position: 'relative',
  },
  tabBackground: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: CONSTANTS.COLORS.ACCENT_BLUE,
    borderRadius: CONSTANTS.BORDER_RADIUS.SMALL,
    shadowColor: CONSTANTS.COLORS.ACCENT_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: CONSTANTS.SPACING.MEDIUM,
    paddingHorizontal: CONSTANTS.SPACING.SMALL,
    borderRadius: CONSTANTS.BORDER_RADIUS.SMALL,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: CONSTANTS.FONT_SIZES.EXTRA_SMALL,
    fontWeight: '600',
    color: CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  activeTabText: {
    color: CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  tabIcon: {
    fontSize: CONSTANTS.FONT_SIZES.SMALL,
  },
  pageContainer: {
    flex: 1,
  },
});
