import { makeMutable, runOnJS } from 'react-native-reanimated';

import { type ScrollOffsetInterpolator, type OverscrollSide } from '../types';
import { getOverscrollOffset, getOverscrollSide } from '../utils';

export type BounceScrollOffsetInterpolatorConfig = {
  /**
   * Resistance factor for overscroll effect (0 = full movement, 1 = no movement)
   *
   * @default 0.7
   */
  resistanceFactor?: number;

  /**
   * Threshold for triggering `onThresholdReached` callback as a relative value
   * For example, 0.3 means the threshold is 30% beyond the boundary
   *
   * @default 0.3
   */
  threshold?: number;

  /**
   * Callback triggered when overscroll threshold is reached.
   */
  onThresholdReached?: (params: { side: OverscrollSide }) => void;

  /**
   * Whether to trigger `onThresholdReached` only once during single pan gesture
   *
   * - When `true`, the callback will only fire once until the pan gesture ends
   * - When `false`, the callback can run multiple times each time the threshold value is exceeded
   *
   * @default false
   */
  triggerThresholdCallbackOnlyOnce?: boolean;
};

/**
 * Creates a scroll offset interpolator with overscroll resistance
 */
export const createBounceScrollOffsetInterpolator = (
  config: BounceScrollOffsetInterpolatorConfig = {},
): ScrollOffsetInterpolator => {
  const {
    resistanceFactor = 0.7,
    threshold = 0.3,
    onThresholdReached,
    triggerThresholdCallbackOnlyOnce = false,
  } = config;

  const isThresholdReachedCalled = makeMutable(false);

  return {
    interpolator: ({ scrollOffset, orientation, pageCount }) => {
      'worklet';

      const isVertical = orientation === 'vertical';

      const overscrollOffset = getOverscrollOffset(scrollOffset, pageCount - 1);

      if (!triggerThresholdCallbackOnlyOnce && overscrollOffset === 0) {
        isThresholdReachedCalled.value = false;
      }

      if (
        onThresholdReached &&
        !isThresholdReachedCalled.value &&
        Math.abs(overscrollOffset) > threshold
      ) {
        isThresholdReachedCalled.value = true;

        const side = getOverscrollSide(scrollOffset, isVertical);

        runOnJS(onThresholdReached)({ side });
      }

      return scrollOffset - overscrollOffset * resistanceFactor;
    },
    onPanStart: () => {
      'worklet';

      isThresholdReachedCalled.value = false;
    },
  };
};
