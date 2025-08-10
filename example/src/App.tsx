import { useState, useMemo, useCallback, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  PagerView,
  type PagerViewRef,
} from 'react-native-reanimated-pager-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { NavigationIcon } from './components/NavigationIcon';
import { FeedPage } from './components/FeedPage';
import { MessagesPage } from './components/MessagesPage';
import { ProfilePage } from './components/ProfilePage';
import { NotificationsBottomSheet } from './components/NotificationsBottomSheet';
import { styles as appStyles } from './styles';
import { CONSTANTS } from './constants';

const App = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const animatedPage = useSharedValue(0);
  const notificationsBottomSheetRef = useRef<BottomSheetModal>(null);

  const ref = useRef<PagerViewRef>(null);

  const { width: screenWidth } = useWindowDimensions();

  const pages = useMemo(
    () => [
      { id: 'feed', title: 'Home', icon: '🏠' },
      { id: 'messages', title: 'Messages', icon: '💬' },
      { id: 'profile', title: 'Profile', icon: '👤' },
    ],
    []
  );

  const onPageSelected = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const onPageScroll = useCallback(
    (e: { position: number; offset: number }) => {
      'worklet';
      animatedPage.value = e.position + e.offset;
    },
    [animatedPage]
  );

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animatedPage.value,
      [0, pages.length - 1],
      [0, (screenWidth / pages.length) * (pages.length - 1)]
    );

    return {
      width: screenWidth / pages.length - 12,
      transform: [{ translateX: translateX }],
    };
  });

  const handleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const openNotifications = useCallback(() => {
    notificationsBottomSheetRef.current?.present();
  }, []);

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (pageIndex < 0 || pageIndex >= pages.length) return;

      if (pageIndex !== currentPage) {
        setCurrentPage(pageIndex);
        animatedPage.value = withSpring(pageIndex);
      }

      ref.current?.setPage(pageIndex);
    },
    [pages.length, currentPage, animatedPage]
  );

  const renderPage = useCallback(
    (pageId: string) => {
      switch (pageId) {
        case 'feed':
          return <FeedPage likedPosts={likedPosts} onLike={handleLike} />;

        case 'messages':
          return <MessagesPage />;

        case 'profile':
          return <ProfilePage />;

        default:
          return <View style={appStyles.pageContainer} />;
      }
    },
    [likedPosts, handleLike]
  );

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
          <StatusBar
            backgroundColor={CONSTANTS.COLORS.BACKGROUND_PRIMARY}
            translucent
          />
          <SafeAreaView style={appStyles.safeArea}>
            <View style={appStyles.safeAreaContent}>
              <View style={[appStyles.header]}>
                <Text style={appStyles.headerTitle}>Connect</Text>
                <TouchableOpacity
                  style={headerStyles.notificationButton}
                  onPress={openNotifications}
                >
                  <Text style={headerStyles.notificationIcon}>🔔</Text>
                </TouchableOpacity>
              </View>

              <PagerView
                ref={ref}
                onPageSelected={onPageSelected}
                onPageScroll={onPageScroll}
                overdrag={true}
                scrollEnabled={true}
                removeClippedPages
              >
                {memoizedPages}
              </PagerView>

              <View style={[appStyles.navigation]}>
                <Animated.View
                  style={[appStyles.navBackground, backgroundAnimatedStyle]}
                />

                {pages.map((page, index) => {
                  const isActive = index === currentPage;

                  return (
                    <TouchableOpacity
                      key={page.id}
                      style={appStyles.navItem}
                      onPress={() => goToPage(index)}
                    >
                      <NavigationIcon
                        icon={page.icon}
                        animatedPage={animatedPage}
                        index={index}
                        isActive={isActive}
                      />
                      <Text
                        style={[
                          appStyles.navLabel,
                          isActive
                            ? appStyles.activeNavLabel
                            : appStyles.inactiveNavLabel,
                        ]}
                      >
                        {page.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
          </SafeAreaView>
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
