import { useMemo, useCallback, useRef } from 'react';

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
  Extrapolation,
} from 'react-native-reanimated';
import {
  type PagerViewRef,
  type PageStyleInterpolator,
  type ScrollPosition,
} from 'react-native-reanimated-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

import { CONSTANTS } from '../constants';
import { styles as appStyles } from '../styles';

import { CustomPagerView } from './CustomPagerView';
import { FeedPage } from './FeedPage';
import { MessagesPage } from './MessagesPage';
import { NavigationIcon } from './NavigationIcon';
import { NotificationsBottomSheet } from './NotificationsBottomSheet';
import { Shorts } from './Shorts';

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView);

const pageStyleInterpolator: PageStyleInterpolator = ({ pageOffset }) => {
  'worklet';

  const rotateY = interpolate(pageOffset, [-1, 0, 1], [60, 0, -60], 'clamp');
  const scale = interpolate(pageOffset, [-1, 0, 1], [0.8, 1, 0.8], 'clamp');

  return {
    transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }, { scale }],
  };
};

export const MainScreen = () => {
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

  const navItemBackgroundAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      pagerScrollPosition.value,
      [0, pages.length - 1],
      [0, (screenWidth / pages.length) * (pages.length - 1)],
      Extrapolation.CLAMP,
    );

    return {
      width: screenWidth / pages.length - 12,
      transform: [{ translateX: translateX }],
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
      <AnimatedSafeArea style={[appStyles.safeArea, backgroundAnimatedStyle]}>
        <View style={appStyles.safeAreaContent}>
          <Animated.View style={[appStyles.header, backgroundAnimatedStyle]}>
            <Text style={appStyles.headerTitle}>Connect</Text>
            <TouchableOpacity
              style={headerStyles.notificationButton}
              onPress={openNotifications}
            >
              <Text style={headerStyles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
          </Animated.View>

          <CustomPagerView
            ref={ref}
            onPageScroll={onPageScroll}
            removeClippedPages={false}
            pageStyleInterpolator={pageStyleInterpolator}
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
            <NotificationsBottomSheet />
          </BottomSheetView>
        </BottomSheetModal>
      </AnimatedSafeArea>
    </>
  );
};

const headerStyles = StyleSheet.create({
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationIcon: {
    fontSize: 20,
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
