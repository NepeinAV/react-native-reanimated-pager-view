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
import {
  getOverdragOffset,
  getOverdragSide,
  getPageOffset,
  isArrayEqual,
} from './utils';

type OffsetTuple = [number, number];

const ANDROID_ACTIVE_OFFSET: OffsetTuple = [-10, 10];
const ANDROID_FAIL_OFFSET: OffsetTuple = [-30, 30];
const IOS_ACTIVE_OFFSET: OffsetTuple = [-5, 5];

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
      overdrag = true,
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
      onOverdrag,
      style,
      overdragThreshold = 100,
      overdragResistanceFactor = 0.7,
      panVelocityThreshold = 500,
      pageInterpolator,
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

    const initialPanTotalOffset = getPageOffset(initialPage, pageSize);
    const panTotalOffset = useSharedValue(initialPanTotalOffset);
    const panGestureStartOffset = useSharedValue(initialPanTotalOffset);

    const scrollState = useSharedValue<ScrollState>('idle');

    const currentPage = useSharedValue(initialPage);
    const panGestureStartPage = useSharedValue(initialPage);

    useExecuteEffectOnce(() => {
      if (isLayoutMeasured) {
        panTotalOffset.value = getPageOffset(initialPage, pageSize);

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
      const isOffsetChanged = nextOffset !== panTotalOffset.value;

      if (isPageChanged && onPageSelected) {
        runOnJS(onPageSelected)(nextPage);
      }

      if (isPageChanged) {
        currentPage.value = nextPage;
      }

      if (isOffsetChanged) {
        panTotalOffset.value = nextOffset;
      }
    }, [
      currentPage,
      pageCount,
      holdCurrentPageOnChildrenUpdate,
      pageSize,
      panTotalOffset,
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
          panTotalOffset.value = withSpring(
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
          panTotalOffset.value = pageOffset;

          setRemoveClippedPages(true);
        }
      },
      [
        isLayoutMeasured,
        pageCount,
        pageSize,
        panTotalOffset,
        setRemoveClippedPages,
      ]
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

    const scrollPosition = useDerivedValue(() => {
      const value = panTotalOffset.value;

      const position = Math.floor(-value / pageSize);
      const offset = -value / pageSize - position;

      return { position, offset };
    });

    useAnimatedReaction(
      () => scrollPosition.value,
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

    const overdragResistanceThreshold =
      overdragThreshold / overdragResistanceFactor;

    let panGesture = Gesture.Pan()
      .enabled(scrollEnabled)
      .onStart(() => {
        cancelAnimation(panTotalOffset);
        setRemoveClippedPages(false);

        panGestureStartOffset.value = panTotalOffset.value;
        panGestureStartPage.value = currentPage.value;

        scrollState.value = 'dragging';
      })
      .onChange((e) => {
        const translation = isVertical ? e.translationY : e.translationX;
        const totalOffset = panGestureStartOffset.value + translation;

        const overdragOffset = overdrag
          ? getOverdragOffset(totalOffset, contentSize - pageSize)
          : 0;

        panTotalOffset.value = overdrag
          ? totalOffset - overdragOffset * overdragResistanceFactor
          : clamp(totalOffset, -contentSize + pageSize, 0);

        if (
          overdrag &&
          onOverdrag &&
          Math.abs(overdragOffset) > overdragResistanceThreshold
        ) {
          const side = getOverdragSide(overdragOffset, isVertical);

          runOnJS(onOverdrag)(side);
        }
      })
      .onEnd((e) => {
        const translation = isVertical ? e.translationY : e.translationX;
        const velocity = isVertical ? e.velocityY : e.velocityX;

        if (!isLayoutMeasured || !translation) {
          return;
        }

        scrollState.value = 'settling';

        const isNextDirection = velocity < 0;

        const translationProgress = Math.abs(panTotalOffset.value / pageSize);
        const nextPageVisiblePart = isNextDirection
          ? translationProgress % 1
          : 1 - (translationProgress % 1);

        const isEnoughVelocity = Math.abs(velocity) > panVelocityThreshold;
        const isEnoughPageVisibility =
          nextPageVisiblePart > NEXT_PAGE_VISIBLE_PART_THRESHOLD;

        let nextPage = isNextDirection
          ? Math.floor(translationProgress)
          : Math.ceil(translationProgress);

        if (isEnoughVelocity || isEnoughPageVisibility) {
          nextPage += isNextDirection ? 1 : -1;
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

    const pageAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: isVertical
          ? [{ translateY: panTotalOffset.value }]
          : [{ translateX: panTotalOffset.value }],
      };
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
          pageInterpolator={pageInterpolator}
          scrollPosition={scrollPosition}
          orientation={orientation}
        >
          {child}
        </PageContainer>
      );
    });

    return (
      <View style={[styles.flex, style]}>
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
      </View>
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
