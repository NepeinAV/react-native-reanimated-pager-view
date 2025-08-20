import type { ReactNode } from 'react';

import { type ViewStyle } from 'react-native';

import { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { type PageStyleInterpolator, type ScrollPosition } from './types';

type Props = {
  children: (style?: ViewStyle) => ReactNode;
  pageStyleInterpolator: PageStyleInterpolator;
  scrollPosition: SharedValue<ScrollPosition>;
  pageIndex: number;
  pageSize: number;
};

export const PageWithInterpolation = ({
  children,
  pageStyleInterpolator,
  scrollPosition,
  pageIndex,
  pageSize,
}: Props) => {
  const pageInterpolatorStyle = useAnimatedStyle(() => {
    const { position, offset } = scrollPosition.value;

    const scrollOffset = position + offset;
    const pageOffset = pageIndex - scrollOffset;

    return pageStyleInterpolator({
      pageOffset,
      scrollOffset,
      pageIndex,
      pageSize,
    });
  });

  return children(pageInterpolatorStyle);
};
