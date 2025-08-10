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
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  clamp,
  runOnJS,
  runOnUI,
  useAnimatedReaction,
  useAnimatedStyle,
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
import { getOverdragOffset, getPageOffset, isArrayEqual } from './utils';

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
      removeClippedPages: _removeClippedPages = true,
      holdCurrentPageOnChildrenUpdate = false,
      gestureConfiguration,
      onOverdrag,
      style,
      overdragThreshold = 100,
      overdragResistanceFactor = 0.7,
      panVelocityThreshold = 500,
    },
    ref
  ) => {
    const { width: windowWidth } = Dimensions.get('window');

    const [layout, setLayout] = useState({
      width: estimatedWidth === null ? null : (estimatedWidth ?? windowWidth),
    });

    const pageCount = Children.count(children);
    const pageWidth = (layout.width || 0) + pageMargin;
    const contentWidth = pageCount * pageWidth;

    const initialPage = useRef(clamp(_initialPage, 0, pageCount - 1)).current;

    const childrenKeys = useMemo(
      () =>
        Children.map(children, (child, index) =>
          isValidElement(child) ? child.key : index
        ) as string[],
      [children]
    );

    const previousChildrenKeys = usePrevious(childrenKeys);
    const previousPageWidth = usePrevious(pageWidth);

    const removeClippedPagesIos = holdCurrentPageOnChildrenUpdate
      ? false
      : _removeClippedPages;
    const removeClippedPages =
      Platform.OS === 'ios' ? removeClippedPagesIos : _removeClippedPages;

    const isLayoutMeasured = layout.width !== null;

    const initialOffsetX = getPageOffset(initialPage, pageWidth);
    const offsetX = useSharedValue(initialOffsetX);
    const panGestureStartOffsetX = useSharedValue(initialOffsetX);

    const scrollState = useSharedValue<ScrollState>('idle');

    const currentPage = useSharedValue(initialPage);
    const panGestureStartPage = useSharedValue(initialPage);

    useExecuteEffectOnce(() => {
      if (isLayoutMeasured) {
        offsetX.value = getPageOffset(initialPage, pageWidth);

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

      const nextOffset = getPageOffset(nextPage, pageWidth);

      const isPageChanged = nextPage !== currentPageValue;
      const isOffsetChanged = nextOffset !== offsetX.value;

      if (isPageChanged && onPageSelected) {
        runOnJS(onPageSelected)(nextPage);
      }

      if (isPageChanged) {
        currentPage.value = nextPage;
      }

      if (isOffsetChanged) {
        offsetX.value = nextOffset;
      }
    }, [
      currentPage,
      pageCount,
      holdCurrentPageOnChildrenUpdate,
      pageWidth,
      offsetX,
      onPageSelected,
      childrenKeys,
      previousChildrenKeys,
    ]);

    useEffect(() => {
      if (childrenKeys.length === 0) {
        return;
      }

      if (
        previousPageWidth === pageWidth &&
        previousChildrenKeys &&
        isArrayEqual(previousChildrenKeys, childrenKeys)
      ) {
        return;
      }

      runOnUI(handleChildrenUpdate)();
    }, [
      pageWidth,
      childrenKeys,
      handleChildrenUpdate,
      previousChildrenKeys,
      previousPageWidth,
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
          pageWidth
        );

        if (animated) {
          offsetX.value = withSpring(
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
          offsetX.value = pageOffset;

          setRemoveClippedPages(true);
        }
      },
      [isLayoutMeasured, pageCount, pageWidth, offsetX, setRemoveClippedPages]
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

    useAnimatedReaction(
      () => offsetX.value,
      (value) => {
        const position = Math.floor(-value / pageWidth);
        const offset = -value / pageWidth - position;

        if (onPageScroll) {
          onPageScroll({ position, offset });
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
        cancelAnimation(offsetX);
        setRemoveClippedPages(false);

        panGestureStartOffsetX.value = offsetX.value;
        panGestureStartPage.value = currentPage.value;

        scrollState.value = 'dragging';
      })
      .onChange((e) => {
        const totalOffset = panGestureStartOffsetX.value + e.translationX;

        const overdragOffset = overdrag
          ? getOverdragOffset(totalOffset, contentWidth - pageWidth)
          : 0;

        offsetX.value = overdrag
          ? totalOffset - overdragOffset * overdragResistanceFactor
          : clamp(totalOffset, -contentWidth + pageWidth, 0);

        if (
          overdrag &&
          onOverdrag &&
          Math.abs(overdragOffset) > overdragResistanceThreshold
        ) {
          const side = overdragOffset > 0 ? 'right' : 'left';

          runOnJS(onOverdrag)(side);
        }
      })
      .onEnd((e) => {
        if (!isLayoutMeasured || !e.translationX) {
          return;
        }

        scrollState.value = 'settling';

        const isLeftSwipe = e.velocityX < 0;

        const translationProgress = Math.abs(offsetX.value / pageWidth);
        const nextPageVisiblePart = isLeftSwipe
          ? translationProgress % 1
          : 1 - (translationProgress % 1);

        const isEnoughVelocity = Math.abs(e.velocityX) > panVelocityThreshold;
        const isEnoughPageVisibility =
          nextPageVisiblePart > NEXT_PAGE_VISIBLE_PART_THRESHOLD;

        let nextPage = isLeftSwipe
          ? Math.floor(translationProgress)
          : Math.ceil(translationProgress);

        if (isEnoughVelocity || isEnoughPageVisibility) {
          nextPage += isLeftSwipe ? 1 : -1;
        }

        scrollToPage(nextPage, true);
      });

    if (Platform.OS === 'android') {
      panGesture.activeOffsetX([-10, 10]).failOffsetY([-30, 30]);
    }

    if (Platform.OS === 'ios') {
      panGesture.activeOffsetX([-10, 10]);
    }

    if (gestureConfiguration) {
      panGesture = gestureConfiguration(panGesture);
    }

    const pageAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: offsetX.value }],
      };
    });

    const content = Children.map(children, (child, index) => {
      return (
        <PageContainer
          key={childrenKeys[index]}
          currentPage={currentPage}
          width={pageWidth}
          pageMargin={pageMargin}
          pageIndex={index}
          lazy={lazy}
          lazyPageLimit={lazyPageLimit}
          trackOnscreen={trackOnscreen}
          trackOnscreenPageLimit={trackOnscreenPageLimit}
          canRemoveClippedPages={canRemoveClippedPages}
          isRemovingClippedPagesEnabled={removeClippedPages}
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
            const { width } = e.nativeEvent.layout;

            if (layout.width !== width) {
              setLayout({ width });
            }
          }}
        />
        {isLayoutMeasured && (
          <GestureDetector gesture={panGesture}>
            <View
              style={[
                { width: pageWidth, marginLeft: -pageMargin / 2 },
                styles.flex,
                styles.hidden,
              ]}
              removeClippedSubviews={
                Platform.OS === 'ios' ? removeClippedPages : false
              }
            >
              <Animated.View
                style={[
                  { width: contentWidth },
                  styles.row,
                  styles.flex,
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
});

const PagerViewMemo = memo(PagerView);
PagerViewMemo.displayName = 'PagerView';

export { PagerViewMemo as PagerView };
