import { isValidElement, type ReactNode } from 'react';

import type { OverscrollSide } from './types';

export const getOverscrollOffset = (
  scrollOffset: number,
  contentSize: number,
) => {
  'worklet';

  if (scrollOffset < 0) {
    return scrollOffset;
  }

  if (scrollOffset > contentSize) {
    return scrollOffset - contentSize;
  }

  return 0;
};

export const getPageOffset = (page: number, pageSize: number) => {
  'worklet';

  return page * -pageSize;
};

/**
 * Wraps a value into the `[0, period)` range, e.g. a page index or scroll position with the loop page count as the period.
 * Returns the value as is without a period (when loop mode is disabled).
 */
export const getLoopedValue = (
  value: number,
  period: number | null | undefined,
) => {
  'worklet';

  if (!period) {
    return value;
  }

  return ((value % period) + period) % period;
};

/**
 * Returns the virtual (unbounded) index of the page copy that is closest to the scroll position.
 * Without loop mode every page has a single copy, so the page is returned as is.
 */
export const getNearestLoopPage = (
  page: number,
  scrollPosition: number,
  loopPageCount: number | null | undefined,
) => {
  'worklet';

  if (!loopPageCount) {
    return page;
  }

  return (
    page + Math.round((scrollPosition - page) / loopPageCount) * loopPageCount
  );
};

/**
 * Converts a (virtual) page to an index of an existing page:
 * wraps it around the loop in loop mode, otherwise clamps it to the edges.
 */
export const toPageIndex = (
  page: number,
  pageCount: number,
  loopPageCount: number | null | undefined,
) => {
  'worklet';

  return loopPageCount
    ? getLoopedValue(page, loopPageCount)
    : Math.min(Math.max(page, 0), pageCount - 1);
};

/**
 * Limits a page to the ones the pager can scroll to:
 * any virtual page in loop mode, otherwise pages between the edges.
 */
export const toReachablePage = (
  page: number,
  pageCount: number,
  loopPageCount: number | null | undefined,
) => {
  'worklet';

  return loopPageCount ? page : Math.min(Math.max(page, 0), pageCount - 1);
};

/**
 * Returns the signed distance from the active page to the page.
 * In loop mode the shortest distance around the loop is used.
 */
export const getRelativePageIndex = (
  pageIndex: number,
  activePageIndex: number,
  loopPageCount?: number | null,
) => {
  'worklet';

  const relativePageIndex = pageIndex - activePageIndex;

  if (!loopPageCount) {
    return relativePageIndex;
  }

  const loopedRelativePageIndex = getLoopedValue(
    relativePageIndex,
    loopPageCount,
  );

  return loopedRelativePageIndex > loopPageCount / 2
    ? loopedRelativePageIndex - loopPageCount
    : loopedRelativePageIndex;
};

export const checkPageIndexInRange = (
  page: number,
  index: number,
  pageLimit: number,
  loopPageCount?: number | null,
) => {
  'worklet';

  return (
    Math.abs(getRelativePageIndex(index, page, loopPageCount)) <= pageLimit
  );
};

export const getMainAxisTranslation = (
  translation: number,
  isVertical: boolean,
) => {
  'worklet';

  return isVertical ? { translateY: translation } : { translateX: translation };
};

export const isArrayEqual = <T>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
};

export const getOverscrollSide = (
  overscrollOffset: number,
  isVertical: boolean,
): OverscrollSide => {
  'worklet';

  const isStart = overscrollOffset < 0;

  if (isVertical) {
    return isStart ? 'top' : 'bottom';
  }

  return isStart ? 'left' : 'right';
};

export const isFabric = !!global.nativeFabricUIManager;

export const getChildKey = (child: ReactNode, index: number) =>
  isValidElement(child) ? child.key : index;

export const checkPageInWindow = ({
  currentRelativePageIndex,
  nextRelativePageIndex,
  windowSize,
}: {
  currentRelativePageIndex: number;
  nextRelativePageIndex: number;
  windowSize: number;
}) => {
  return (
    Math.abs(nextRelativePageIndex) <= windowSize ||
    Math.abs(currentRelativePageIndex) <= windowSize
  );
};
