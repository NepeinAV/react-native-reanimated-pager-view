import type { OverscrollSide } from './types';

export const getOverscrollOffset = (
  scrollOffset: number,
  contentSize: number
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

export const checkPageIndexInRange = (
  page: number,
  index: number,
  pageLimit: number
) => {
  'worklet';

  return Math.abs(page - index) <= pageLimit;
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
  isVertical: boolean
): OverscrollSide => {
  'worklet';

  const isStart = overscrollOffset < 0;

  if (isVertical) {
    return isStart ? 'top' : 'bottom';
  }

  return isStart ? 'left' : 'right';
};
