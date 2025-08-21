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

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  createBounceScrollOffsetInterpolator,
  PagerView,
  type PagerViewRef,
  type PageStyleInterpolator,
} from 'react-native-reanimated-pager-view';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { FeedPage } from './components/FeedPage';
import { MessagesPage } from './components/MessagesPage';
import { NavigationIcon } from './components/NavigationIcon';
import { NotificationsBottomSheet } from './components/NotificationsBottomSheet';
import { ProfilePage } from './components/ProfilePage';
import { Shorts } from './components/Shorts';
import { CONSTANTS } from './constants';
import { styles as appStyles } from './styles';

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView);

const pageStyleInterpolator: PageStyleInterpolator = ({ pageOffset }) => {
  'worklet';

  const rotateY = interpolate(pageOffset, [-1, 0, 1], [60, 0, -60], 'clamp');
  const scale = interpolate(pageOffset, [-1, 0, 1], [0.8, 1, 0.8], 'clamp');

  return {
    transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }, { scale }],
  };
};

const scrollOffsetInterpolator = createBounceScrollOffsetInterpolator();

const App = () => {
  const { width: screenWidth } = useWindowDimensions();

  const pagerScrollPosition = useSharedValue(0);
  const notificationsBottomSheetRef = useRef<BottomSheetModal>(null);

  const ref = useRef<PagerViewRef>(null);

  const pages = useMemo(
    () => [
      { id: 'feed', title: 'Home', icon: '🏠' },
      { id: 'messages', title: 'Messages', icon: '💬' },
      { id: 'vertical', title: 'Shorts', icon: '📺' },
      { id: 'profile', title: 'Profile', icon: '👤' },
    ],
    [],
  );

  const onPageScroll = useCallback(
    (e: { position: number; offset: number }) => {
      'worklet';

      pagerScrollPosition.value = e.position + e.offset;
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
    const backgroundColor = interpolate(
      pagerScrollPosition.value,
      [1.25, 2, 2.75],
      [0, 1, 0],
      'clamp',
    );

    return {
      backgroundColor: `rgba(0, 0, 0, ${backgroundColor})`,
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

      case 'profile':
        return <ProfilePage />;

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
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar translucent />
          <AnimatedSafeArea
            style={[appStyles.safeArea, backgroundAnimatedStyle]}
          >
            <View style={appStyles.safeAreaContent}>
              <Animated.View
                style={[appStyles.header, backgroundAnimatedStyle]}
              >
                <Text style={appStyles.headerTitle}>Connect</Text>
                <TouchableOpacity
                  style={headerStyles.notificationButton}
                  onPress={openNotifications}
                >
                  <Text style={headerStyles.notificationIcon}>🔔</Text>
                </TouchableOpacity>
              </Animated.View>

              <PagerView
                ref={ref}
                onPageScroll={onPageScroll}
                scrollEnabled={true}
                removeClippedPages={false}
                pageStyleInterpolator={pageStyleInterpolator}
                scrollOffsetInterpolator={scrollOffsetInterpolator}
              >
                {memoizedPages}
              </PagerView>

              <Animated.View
                style={[appStyles.navigation, backgroundAnimatedStyle]}
              >
                <Animated.View
                  style={[
                    appStyles.navBackground,
                    navItemBackgroundAnimatedStyle,
                  ]}
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
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONSTANTS.COLORS.BACKGROUND_PRIMARY,
  },
});
