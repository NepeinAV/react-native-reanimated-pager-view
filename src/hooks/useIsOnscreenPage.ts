import { useRef } from 'react';

import { checkPageInWindow } from '../utils';

import { usePageRelativeIndex } from './usePageRelativeIndex';

type UseIsOnscreenPageParams = { windowSize?: number; once?: boolean };

export const useIsOnscreenPage = ({
  windowSize = 0,
  once = false,
}: UseIsOnscreenPageParams = {}) => {
  const wasOnscreenOnce = useRef(false);

  const relativePageIndex = usePageRelativeIndex(
    ({ currentRelativePageIndex, nextRelativePageIndex }) => {
      const isOnscreen = checkPageInWindow({
        currentRelativePageIndex,
        nextRelativePageIndex,
        windowSize,
      });

      if (!once) {
        return isOnscreen;
      }

      if (isOnscreen && !wasOnscreenOnce.current) {
        wasOnscreenOnce.current = true;

        return true;
      }

      return false;
    },
  );

  return Math.abs(relativePageIndex) <= windowSize;
};
