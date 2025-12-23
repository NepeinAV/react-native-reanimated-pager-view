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
import { getChildKey, getPageOffset, isArrayEqual } from './utils';

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
      scrollOffsetInterpolator,
      orientation = 'horizontal',
      activationDistance: gestureActivationDistance = 10,
      failActivationWhenExceedingStartEdge,
      failActivationWhenExceedingEndEdge,
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

        const clampedPage = clamp(page, 0, pageCount - 1);

        const isOverscroll = page < 0 || page >= pageCount;

        const pageOffset = getPageOffset(clampedPage, pageSize);

        if (animated) {
          panOffset.value = withSpring(
            pageOffset,
            scrollToPageSpringConfig({ isOverscroll, page: clampedPage }),
            () => {
              setRemoveClippedPages(true);
            },
          );
        } else {
          panOffset.value = pageOffset;

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
      ],
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
    ]);

    const pageAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        isVertical
          ? { translateY: interpolatedPanOffset.value }
          : { translateX: interpolatedPanOffset.value },
      ],
    }));

    const pagerAnimatedStyle = useAnimatedStyle(() => {
      if (!externalStyleFunction) {
        return {};
      }

      return externalStyleFunction({
        scrollPosition: -panOffset.value / pageSize,
        interpolatedScrollPosition: interpolatedScrollPosition.value,
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

      const handlePageSelected = useCallback(
        (page: number) => {
          onPageSelected?.(page);

          storeOnPageSelected(page);
        },
        [onPageSelected, storeOnPageSelected],
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
