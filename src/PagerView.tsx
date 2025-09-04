import {
  Children,
  forwardRef,
  memo,
  useImperativeHandle,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';

import { Platform, StyleSheet, View } from 'react-native';

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

import { PagerContext } from './contexts/PagerContext';
import { useCustomClippingProvider } from './hooks/useCustomClipping';
import { useExecuteEffectOnce } from './hooks/useExecuteEffectOnce';
import { usePagerLayout } from './hooks/usePagerLayout';
import { usePrevious } from './hooks/usePrevious';
import { PageContainer } from './PageContainer';
import {
  type PagerViewProps,
  type PagerViewRef,
  type ScrollState,
} from './types';
import { getChildKey, getPageOffset, isArrayEqual } from './utils';

const NEXT_PAGE_VISIBLE_PART_THRESHOLD = 0.5;
const GESTURE_DIRECTION_RATIO = 0.5; // 90 deg

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
      estimatedSize,
      removeClippedPages: _removeClippedPages = true,
      holdCurrentPageOnChildrenUpdate = false,
      gestureConfiguration,
      style,
      panVelocityThreshold = 500,
      pageStyleInterpolator,
      scrollOffsetInterpolator,
      orientation = 'horizontal',
      activationDistance: gestureActivationDistance = 10,
      failActivationWhenExceedingStartEdge,
      failActivationWhenExceedingEndEdge,
      hitSlop,
    },
    ref,
  ) => {
    const isVertical = orientation === 'vertical';
    const isProvidedStyleFunction = typeof style === 'function';

    const pageCount = Children.count(children);
    const initialPage = useRef(clamp(_initialPage, 0, pageCount - 1)).current;

    const {
      layoutViewRef,
      contentSize,
      isLayoutMeasured,
      pageSize,
      updateLayoutValue,
    } = usePagerLayout({
      estimatedSize,
      isVertical,
      pageCount,
      pageMargin,
      onUpdateLayoutValue: (nextPageSize) => {
        panOffset.value = getPageOffset(currentPage.value, nextPageSize);
      },
    });

    const childrenKeys = Children.map(children, getChildKey) as string[];
    const previousChildrenKeys = usePrevious(childrenKeys);

    const removeClippedPagesIos = holdCurrentPageOnChildrenUpdate
      ? false
      : _removeClippedPages;

    const removeClippedPages =
      Platform.OS === 'ios' ? removeClippedPagesIos : _removeClippedPages;

    const initialPanOffset = getPageOffset(initialPage, pageSize);
    const panOffset = useSharedValue(initialPanOffset);
    const panGestureStartOffset = useSharedValue(initialPanOffset);

    const scrollState = useSharedValue<ScrollState>('idle');

    const currentPage = useSharedValue(initialPage);
    const panGestureStartPage = useSharedValue(initialPage);

    const isGestureManuallyActivated = useSharedValue(false);
    const initialTouchPositionX = useSharedValue(0);
    const initialTouchPositionY = useSharedValue(0);

    useExecuteEffectOnce(() => {
      if (isLayoutMeasured) {
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
      [currentPage, onPageSelected],
    );

    const handleChildrenUpdate = () => {
      'worklet';

      const currentPageValue = currentPage.value;

      let nextPage = clamp(currentPageValue, 0, pageCount - 1);

      if (holdCurrentPageOnChildrenUpdate && previousChildrenKeys) {
        const currentPageKey = previousChildrenKeys.find(
          (_, index) => index === currentPageValue,
        );

        const nextPageIndex = childrenKeys.findIndex(
          (key) => key === currentPageKey,
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
    };

    useEffect(() => {
      if (
        childrenKeys.length === 0 ||
        !previousChildrenKeys ||
        isArrayEqual(previousChildrenKeys, childrenKeys)
      ) {
        return;
      }

      runOnUI(handleChildrenUpdate)();

      // Ignore handleChildrenUpdate
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childrenKeys, previousChildrenKeys]);

    const scrollToPage = useCallback(
      (page: number, animated?: boolean) => {
        'worklet';

        if (!isLayoutMeasured) {
          return;
        }

        const isInRange = page >= 0 && page < pageCount;

        const pageOffset = getPageOffset(
          clamp(page, 0, pageCount - 1),
          pageSize,
        );

        if (animated) {
          panOffset.value = withSpring(
            pageOffset,
            {
              damping: 100,
              mass: isInRange ? 0.15 : 0.5,
            },
            () => {
              setRemoveClippedPages(true);
            },
          );
        } else {
          panOffset.value = pageOffset;

          setRemoveClippedPages(true);
        }
      },
      [isLayoutMeasured, pageCount, pageSize, panOffset, setRemoveClippedPages],
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
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        setPage: (page: number) => imperativeScrollToPage(page, true),
        setPageWithoutAnimation: (page: number) =>
          imperativeScrollToPage(page, false),
      }),
      [imperativeScrollToPage],
    );

    const interpolatedPanOffset = useDerivedValue(() => {
      if (!scrollOffsetInterpolator) {
        return clamp(panOffset.value, -contentSize + pageSize, 0);
      }

      const interpolatedRelativeOffset = scrollOffsetInterpolator.interpolator({
        scrollPosition: -panOffset.value / pageSize,
        pageCount,
        orientation,
      });

      return -interpolatedRelativeOffset * pageSize;
    });

    const interpolatedScrollPosition = useDerivedValue(
      () => -interpolatedPanOffset.value / pageSize,
    );

    useAnimatedReaction(
      () => interpolatedScrollPosition.value,
      (value) => {
        const position = Math.floor(value);
        const offset = value - position;

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
      },
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
      },
    );

    let panGesture = useMemo(() => {
      let gesture = Gesture.Pan()
        .enabled(scrollEnabled)
        .manualActivation(true)
        .onTouchesDown((event) => {
          const touch = event.changedTouches[0];

          if (!touch) {
            return;
          }

          initialTouchPositionX.value = touch.absoluteX;
          initialTouchPositionY.value = touch.absoluteY;

          isGestureManuallyActivated.value = false;
        })
        .onTouchesMove((e, state) => {
          if (isGestureManuallyActivated.value) {
            return;
          }

          const touch = e.changedTouches[0];

          if (!touch) {
            return;
          }

          // Calculate displacement from the initial touch point
          const deltaX = touch.absoluteX - initialTouchPositionX.value;
          const deltaY = touch.absoluteY - initialTouchPositionY.value;

          // Determine main and cross axis values based on orientation
          const mainAxisDelta = isVertical ? deltaY : deltaX;
          const crossAxisDelta = isVertical ? deltaX : deltaY;
          const mainAxisAbsoluteDelta = Math.abs(mainAxisDelta);
          const crossAxisAbsoluteDelta = Math.abs(crossAxisDelta);

          const shouldFailForStartEdge =
            failActivationWhenExceedingStartEdge &&
            currentPage.value === 0 &&
            mainAxisDelta > 0 &&
            mainAxisAbsoluteDelta >= gestureActivationDistance;

          const shouldFailForEndEdge =
            failActivationWhenExceedingEndEdge &&
            currentPage.value === pageCount - 1 &&
            mainAxisDelta < 0 &&
            mainAxisAbsoluteDelta >= gestureActivationDistance;

          if (shouldFailForStartEdge || shouldFailForEndEdge) {
            // Fail the pager gesture to allow parent gesture to activate
            state.fail();

            return;
          }

          // Calculate ratio of main axis to cross axis movement
          const mainToCrossRatio =
            crossAxisAbsoluteDelta === 0
              ? Number.POSITIVE_INFINITY
              : mainAxisAbsoluteDelta / crossAxisAbsoluteDelta;

          // Activate gesture if main axis movement is sufficient and dominant
          if (
            mainAxisAbsoluteDelta >= gestureActivationDistance &&
            mainToCrossRatio >= GESTURE_DIRECTION_RATIO
          ) {
            isGestureManuallyActivated.value = true;

            state.activate();

            return;
          }

          // Fail gesture if cross axis movement dominates
          const crossToMainRatio =
            mainAxisAbsoluteDelta === 0
              ? Number.POSITIVE_INFINITY
              : crossAxisAbsoluteDelta / mainAxisAbsoluteDelta;

          if (
            crossAxisAbsoluteDelta >= gestureActivationDistance &&
            crossToMainRatio >= GESTURE_DIRECTION_RATIO
          ) {
            state.fail();
          }
        })
        .onStart(() => {
          scrollOffsetInterpolator?.onPanStart?.();

          cancelAnimation(panOffset);
          setRemoveClippedPages(false);

          panGestureStartOffset.value = panOffset.value;
          panGestureStartPage.value = currentPage.value;

          scrollState.value = 'dragging';
        })
        .onChange((event) => {
          const translation = isVertical
            ? event.translationY
            : event.translationX;

          panOffset.value = panGestureStartOffset.value + translation;
        })
        .onEnd((event) => {
          const translation = isVertical
            ? event.translationY
            : event.translationX;

          const velocity = isVertical ? event.velocityY : event.velocityX;

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
        })
        .hitSlop(hitSlop);

      if (gestureConfiguration) {
        gesture = gestureConfiguration(gesture);
      }

      return gesture;
    }, [
      scrollEnabled,
      hitSlop,
      gestureConfiguration,
      initialTouchPositionX,
      initialTouchPositionY,
      isGestureManuallyActivated,
      isVertical,
      failActivationWhenExceedingStartEdge,
      currentPage,
      gestureActivationDistance,
      failActivationWhenExceedingEndEdge,
      pageCount,
      scrollOffsetInterpolator,
      panOffset,
      setRemoveClippedPages,
      panGestureStartOffset,
      panGestureStartPage,
      scrollState,
      isLayoutMeasured,
      pageSize,
      panVelocityThreshold,
      scrollToPage,
    ]);

    const pageAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        isVertical
          ? { translateY: interpolatedPanOffset.value }
          : { translateX: interpolatedPanOffset.value },
      ],
    }));

    const pagerStyle = useAnimatedStyle(() => {
      if (isProvidedStyleFunction) {
        return style({
          scrollPosition: -panOffset.value / pageSize,
          interpolatedScrollPosition: interpolatedScrollPosition.value,
          pageSize,
        });
      }

      return style || {};
    });

    const content = Children.map(children, (child, index) => {
      return (
        <PageContainer
          key={childrenKeys[index]}
          currentPage={currentPage}
          pageSize={pageSize}
          pageMargin={pageMargin}
          pageIndex={index}
          lazy={lazy}
          lazyPageLimit={lazyPageLimit}
          trackOnscreen={trackOnscreen}
          trackOnscreenPageLimit={trackOnscreenPageLimit}
          canRemoveClippedPages={canRemoveClippedPages}
          isRemovingClippedPagesEnabled={removeClippedPages}
          pageStyleInterpolator={pageStyleInterpolator}
          scrollPosition={interpolatedScrollPosition}
          orientation={orientation}
        >
          {child}
        </PageContainer>
      );
    });

    const pagerContextValue = useMemo(
      () => ({ panGesture, orientation }),
      [orientation, panGesture],
    );

    return (
      <Animated.View style={[styles.flex, pagerStyle]}>
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          onLayout={(event) => updateLayoutValue(event.nativeEvent.layout)}
          ref={layoutViewRef}
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
                <PagerContext.Provider value={pagerContextValue}>
                  {content}
                </PagerContext.Provider>
              </Animated.View>
            </View>
          </GestureDetector>
        )}
      </Animated.View>
    );
  },
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
