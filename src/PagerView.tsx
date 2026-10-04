import {
  Children,
  forwardRef,
  memo,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';

import { Platform, StyleSheet, View } from 'react-native';

import {
  Gesture,
  GestureDetector,
  type PanGesture,
} from 'react-native-gesture-handler';
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
  Reanimated3DefaultSpringConfig,
} from 'react-native-reanimated';

import { ActivePageStoreContext } from './contexts/ActivePageStoreContext';
import { LoopPageCountContext } from './contexts/LoopPageCountContext';
import { PagerContext } from './contexts/PagerContext';
import { useScrollableWrapper } from './contexts/ScrollableWrapperContext';
import { useCreateActivePageStore } from './hooks/useCreateActivePageStore';
import { useCustomClippingProvider } from './hooks/useCustomClipping';
import { useExecuteEffectOnce } from './hooks/useExecuteEffectOnce';
import { usePagerLayout } from './hooks/usePagerLayout';
import { usePrevious } from './hooks/usePrevious';
import { PageContainer } from './PageContainer';
import {
  type ExternalGesture,
  type PagerViewProps,
  type PagerViewRef,
  type ScrollState,
  type ScrollToPageSpringConfig,
} from './types';
import {
  getChildKey,
  getLoopedValue,
  getNearestLoopPage,
  getPageOffset,
  isArrayEqual,
  toPageIndex,
  toReachablePage,
} from './utils';

const NEXT_PAGE_VISIBLE_PART_THRESHOLD = 0.5;
const DEFAULT_GESTURE_DIRECTION_TOLERANCE_DEG = 45;

const defaultBlocksExternalGesture: ExternalGesture[] = [];

const defaultScrollToPageSpringConfig: ScrollToPageSpringConfig = ({
  isOverscroll,
}) => {
  'worklet';

  return {
    ...Reanimated3DefaultSpringConfig,
    damping: 100,
    mass: isOverscroll ? 0.5 : 0.15,
  };
};

const PagerView = forwardRef<PagerViewRef, PagerViewProps>(
  (
    {
      children,
      initialPage = 0,
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
      onInitialMeasure,
      estimatedSize,
      removeClippedPages: _removeClippedPages = true,
      holdCurrentPageOnChildrenUpdate = false,
      gestureConfiguration,
      style,
      panVelocityThreshold = 500,
      pageStyleInterpolator,
      scrollOffsetInterpolator: _scrollOffsetInterpolator,
      orientation = 'horizontal',
      loop = false,
      activationDistance: gestureActivationDistance = 10,
      failActivationWhenExceedingStartEdge:
        _failActivationWhenExceedingStartEdge,
      failActivationWhenExceedingEndEdge: _failActivationWhenExceedingEndEdge,
      hitSlop,
      blockParentScrollableWrapperActivation,
      blocksExternalGesture = defaultBlocksExternalGesture,
      scrollToPageSpringConfig = defaultScrollToPageSpringConfig,
      gestureDirectionToleranceDeg = DEFAULT_GESTURE_DIRECTION_TOLERANCE_DEG,
    },
    ref,
  ) => {
    const parentScrollableWrapper = useScrollableWrapper();

    const isVertical = orientation === 'vertical';
    const isProvidedStyleFunction = typeof style === 'function';

    const externalStyleFunction = isProvidedStyleFunction ? style : undefined;
    const pagerStaticStyle = isProvidedStyleFunction ? undefined : style;

    const pageCount = Children.count(children);
    const currentPage = useSharedValue(initialPage);

    // In loop mode the scroll offset is unbounded (virtual), and pages are moved
    // to the loop cycle closest to the current scroll position.
    // The rest of the logic is the same for both modes, the differences are configured here and in utils
    const loopPageCount = loop && pageCount > 1 ? pageCount : null;

    // There are no edges in loop mode
    const scrollOffsetInterpolator = loopPageCount
      ? undefined
      : _scrollOffsetInterpolator;
    const failActivationWhenExceedingStartEdge =
      !loopPageCount && _failActivationWhenExceedingStartEdge;
    const failActivationWhenExceedingEndEdge =
      !loopPageCount && _failActivationWhenExceedingEndEdge;

    const {
      layoutViewRef,
      contentSize,
      isLayoutMeasured,
      pageSize,
      updateLayoutValue,
      isLayoutHandlerCalledShared,
    } = usePagerLayout({
      estimatedSize,
      isVertical,
      pageCount,
      pageMargin,
      onUpdateLayoutValue: (nextPageSize) => {
        runOnUI(() => {
          panOffset.value = getPageOffset(currentPage.value, nextPageSize);
          scrollTargetPage.value = currentPage.value;
        })();
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

    // The (virtual in loop mode) page the pager is scrolling to or resting at
    const scrollTargetPage = useSharedValue(initialPage);

    const minPanOffset = loopPageCount ? -Infinity : -contentSize + pageSize;
    const maxPanOffset = loopPageCount ? Infinity : 0;

    const scrollState = useSharedValue<ScrollState>('idle');
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

      // In loop mode this also brings the offset back to the first loop cycle
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
        scrollTargetPage.value = nextPage;
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

        const targetPage = toReachablePage(page, pageCount, loopPageCount);

        const isOverscroll = targetPage !== page;

        const pageOffset = getPageOffset(targetPage, pageSize);

        const normalizedPage = toPageIndex(
          targetPage,
          pageCount,
          loopPageCount,
        );

        // The same visual position, in loop mode within the first loop cycle,
        // so the virtual offset doesn't grow with every lap
        const normalizedPageOffset = getPageOffset(normalizedPage, pageSize);

        scrollTargetPage.value = targetPage;

        if (animated) {
          panOffset.value = withSpring(
            pageOffset,
            scrollToPageSpringConfig({ isOverscroll, page: normalizedPage }),
            (finished) => {
              if (finished) {
                panOffset.value = normalizedPageOffset;
                scrollTargetPage.value = normalizedPage;

                // The visible scroll position may not change while settling (e.g. when the pager
                // is pressed against an edge), and then the scroll position reaction can't finish it
                if (scrollState.value === 'settling') {
                  if (currentPage.value !== normalizedPage) {
                    setCurrentPageAndNotify(normalizedPage);
                  }

                  scrollState.value = 'idle';
                }
              }

              setRemoveClippedPages(true);
            },
          );
        } else {
          panOffset.value = normalizedPageOffset;
          scrollTargetPage.value = normalizedPage;

          setRemoveClippedPages(true);
        }
      },
      [
        isLayoutMeasured,
        pageCount,
        pageSize,
        panOffset,
        setRemoveClippedPages,
        scrollToPageSpringConfig,
        loopPageCount,
        scrollState,
        currentPage,
        setCurrentPageAndNotify,
        scrollTargetPage,
      ],
    );

    const imperativeScrollToPage = useCallback(
      (page: number, animated: boolean) => {
        'worklet';

        const currentPageValue = currentPage.value;

        // The copy of the current page the pager is heading to.
        // While dragging there is no target yet, so the copy closest to the finger is used
        const referencePage =
          scrollState.value === 'dragging' && pageSize
            ? -panOffset.value / pageSize
            : scrollTargetPage.value;

        // The page is counted from the current one: pages within [0, pageCount) are reached directly,
        // and in loop mode pages outside this range continue around the loop
        const targetPage =
          getNearestLoopPage(currentPageValue, referencePage, loopPageCount) +
          page -
          currentPageValue;

        const nextPage = toPageIndex(page, pageCount, loopPageCount);

        scrollState.value = 'idle';

        if (currentPageValue !== nextPage) {
          setCurrentPageAndNotify(nextPage);
        }

        // Avoid applying programmatic offsets before the first real layout measurement.
        if (!isLayoutHandlerCalledShared.value) {
          return;
        }

        setRemoveClippedPages(false);

        scrollToPage(targetPage, animated);
      },
      [
        scrollState,
        scrollToPage,
        setCurrentPageAndNotify,
        setRemoveClippedPages,
        isLayoutHandlerCalledShared,
        loopPageCount,
        currentPage,
        panOffset,
        pageSize,
        pageCount,
        scrollTargetPage,
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        // Runs on the UI thread to avoid synchronous shared value reads from the JS thread
        // and races with the gesture and animations
        setPage: (page: number) => runOnUI(imperativeScrollToPage)(page, true),
        setPageWithoutAnimation: (page: number) =>
          runOnUI(imperativeScrollToPage)(page, false),
      }),
      [imperativeScrollToPage],
    );

    const interpolatedPanOffset = useDerivedValue(() => {
      if (!scrollOffsetInterpolator) {
        return clamp(panOffset.value, minPanOffset, maxPanOffset);
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

    // In loop mode the content is rendered within the first loop cycle, and pages are moved around it.
    // At a virtual offset beyond the first cycle the content container would be completely outside
    // the viewport, and iOS unmounts such views when it clips subviews
    const renderedPanOffset = useDerivedValue(
      () =>
        -getLoopedValue(
          -interpolatedPanOffset.value,
          loopPageCount && contentSize,
        ),
    );

    const renderedScrollPosition = useDerivedValue(
      () => -renderedPanOffset.value / pageSize,
    );

    useAnimatedReaction(
      () => interpolatedScrollPosition.value,
      (value) => {
        const position = Math.floor(value);
        const offset = value - position;

        if (onPageScroll) {
          onPageScroll(getLoopedValue(value, loopPageCount));
        }

        if (scrollState.value === 'idle') {
          return;
        }

        if (scrollState.value === 'settling' && offset === 0) {
          scrollState.value = 'idle';

          const settledPage = toPageIndex(position, pageCount, loopPageCount);

          if (currentPage.value !== settledPage) {
            setCurrentPageAndNotify(settledPage);
          }

          return;
        }

        const isScrollingToRight = position >= panGestureStartPage.value;

        const isReachedThreshold = isScrollingToRight
          ? offset >= pageActivationThreshold
          : 1 - offset <= pageActivationThreshold;

        const nextPage = toPageIndex(
          isReachedThreshold ? position + 1 : position,
          pageCount,
          loopPageCount,
        );

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

    const applyBlocksExternalGesture = useCallback(
      (gesture: PanGesture) => {
        const gestures: ExternalGesture[] = [];

        if (blockParentScrollableWrapperActivation && parentScrollableWrapper) {
          gestures.push(parentScrollableWrapper.gesture);
        }

        gesture.blocksExternalGesture(...gestures, ...blocksExternalGesture);
      },
      [
        blockParentScrollableWrapperActivation,
        blocksExternalGesture,
        parentScrollableWrapper,
      ],
    );

    const gestureAngleThreshold = useMemo(
      () => Math.tan((gestureDirectionToleranceDeg * Math.PI) / 180),
      [gestureDirectionToleranceDeg],
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

          const crossToMain = crossAxisAbsoluteDelta / mainAxisAbsoluteDelta;

          // Activate gesture if main axis movement is sufficient and dominant
          if (
            mainAxisAbsoluteDelta >= gestureActivationDistance &&
            crossToMain <= gestureAngleThreshold
          ) {
            isGestureManuallyActivated.value = true;

            state.activate();

            return;
          }

          if (
            crossAxisAbsoluteDelta >= gestureActivationDistance &&
            crossToMain > gestureAngleThreshold
          ) {
            state.fail();
          }
        })
        .onStart(() => {
          scrollOffsetInterpolator?.onPanStart?.();

          cancelAnimation(panOffset);
          setRemoveClippedPages(false);

          panGestureStartOffset.value = panOffset.value;
          panGestureStartPage.value = getNearestLoopPage(
            currentPage.value,
            -panOffset.value / pageSize,
            loopPageCount,
          );

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

          if (!isLayoutMeasured) {
            return;
          }

          scrollState.value = 'settling';

          if (!translation) {
            // The finger returned to where it started: settle on the closest page
            scrollToPage(Math.round(-panOffset.value / pageSize), true);

            return;
          }

          const isStart = velocity < 0;

          const translationProgress = -panOffset.value / pageSize;

          // In loop mode progress is negative before the first page, so the positive fractional part is taken.
          // Without loop mode `%` keeps the existing handling of overscroll beyond the first page
          const translationProgressFraction = loopPageCount
            ? translationProgress - Math.floor(translationProgress)
            : translationProgress % 1;

          const nextPageVisiblePart = isStart
            ? translationProgressFraction
            : 1 - translationProgressFraction;

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

      applyBlocksExternalGesture(gesture);

      if (gestureConfiguration) {
        gesture = gestureConfiguration(gesture);
      }

      return gesture;
    }, [
      scrollEnabled,
      hitSlop,
      applyBlocksExternalGesture,
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
      gestureAngleThreshold,
      loopPageCount,
    ]);

    const pageAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        isVertical
          ? { translateY: renderedPanOffset.value }
          : { translateX: renderedPanOffset.value },
      ],
    }));

    const pagerAnimatedStyle = useAnimatedStyle(() => {
      if (!externalStyleFunction) {
        return {};
      }

      return externalStyleFunction({
        scrollPosition: getLoopedValue(
          -panOffset.value / pageSize,
          loopPageCount,
        ),
        interpolatedScrollPosition: renderedScrollPosition.value,
        pageSize,
      });
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
          canRemoveClippedPages={canRemoveClippedPages}
          isRemovingClippedPagesEnabled={removeClippedPages}
          pageStyleInterpolator={pageStyleInterpolator}
          scrollPosition={renderedScrollPosition}
          orientation={orientation}
          loop={loop}
          loopPageCount={loopPageCount}
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
      <Animated.View
        style={[styles.flex, pagerStaticStyle, pagerAnimatedStyle]}
      >
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
                  <LoopPageCountContext.Provider value={loopPageCount}>
                    {content}
                  </LoopPageCountContext.Provider>
                </PagerContext.Provider>
              </Animated.View>
            </View>
          </GestureDetector>
        )}
      </Animated.View>
    );
  },
);

const PagerViewWrapper = memo(
  forwardRef<PagerViewRef, PagerViewProps>(
    (
      { initialPage: _initialPage = 0, onPageSelected, children, ...props },
      ref,
    ) => {
      const pageCount = Children.count(children);
      const initialPage = useRef(clamp(_initialPage, 0, pageCount - 1)).current;

      const { store, onPageSelected: storeOnPageSelected } =
        useCreateActivePageStore(initialPage);

      const onPageSelectedRef = useRef(onPageSelected);

      useLayoutEffect(() => {
        onPageSelectedRef.current = onPageSelected;
      });

      // Stable, so an inline `onPageSelected` doesn't recreate worklets and the pan gesture on every render
      const handlePageSelected = useCallback(
        (page: number) => {
          onPageSelectedRef.current?.(page);

          storeOnPageSelected(page);
        },
        [storeOnPageSelected],
      );

      return (
        <ActivePageStoreContext.Provider value={store}>
          <PagerView
            {...props}
            onPageSelected={handlePageSelected}
            initialPage={initialPage}
            ref={ref}
          >
            {children}
          </PagerView>
        </ActivePageStoreContext.Provider>
      );
    },
  ),
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

export { PagerViewWrapper as PagerView };
