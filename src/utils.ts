import type { OverdragSide } from './types';

export const getOverdragOffset = (offset: number, contentSize: number) => {
  'worklet';

  if (offset > 0) {
    return offset;
  }

  if (offset < -contentSize) {
    return offset + contentSize;
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

export const getOverdragSide = (
  overdragOffset: number,
  isVertical: boolean
): OverdragSide => {
  'worklet';

  const isPositive = overdragOffset > 0;

  if (isVertical) {
    return isPositive ? 'top' : 'bottom';
  }

  return isPositive ? 'left' : 'right';
};
