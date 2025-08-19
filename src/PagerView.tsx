import {
  Children,
  forwardRef,
  isValidElement,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  clamp,
  runOnJS,
  runOnUI,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PageContainer } from './PageContainer';
import {
  useCustomClippingProvider,
  useExecuteEffectOnce,
  usePrevious,
} from './hooks';
import {
  type PagerViewProps,
  type PagerViewRef,
  type ScrollState,
} from './types';
import { getPageOffset, isArrayEqual } from './utils';

type OffsetTuple = [number, number];

const ANDROID_ACTIVE_OFFSET: OffsetTuple = [-10, 10];
const ANDROID_FAIL_OFFSET: OffsetTuple = [-30, 30];
const IOS_ACTIVE_OFFSET: OffsetTuple = [-10, 10];

const NEXT_PAGE_VISIBLE_PART_THRESHOLD = 0.5;

const PagerView = forwardRef<PagerViewRef, PagerViewProps>(
  (
    {
      children,
      initialPage: _initialPage = 0,
      pageMargin = 0,
      onPageSelected,
      onPageScrollStateChanged,
      onPageScroll,
      pageActivationThreshold = 0.8,
      scrollEnabled = true,
      onDragStart,
      onDragEnd,
      lazy = false,
      lazyPageLimit = 1,
      trackOnscreen = false,
      trackOnscreenPageLimit = 0,
      onInitialMeasure,
      estimatedWidth,
      estimatedHeight,
      removeClippedPages: _removeClippedPages = true,
      holdCurrentPageOnChildrenUpdate = false,
      gestureConfiguration,
      style,
      panVelocityThreshold = 500,
      pageStyleInterpolator,
      scrollOffsetInterpolator,
      orientation = 'horizontal',
    },
    ref
  ) => {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();

    const isVertical = orientation === 'vertical';

    const [layout, setLayout] = useState({
      width: estimatedWidth === null ? null : (estimatedWidth ?? windowWidth),
      height:
        estimatedHeight === null ? null : (estimatedHeight ?? windowHeight),
    });

    const pageCount = Children.count(children);
    const pageSize = isVertical
      ? (layout.height || 0) + pageMargin
      : (layout.width || 0) + pageMargin;
    const contentSize = pageCount * pageSize;

    const initialPage = useRef(clamp(_initialPage, 0, pageCount - 1)).current;

    const childrenKeys = useMemo(
      () =>
        Children.map(children, (child, index) =>
          isValidElement(child) ? child.key : index
        ) as string[],
      [children]
    );

    const previousChildrenKeys = usePrevious(childrenKeys);
    const previousPageSize = usePrevious(pageSize);

    const removeClippedPagesIos = holdCurrentPageOnChildrenUpdate
      ? false
      : _removeClippedPages;
    const removeClippedPages =
      Platform.OS === 'ios' ? removeClippedPagesIos : _removeClippedPages;

    const isLayoutMeasured = isVertical
      ? layout.height !== null
      : layout.width !== null;

    const initialPanOffset = getPageOffset(initialPage, pageSize);
    const panOffset = useSharedValue(initialPanOffset);
    const panGestureStartOffset = useSharedValue(initialPanOffset);

    const scrollState = useSharedValue<ScrollState>('idle');

    const currentPage = useSharedValue(initialPage);
    const panGestureStartPage = useSharedValue(initialPage);

    useExecuteEffectOnce(() => {
      if (isLayoutMeasured) {
        panOffset.value = getPageOffset(initialPage, pageSize);

        onInitialMeasure?.();
      }
    });

    const { setRemoveClippedPages, canRemoveClippedPages } =
      useCustomClippingProvider({
        isRemovingClippedPagesEnabled: removeClippedPages,
      });

    const setCurrentPageAndNotify = useCallback(
      (page: number) => {
        'worklet';

        currentPage.value = page;

        if (onPageSelected) {
          runOnJS(onPageSelected)(page);
        }
      },
      [currentPage, onPageSelected]
    );

    const handleChildrenUpdate = useCallback(() => {
      'worklet';

      const currentPageValue = currentPage.value;

      let nextPage = clamp(currentPageValue, 0, pageCount - 1);

      if (holdCurrentPageOnChildrenUpdate && previousChildrenKeys) {
        const currentPageKey = previousChildrenKeys.find(
          (_, index) => index === currentPageValue
        );
        const nextPageIndex = childrenKeys.findIndex(
          (key) => key === currentPageKey
        );

        if (nextPageIndex !== -1) {
          nextPage = nextPageIndex;
        }
      }

      const nextOffset = getPageOffset(nextPage, pageSize);

      const isPageChanged = nextPage !== currentPageValue;
      const isOffsetChanged = nextOffset !== panOffset.value;

      if (isPageChanged && onPageSelected) {
        runOnJS(onPageSelected)(nextPage);
      }

      if (isPageChanged) {
        currentPage.value = nextPage;
      }

      if (isOffsetChanged) {
        panOffset.value = nextOffset;
      }
    }, [
      currentPage,
      pageCount,
      holdCurrentPageOnChildrenUpdate,
      pageSize,
      panOffset,
      onPageSelected,
      childrenKeys,
      previousChildrenKeys,
    ]);

    useEffect(() => {
      if (childrenKeys.length === 0) {
        return;
      }

      if (
        previousPageSize === pageSize &&
        previousChildrenKeys &&
        isArrayEqual(previousChildrenKeys, childrenKeys)
      ) {
        return;
      }

      runOnUI(handleChildrenUpdate)();
    }, [
      pageSize,
      childrenKeys,
      handleChildrenUpdate,
      previousChildrenKeys,
      previousPageSize,
    ]);

    const scrollToPage = useCallback(
      (page: number, animated?: boolean) => {
        'worklet';

        if (!isLayoutMeasured) {
          return;
        }

        const isInRange = page >= 0 && page < pageCount;

        const pageOffset = getPageOffset(
          clamp(page, 0, pageCount - 1),
          pageSize
        );

        if (animated) {
          panOffset.value = withSpring(
            pageOffset,
            {
              damping: 100,
              mass: isInRange ? 0.15 : 0.5,
            },
            (_finished) => {
              setRemoveClippedPages(true);
            }
          );
        } else {
          panOffset.value = pageOffset;

          setRemoveClippedPages(true);
        }
      },
      [isLayoutMeasured, pageCount, pageSize, panOffset, setRemoveClippedPages]
    );

    const imperativeScrollToPage = useCallback(
      (page: number, animated: boolean) => {
        'worklet';

        scrollState.value = 'idle';

        setRemoveClippedPages(false);

        setCurrentPageAndNotify(page);

        scrollToPage(page, animated);
      },
      [
        scrollState,
        scrollToPage,
        setCurrentPageAndNotify,
        setRemoveClippedPages,
      ]
    );

    useImperativeHandle(
      ref,
      () => ({
        setPage: (page: number) => imperativeScrollToPage(page, true),
        setPageWithoutAnimation: (page: number) =>
          imperativeScrollToPage(page, false),
      }),
      [imperativeScrollToPage]
    );

    const interpolatedPanOffset = useDerivedValue(() => {
      if (!scrollOffsetInterpolator) {
        return clamp(panOffset.value, -contentSize + pageSize, 0);
      }

      const interpolatedRelativeOffset = scrollOffsetInterpolator.interpolator({
        scrollOffset: -panOffset.value / pageSize,
        pageCount,
        orientation,
      });

      return -interpolatedRelativeOffset * pageSize;
    });

    const relativePanOffset = useDerivedValue(() => {
      const value = interpolatedPanOffset.value;

      const position = Math.floor(-value / pageSize);
      const offset = -value / pageSize - position;

      return { position, offset };
    });

    useAnimatedReaction(
      () => relativePanOffset.value,
      (value) => {
        const { position, offset } = value;

        if (onPageScroll) {
          onPageScroll(value);
        }

        if (scrollState.value === 'idle') {
          return;
        }

        if (scrollState.value === 'settling' && offset === 0) {
          scrollState.value = 'idle';

          if (currentPage.value !== position) {
            setCurrentPageAndNotify(position);
          }

          return;
        }

        const isScrollingToRight = position >= panGestureStartPage.value;

        const isReachedThreshold = isScrollingToRight
          ? offset >= pageActivationThreshold
          : 1 - offset <= pageActivationThreshold;

        const nextPage = isReachedThreshold ? position + 1 : position;

        if (currentPage.value !== nextPage) {
          setCurrentPageAndNotify(nextPage);
        }
      }
    );

    useAnimatedReaction(
      () => scrollState.value,
      (value, previousValue) => {
        if (onPageScrollStateChanged) {
          runOnJS(onPageScrollStateChanged)(value);
        }

        if (value === 'dragging' && onDragStart) {
          runOnJS(onDragStart)();
        }

        if (previousValue === 'dragging' && onDragEnd) {
          runOnJS(onDragEnd)();
        }
      }
    );

    let panGesture = Gesture.Pan()
      .enabled(scrollEnabled)
      .onStart(() => {
        scrollOffsetInterpolator?.onPanStart?.();

        cancelAnimation(panOffset);
        setRemoveClippedPages(false);

        panGestureStartOffset.value = panOffset.value;
        panGestureStartPage.value = currentPage.value;

        scrollState.value = 'dragging';
      })
      .onChange((e) => {
        const translation = isVertical ? e.translationY : e.translationX;

        panOffset.value = panGestureStartOffset.value + translation;
      })
      .onEnd((e) => {
        const translation = isVertical ? e.translationY : e.translationX;
        const velocity = isVertical ? e.velocityY : e.velocityX;

        if (!isLayoutMeasured || !translation) {
          return;
        }

        scrollState.value = 'settling';

        const isStart = velocity < 0;

        const translationProgress = -panOffset.value / pageSize;
        const nextPageVisiblePart = isStart
          ? translationProgress % 1
          : 1 - (translationProgress % 1);

        const isEnoughVelocity = Math.abs(velocity) > panVelocityThreshold;
        const isEnoughPageVisibility =
          nextPageVisiblePart > NEXT_PAGE_VISIBLE_PART_THRESHOLD;

        let nextPage = isStart
          ? Math.floor(translationProgress)
          : Math.ceil(translationProgress);

        if (isEnoughVelocity || isEnoughPageVisibility) {
          nextPage += isStart ? 1 : -1;
        }

        scrollToPage(nextPage, true);
      });

    if (Platform.OS === 'android') {
      if (isVertical) {
        panGesture
          .activeOffsetY(ANDROID_ACTIVE_OFFSET)
          .failOffsetX(ANDROID_FAIL_OFFSET);
      } else {
        panGesture
          .activeOffsetX(ANDROID_ACTIVE_OFFSET)
          .failOffsetY(ANDROID_FAIL_OFFSET);
      }
    }

    if (Platform.OS === 'ios') {
      if (isVertical) {
        panGesture.activeOffsetY(IOS_ACTIVE_OFFSET);
      } else {
        panGesture.activeOffsetX(IOS_ACTIVE_OFFSET);
      }
    }

    if (gestureConfiguration) {
      panGesture = gestureConfiguration(panGesture);
    }

    const pageAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        isVertical
          ? { translateY: interpolatedPanOffset.value }
          : { translateX: interpolatedPanOffset.value },
      ],
    }));

    const pagerStyle = useAnimatedStyle(() => {
      if (!style) {
        return {};
      }

      if (typeof style === 'function') {
        return style({
          scrollOffset: -panOffset.value / pageSize,
          interpolatedScrollOffset: -interpolatedPanOffset.value / pageSize,
          pageSize,
        });
      }

      return style;
    });

    const content = Children.map(children, (child, index) => {
      return (
        <PageContainer
          key={childrenKeys[index]}
          currentPage={currentPage}
          size={pageSize}
          pageMargin={pageMargin}
          pageIndex={index}
          lazy={lazy}
          lazyPageLimit={lazyPageLimit}
          trackOnscreen={trackOnscreen}
          trackOnscreenPageLimit={trackOnscreenPageLimit}
          canRemoveClippedPages={canRemoveClippedPages}
          isRemovingClippedPagesEnabled={removeClippedPages}
          pageStyleInterpolator={pageStyleInterpolator}
          scrollPosition={relativePanOffset}
          orientation={orientation}
        >
          {child}
        </PageContainer>
      );
    });

    return (
      <Animated.View style={[styles.flex, pagerStyle]}>
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;

            if (layout.width !== width || layout.height !== height) {
              setLayout({ width, height });
            }
          }}
        />
        {isLayoutMeasured && (
          <GestureDetector gesture={panGesture}>
            <View
              style={[
                isVertical
                  ? { height: pageSize, marginTop: -pageMargin / 2 }
                  : { width: pageSize, marginLeft: -pageMargin / 2 },
                styles.flex,
                styles.hidden,
              ]}
              removeClippedSubviews={
                Platform.OS === 'ios' ? removeClippedPages : false
              }
            >
              <Animated.View
                style={[
                  isVertical ? { height: contentSize } : { width: contentSize },
                  isVertical ? styles.column : styles.row,
                  isVertical ? undefined : styles.flex,
                  pageAnimatedStyle,
                ]}
              >
                {content}
              </Animated.View>
            </View>
          </GestureDetector>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hidden: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});

const PagerViewMemo = memo(PagerView);
PagerViewMemo.displayName = 'PagerView';

export { PagerViewMemo as PagerView };
