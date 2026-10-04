import type { ReactNode } from 'react';

import { type ViewStyle } from 'react-native';

import { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { type PageStyleInterpolator, type ScrollPosition } from './types';
import { getLoopedValue, getNearestLoopPage } from './utils';

type Props = {
  children: (style?: ViewStyle) => ReactNode;
  pageStyleInterpolator: PageStyleInterpolator;
  scrollPosition: SharedValue<ScrollPosition>;
  pageIndex: number;
  pageSize: number;
  loopPageCount: number | null;
};

export const PageWithInterpolation = ({
  children,
  pageStyleInterpolator,
  scrollPosition,
  pageIndex,
  pageSize,
  loopPageCount,
}: Props) => {
  const pageInterpolatorStyle = useAnimatedStyle(() => {
    // In loop mode the offset is counted from the copy of the page closest to the scroll position
    // (PageWithLoop moves the page there)
    const pageOffset =
      getNearestLoopPage(pageIndex, scrollPosition.value, loopPageCount) -
      scrollPosition.value;

    return pageStyleInterpolator({
      pageOffset,
      scrollPosition: getLoopedValue(scrollPosition.value, loopPageCount),
      pageIndex,
      pageSize,
    });
  });

  return children(pageInterpolatorStyle);
};
