import { type ReactNode } from 'react';
import { type ViewStyle } from 'react-native';
import type { PanGesture } from 'react-native-gesture-handler';

export type PagerStyleFn = (params: {
  pageSize: number;
  scrollOffset: number;
  interpolatedScrollOffset: number;
}) => ViewStyle;

export type PagerViewProps = {
  children: ReactNode[];

  /**
   * Style object for the container
   */
  style?: ViewStyle | PagerStyleFn;

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
   * Function to customize page style based on scroll position
   *
   * @returns ViewStyle object with animation styles
   */
  pageStyleInterpolator?: PageStyleInterpolator;

  /**
   * Function to customize behaviour of Pager scroll offset.
   *
   * @default bounceScrollOffsetInterpolator
   * @returns Modified offset value
   */
  scrollOffsetInterpolator?: ScrollOffsetInterpolator | null;

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
   * Allows tracking the visibility of pages on the screen.
   *
   * @default false
   */
  trackOnscreen?: boolean;

  /**
   * Allows specifying the number of pages that are considered visible on the screen.
   *
   * ---
   *
   * Forms a window in which a page is marked as visible when it enters.
   *
   * For example, a value of `1` means that in addition to the active page, one page to the left and one to the right are marked as visible. If set to `0`, only the active page is tracked.
   *
   * @default 0
   */
  trackOnscreenPageLimit?: number;

  /**
   * Allows specifying the width of the parent container. If not set, the screen width is used by default.
   *
   * ----
   *
   * If the container width is unknown in advance, set to `null`. On first render, the available parent width will be obtained, and only then will the pages be rendered.
   *
   * **This is not recommended, as it increases total render time and the interface may appear less smooth if pages are heavy.**
   *
   * @default Screen width
   */
  estimatedWidth?: number | null;

  /**
   * Allows specifying the height of the parent container. If not set, the screen height is used by default.
   * Only used when orientation is 'vertical'.
   *
   * ----
   *
   * If the container height is unknown in advance, set to `null`. On first render, the available parent height will be obtained, and only then will the pages be rendered.
   *
   * **This is not recommended, as it increases total render time and the interface may appear less smooth if pages are heavy.**
   *
   * @default Screen height
   */
  estimatedHeight?: number | null;

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

  onPageSelected?: (page: number) => void;
  onPageScrollStateChanged?: (state: ScrollState) => void;
  onPageScroll?: (event: ScrollPosition) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onInitialMeasure?: () => void;
};

export type PageStyleInterpolatorParams = {
  pageOffset: number;
  pageIndex: number;
};

export type ScrollOffsetInterpolatorParams = {
  scrollOffset: number;
  orientation: Orientation;
  pageCount: number;
};

export type PageStyleInterpolator = (
  params: PageStyleInterpolatorParams
) => ViewStyle;

export type ScrollOffsetInterpolator = {
  interpolator: (params: ScrollOffsetInterpolatorParams) => number;
  onPanStart?: () => void;
};

export type PagerViewRef = {
  setPage: (page: number) => void;
  setPageWithoutAnimation: (page: number) => void;
};

export type ScrollState = 'idle' | 'dragging' | 'settling';

export type ScrollPosition = {
  position: number;
  offset: number;
};

export type OverscrollSide = 'left' | 'right' | 'top' | 'bottom';

export type Orientation = 'horizontal' | 'vertical';
