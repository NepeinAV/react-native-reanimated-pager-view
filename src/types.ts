import { type ReactNode } from 'react';

import { type StyleProp, type ViewStyle } from 'react-native';

import type { PanGesture } from 'react-native-gesture-handler';
import { type WithSpringConfig } from 'react-native-reanimated';

import { type GestureRef } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gesture';

export type PagerStyleFn = (params: {
  pageSize: number;
  scrollPosition: number;
  interpolatedScrollPosition: number;
}) => ViewStyle;

export type PagerViewProps = {
  children: ReactNode[];

  /**
   * Style object for the container
   */
  style?: StyleProp<ViewStyle> | PagerStyleFn;

  /**
   * The orientation of the pager
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;

  /**
   * @default 0
   */
  pageMargin?: number;

  /**
   * @default 0
   */
  initialPage?: number;

  /**
   * @default true
   */
  scrollEnabled?: boolean;

  /**
   * Determines the moment when the next page becomes active.
   *
   * For example, a value of `0.8` means the next page must be at least 80% visible to become active and trigger `onPageSelected`.
   *
   * @default 0.8
   */
  pageActivationThreshold?: number;

  /**
   * Minimum velocity for automatic page switching
   * @default 500
   */
  panVelocityThreshold?: number;

  /**
   * Function to customize pan gesture behavior
   */
  gestureConfiguration?: (gesture: PanGesture) => PanGesture;

  /**
   * How diagonal a swipe can be (in degrees) before PagerView rejects it as off-axis.
   *
   * Larger values allow more diagonal swipes; smaller values require a straighter swipe.
   *
   * @default 45
   */
  gestureDirectionToleranceDeg?: number;

  /**
   * Function to customize page style based on scroll position
   *
   * @returns ViewStyle object with animation styles
   */
  pageStyleInterpolator?: PageStyleInterpolator;

  /**
   * Function to customize behaviour of Pager scroll offset.
   *
   * @returns Modified offset value
   */
  scrollOffsetInterpolator?: ScrollOffsetInterpolator;

  /**
   * Allows deferring page rendering until they enter the visible area.
   *
   * @default false
   */
  lazy?: boolean;

  /**
   * Allows specifying the number of pages to render to the left and right of the active page.
   *
   * ---
   *
   * Forms a window in which a page should be rendered when it enters.
   *
   * For example, a value of `1` means that in addition to the active page, one page to the left and one to the right will be rendered.
   *
   * @default 1
   */
  lazyPageLimit?: number;

  /**
   * Allows specifying the size (width or height, depending on the orientation) of the parent container. If not set, the screen width is used by default.
   *
   * ----
   *
   * If the container size is unknown in advance, set to `null`. On first render, the available parent size will be obtained, and only then will the pages be rendered.
   *
   * **This is not recommended, as it increases total render time and the interface may appear less smooth if pages are heavy.**
   *
   * @default Screen width
   */
  estimatedSize?: number | null;

  /**
   * Reduces device load by removing inactive pages on the native platform, while preserving all input, scroll, etc. states.
   *
   * Trade-offs:
   * - May work incorrectly due to RN bugs.
   * - May work poorly with heavy pages; always test both options and choose the best.
   *
   * @default true
   */
  removeClippedPages?: boolean;

  /**
   * Calculates the new position of the active page when the number or order of pages changes and automatically shifts there.
   * For correct operation, unique keys must be specified for each page.
   *
   * If true, the removeClippedPages optimization is disabled on iOS due to RN bugs.
   *
   * @default false
   */
  holdCurrentPageOnChildrenUpdate?: boolean;

  /**
   * Minimum distance along the main axis before starting to swipe.
   *
   * @default 10
   */
  activationDistance?: number;

  /**
   * When true, fails pager gesture activation when user tries to swipe beyond the left/top edge.
   * This allows parent gesture handlers to take over when user swipes past the start boundary.
   *
   * Useful for navigation gestures like React Navigation's swipe-back.
   *
   * Activation conditions:
   * - For horizontal orientation: fails when on first page AND swiping rightward (left edge → right)
   * - For vertical orientation: fails when on first page AND swiping upward (top edge → down)
   *
   * @default false
   */
  failActivationWhenExceedingStartEdge?: boolean;

  /**
   * When true, fails pager gesture activation when user tries to swipe beyond the right/bottom edge.
   * This allows parent gesture handlers to take over when user swipes past the end boundary.
   *
   * Activation conditions:
   * - For horizontal orientation: fails when on last page AND swiping leftward (right edge → left)
   * - For vertical orientation: fails when on last page AND swiping downward (bottom edge → up)
   *
   * @default false
   */
  failActivationWhenExceedingEndEdge?: boolean;

  /**
   * This parameter enables control over what part of the connected view area can be used to begin recognizing the gesture.
   * When a negative number is provided the bounds of the view will reduce the area by the given number of points in each of the sides evenly.
   *
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture#hitslopsettings
   */
  hitSlop?: HitSlop;

  /**
   * When true, the pager's internal pan gesture will actively block activation of the
   * nearest parent `ScrollableWrapper` gesture (if such wrapper exists).
   *
   * Use when you want PagerView to capture swipes even while the parent scrollable is still decelerating (momentum scrolling).
   *
   * @platform iOS
   * @default false
   */
  blockParentScrollableWrapperActivation?: boolean;

  /**
   * Works similarily to `requireExternalGestureToFail` but the direction of the relation is reversed - instead of being one-to-many relation, it's many-to-one.
   *
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/#blocksexternalgesture
   */
  blocksExternalGesture?: ExternalGesture[];

  /**
   * Allows customizing the animation that is used when pager scrolls to a target page
   * after a drag or when calling `setPage`.
   *
   * @default
   * {
   *    damping: 100,
   *    mass: isOverscroll ? 0.5 : 0.15,
   * }
   */
  scrollToPageSpringConfig?: ScrollToPageSpringConfig;

  onPageSelected?: (page: number) => void;
  onPageScrollStateChanged?: (state: ScrollState) => void;
  onPageScroll?: (event: ScrollPosition) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onInitialMeasure?: () => void;
};

export type ExternalGesture = Exclude<GestureRef, number>;

export type HitSlop =
  | number
  | null
  | undefined
  | Partial<
      Record<
        'left' | 'right' | 'top' | 'bottom' | 'vertical' | 'horizontal',
        number
      >
    >
  | Record<'width' | 'left', number>
  | Record<'width' | 'right', number>
  | Record<'height' | 'top', number>
  | Record<'height' | 'bottom', number>;

export type PageStyleInterpolatorParams = {
  pageOffset: number;
  pageIndex: number;
  pageSize: number;
  scrollPosition: number;
};

export type ScrollOffsetInterpolatorParams = {
  scrollPosition: number;
  orientation: Orientation;
  pageCount: number;
};

export type PageStyleInterpolator = (
  params: PageStyleInterpolatorParams,
) => ViewStyle;

export type ScrollOffsetInterpolator = {
  interpolator: (params: ScrollOffsetInterpolatorParams) => number;
  onPanStart?: () => void;
};

export type PagerViewRef = {
  setPage: (page: number) => void;
  setPageWithoutAnimation: (page: number) => void;
};

export type ScrollToPageSpringConfig = (params: {
  isOverscroll: boolean;
  page: number;
}) => WithSpringConfig;

export type ScrollState = 'idle' | 'dragging' | 'settling';

export type ScrollPosition = number;

export type OverscrollSide = 'left' | 'right' | 'top' | 'bottom';

export type Orientation = 'horizontal' | 'vertical';
