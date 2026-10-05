import { useMemo, useCallback, useLayoutEffect, useRef } from 'react';

import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import {
  type PagerViewRef,
  type ScrollPosition,
} from 'react-native-reanimated-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';

import { CONSTANTS } from '../constants';
import { cubePageInterpolator } from '../interpolators';
import { styles as appStyles } from '../styles';

import { CustomPagerView } from './CustomPagerView';
import { FeedPage } from './FeedPage';
import { MessagesPage } from './MessagesPage';
import { NavigationIcon } from './NavigationIcon';
import { NotificationTabs } from './NotificationTabs';
import { Shorts } from './Shorts';

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView);

const swipeBackArea = { left: -30 };

const safeAreaEdges = ['bottom', 'left', 'right'] as const;

const createNotificationsButton = (onPress: () => void) => () => (
  <TouchableOpacity
    onPress={onPress}
    hitSlop={8}
    style={headerStyles.notificationButton}
  >
    <Text style={headerStyles.notificationIcon}>🔔</Text>
  </TouchableOpacity>
);

export const MainScreen = () => {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  const pagerScrollPosition = useSharedValue(0);
  const notificationsBottomSheetRef = useRef<BottomSheetModal>(null);

  const ref = useRef<PagerViewRef>(null);

  const pages = useMemo(
    () => [
      { id: 'feed', title: 'Home', icon: '🏠' },
      { id: 'messages', title: 'Messages', icon: '💬' },
      { id: 'vertical', title: 'Shorts', icon: '📺' },
    ],
    [],
  );

  const onPageScroll = useCallback(
    (position: ScrollPosition) => {
      'worklet';

      pagerScrollPosition.value = position;
    },
    [pagerScrollPosition],
  );

  const tabWidth = screenWidth / pages.length;

  const navItemBackgroundAnimatedStyle = useAnimatedStyle(() => {
    const lastPageIndex = pages.length - 1;

    // The pager is looped, so between the last and the first pages
    // the background moves straight back across the tab bar
    const tabPosition = interpolate(
      pagerScrollPosition.value,
      [0, lastPageIndex, pages.length],
      [0, lastPageIndex, 0],
    );

    return {
      width: tabWidth - 12,
      transform: [{ translateX: tabPosition * tabWidth }],
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      pagerScrollPosition.value,
      [1.25, 2, 2.75],
      [0, 1, 0],
      'clamp',
    );

    return {
      backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    };
  });

  const openNotifications = useCallback(() => {
    notificationsBottomSheetRef.current?.present();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: createNotificationsButton(openNotifications),
    });
  }, [navigation, openNotifications]);

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (pageIndex < 0 || pageIndex >= pages.length) return;

      ref.current?.setPage(pageIndex);
    },
    [pages.length],
  );

  const renderPage = useCallback((pageId: string) => {
    switch (pageId) {
      case 'feed':
        return <FeedPage />;

      case 'messages':
        return <MessagesPage />;

      case 'vertical':
        return <Shorts />;

      default:
        return <View style={appStyles.pageContainer} />;
    }
  }, []);

  const memoizedPages = useMemo(() => {
    return pages.map((page) => (
      <View key={page.id} style={appStyles.page}>
        {renderPage(page.id)}
      </View>
    ));
  }, [pages, renderPage]);

  return (
    <>
      <StatusBar translucent />
      {/* The top inset is handled by the navigation header */}
      <AnimatedSafeArea
        edges={safeAreaEdges}
        style={[appStyles.safeArea, backgroundAnimatedStyle]}
      >
        <View style={appStyles.safeAreaContent}>
          <CustomPagerView
            ref={ref}
            loop
            // Leaves the screen edge to the swipe-back gesture
            hitSlop={swipeBackArea}
            onPageScroll={onPageScroll}
            removeClippedPages={false}
            pageStyleInterpolator={cubePageInterpolator}
            scrollEnabled
            lazy
          >
            {memoizedPages}
          </CustomPagerView>

          <Animated.View
            style={[appStyles.navigation, backgroundAnimatedStyle]}
          >
            <Animated.View
              style={[appStyles.navBackground, navItemBackgroundAnimatedStyle]}
            />

            {pages.map((page, index) => {
              return (
                <TouchableOpacity
                  key={page.id}
                  style={appStyles.navItem}
                  onPress={() => goToPage(index)}
                >
                  <NavigationIcon
                    icon={page.icon}
                    animatedPage={pagerScrollPosition}
                    index={index}
                    pageCount={pages.length}
                  />
                  <Text style={appStyles.navLabel}>{page.title}</Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </View>

        <BottomSheetModal
          ref={notificationsBottomSheetRef}
          enableDynamicSizing
          backgroundStyle={headerStyles.bottomSheetBackground}
          handleIndicatorStyle={headerStyles.handleIndicator}
        >
          <BottomSheetView style={headerStyles.bottomSheetContent}>
            <NotificationTabs />
          </BottomSheetView>
        </BottomSheetModal>
      </AnimatedSafeArea>
    </>
  );
};

const headerStyles = StyleSheet.create({
  notificationButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  bottomSheetBackground: {
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
  handleIndicator: {
    backgroundColor: CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  bottomSheetContent: {
    flex: 1,
    height: Dimensions.get('window').height / 1.2,
  },
});
