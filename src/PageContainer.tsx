import { memo, type PropsWithChildren, useState } from 'react';

import { StyleSheet, type ViewStyle } from 'react-native';

import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { PageIndexContext } from './contexts/PageIndexContext';
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
  Pick<Required<PagerViewProps>, 'lazy' | 'lazyPageLimit'>;

const PageContainer = ({
  pageSize,
  pageMargin,
  children,
  pageIndex,
  currentPage,
  lazy,
  lazyPageLimit,
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

  const { clippedPageStyle } = useCustomClippingReceiver({
    pageSize,
    currentPage,
    pageIndex,
    canRemoveClippedPages,
    isRemovingClippedPagesEnabled,
    orientation,
  });

  useAnimatedReaction(
    () => currentPage.value,
    () => {
      const nextIsMounted = checkPageIndexInRange(
        currentPage.value,
        pageIndex,
        lazyPageLimit,
      );

      if (lazy) {
        runOnJS(setIsMounted)(isMounted || nextIsMounted);
      }
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
            <PageIndexContext.Provider value={pageIndex}>
              {children}
            </PageIndexContext.Provider>
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
