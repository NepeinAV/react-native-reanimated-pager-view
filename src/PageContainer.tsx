import { memo, type PropsWithChildren, useCallback, useState } from 'react';

import { StyleSheet, type ViewStyle } from 'react-native';

import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { OnscreenPageContext } from './context';
import { useCustomClippingReceiver } from './hooks/useCustomClipping';
import { PageWithInterpolation } from './PageWithInterpolation';
import {
  type PagerViewProps,
  type PageStyleInterpolator,
  type ScrollPosition,
  type Orientation,
} from './types';
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
  pageSize: number;
  pageMargin: number;
  pageIndex: number;
  currentPage: SharedValue<number>;
  canRemoveClippedPages: SharedValue<number>;
  isRemovingClippedPagesEnabled: boolean;
  pageStyleInterpolator?: PageStyleInterpolator;
  scrollPosition: SharedValue<ScrollPosition>;
  orientation: Orientation;
}> &
  Pick<
    Required<PagerViewProps>,
    'lazy' | 'lazyPageLimit' | 'trackOnscreen' | 'trackOnscreenPageLimit'
  >;

const PageContainer = ({
  pageSize,
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
  pageStyleInterpolator,
  scrollPosition,
  orientation,
}: Props) => {
  const [isMounted, setIsMounted] = useState(() =>
    lazy
      ? checkPageIndexInRange(currentPage.value, pageIndex, lazyPageLimit)
      : true,
  );

  const [isOnscreen, setIsOnscreen] = useState(() =>
    trackOnscreen
      ? checkPageIndexInRange(
          currentPage.value,
          pageIndex,
          trackOnscreenPageLimit,
        )
      : true,
  );

  const { clippedPageStyle } = useCustomClippingReceiver({
    pageSize,
    currentPage,
    pageIndex,
    canRemoveClippedPages,
    isRemovingClippedPagesEnabled,
    orientation,
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
    [isMounted, lazy, trackOnscreen],
  );

  useAnimatedReaction(
    () => currentPage.value,
    () => {
      const nextIsMounted = checkPageIndexInRange(
        currentPage.value,
        pageIndex,
        lazyPageLimit,
      );
      const nextIsOnscreen = checkPageIndexInRange(
        currentPage.value,
        pageIndex,
        trackOnscreenPageLimit,
      );

      runOnJS(setState)(nextIsMounted, nextIsOnscreen);
    },
  );

  const mountAnimation = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isMounted ? 1 : 0, { duration: 200 }),
    };
  });

  const renderPage = (style?: ViewStyle) => {
    const isVertical = orientation === 'vertical';

    return (
      <Animated.View
        style={[
          isVertical
            ? { height: pageSize, paddingVertical: pageMargin / 2 }
            : { width: pageSize, paddingHorizontal: pageMargin / 2 },
          styles.flex,
          styles.hidden,
          style,
        ]}
        removeClippedSubviews={isRemovingClippedPagesEnabled}
      >
        <Animated.View
          style={[styles.flex, styles.hidden, mountAnimation, clippedPageStyle]}
        >
          {isMounted ? (
            <OnscreenPageContext.Provider value={isOnscreen}>
              {children}
            </OnscreenPageContext.Provider>
          ) : null}
        </Animated.View>
      </Animated.View>
    );
  };

  if (pageStyleInterpolator) {
    return (
      <PageWithInterpolation
        pageStyleInterpolator={pageStyleInterpolator}
        scrollPosition={scrollPosition}
        pageIndex={pageIndex}
        pageSize={pageSize}
      >
        {renderPage}
      </PageWithInterpolation>
    );
  }

  return renderPage();
};

const PageContainerMemo = memo(PageContainer);
PageContainerMemo.displayName = 'PageContainer';

export { PageContainerMemo as PageContainer };
