import { useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  cancelAnimation,
  ReduceMotion,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { checkPageIndexInRange } from './utils';

const IS_CUSTOM_CLIPPING_APPROACH_ENABLED = Platform.OS === 'android';
const REMOVE_CLIPPED_PAGES_DELAY_MS = 5000;

export const useCustomClippingProvider = ({
  isRemovingClippedPagesEnabled,
}: {
  isRemovingClippedPagesEnabled: boolean;
}) => {
  const tmpValue = useSharedValue(0);

  const canRemoveClippedPages = useSharedValue(
    isRemovingClippedPagesEnabled && IS_CUSTOM_CLIPPING_APPROACH_ENABLED ? 1 : 0
  );

  const setRemoveClippedPages = useCallback(
    (isClipped: boolean) => {
      'worklet';

      if (!IS_CUSTOM_CLIPPING_APPROACH_ENABLED) {
        return;
      }

      if (isRemovingClippedPagesEnabled && isClipped) {
        tmpValue.value = withTiming(
          Math.random(),
          {
            duration: REMOVE_CLIPPED_PAGES_DELAY_MS,
            reduceMotion: ReduceMotion.Never,
          },
          (_finished?: boolean) => {
            if (_finished) {
              canRemoveClippedPages.value = 1;
            }
          }
        );
      } else {
        cancelAnimation(tmpValue);

        canRemoveClippedPages.value = 0;
      }
    },
    [isRemovingClippedPagesEnabled, canRemoveClippedPages, tmpValue]
  );

  return { setRemoveClippedPages, canRemoveClippedPages };
};

export const useCustomClippingReceiver = ({
  currentPage,
  pageIndex,
  canRemoveClippedPages,
  isRemovingClippedPagesEnabled,
  width,
}: {
  currentPage: SharedValue<number>;
  pageIndex: number;
  canRemoveClippedPages: SharedValue<number>;
  isRemovingClippedPagesEnabled: boolean;
  width: number;
}) => {
  const isPageMountedInNativeTree = useSharedValue(1);

  useAnimatedReaction(
    () => {
      if (!IS_CUSTOM_CLIPPING_APPROACH_ENABLED) {
        return;
      }

      canRemoveClippedPages.value;
      currentPage.value;
    },
    () => {
      if (
        !isRemovingClippedPagesEnabled ||
        !IS_CUSTOM_CLIPPING_APPROACH_ENABLED
      ) {
        return;
      }

      const isInRange = checkPageIndexInRange(currentPage.value, pageIndex, 1);

      if (isInRange) {
        isPageMountedInNativeTree.value = 1;
        return;
      }

      if (!isInRange && canRemoveClippedPages.value) {
        isPageMountedInNativeTree.value = 0;
      }
    }
  );

  const clippedPageStyle = useAnimatedStyle(() => {
    if (!IS_CUSTOM_CLIPPING_APPROACH_ENABLED) {
      return {};
    }

    return {
      left: isPageMountedInNativeTree.value ? 0 : width * 1.5,
    };
  });

  return { clippedPageStyle };
};

export const useExecuteEffectOnce = (executor: () => boolean | void) => {
  const isExecuted = useRef(false);

  useEffect(() => {
    if (!isExecuted.current) {
      isExecuted.current = executor() !== false;
    }
  }, [executor]);
};

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
