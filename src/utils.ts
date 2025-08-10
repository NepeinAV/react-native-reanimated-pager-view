export const getOverdragOffset = (offset: number, contentWidth: number) => {
  'worklet';

  if (offset > 0) {
    return offset;
  }

  if (offset < -contentWidth) {
    return offset + contentWidth;
  }

  return 0;
};

export const getPageOffset = (page: number, pageWidth: number) => {
  'worklet';

  return page * -pageWidth;
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
