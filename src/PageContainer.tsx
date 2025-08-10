import { memo, type PropsWithChildren, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { PageOnscreenContext } from './context';
import { useCustomClippingReceiver } from './hooks';
import { type PagerViewProps } from './types';
import { checkPageIndexInRange } from './utils';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hidden: {
    overflow: 'hidden',
  },
});

type Props = PropsWithChildren<{
  width: number;
  pageMargin: number;
  pageIndex: number;
  currentPage: SharedValue<number>;
  canRemoveClippedPages: SharedValue<number>;
  isRemovingClippedPagesEnabled: boolean;
}> &
  Pick<
    Required<PagerViewProps>,
    'lazy' | 'lazyPageLimit' | 'trackOnscreen' | 'trackOnscreenPageLimit'
  >;

const PageContainer = ({
  width,
  pageMargin,
  children,
  pageIndex,
  currentPage,
  lazy,
  lazyPageLimit,
  trackOnscreen,
  trackOnscreenPageLimit,
  canRemoveClippedPages,
  isRemovingClippedPagesEnabled,
}: Props) => {
  const [isMounted, setIsMounted] = useState(() =>
    lazy
      ? checkPageIndexInRange(currentPage.value, pageIndex, lazyPageLimit)
      : true
  );

  const [isOnscreen, setIsOnscreen] = useState(() =>
    trackOnscreen
      ? checkPageIndexInRange(
          currentPage.value,
          pageIndex,
          trackOnscreenPageLimit
        )
      : true
  );

  const { clippedPageStyle } = useCustomClippingReceiver({
    width,
    currentPage,
    pageIndex,
    canRemoveClippedPages,
    isRemovingClippedPagesEnabled,
  });

  const setState = useCallback(
    (nextIsMounted: boolean, nextIsOnscreen: boolean) => {
      if (lazy) {
        setIsMounted(isMounted || nextIsMounted);
      }

      if (trackOnscreen) {
        setIsOnscreen(nextIsOnscreen);
      }
    },
    [isMounted, lazy, trackOnscreen]
  );

  useAnimatedReaction(
    () => currentPage.value,
    () => {
      const nextIsMounted = checkPageIndexInRange(
        currentPage.value,
        pageIndex,
        lazyPageLimit
      );
      const nextIsOnscreen = checkPageIndexInRange(
        currentPage.value,
        pageIndex,
        trackOnscreenPageLimit
      );

      runOnJS(setState)(nextIsMounted, nextIsOnscreen);
    }
  );

  const mountAnimation = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isMounted ? 1 : 0, { duration: 200 }),
    };
  });

  return (
    <View
      style={[
        { width, paddingHorizontal: pageMargin / 2 },
        styles.flex,
        styles.hidden,
      ]}
      removeClippedSubviews={isRemovingClippedPagesEnabled}
    >
      <Animated.View
        style={[styles.flex, styles.hidden, mountAnimation, clippedPageStyle]}
      >
        {isMounted ? (
          <PageOnscreenContext.Provider value={isOnscreen}>
            {children}
          </PageOnscreenContext.Provider>
        ) : null}
      </Animated.View>
    </View>
  );
};

const PageContainerMemo = memo(PageContainer);
PageContainerMemo.displayName = 'PageContainer';

export { PageContainerMemo as PageContainer };
