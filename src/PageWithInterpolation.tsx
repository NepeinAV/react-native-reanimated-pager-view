import type { ReactNode } from 'react';
import { type ViewStyle } from 'react-native';
import { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { type PageInterpolator, type ScrollPosition } from './types';

type Props = {
  children: (style?: ViewStyle) => ReactNode;
  pageInterpolator: PageInterpolator;
  scrollPosition: SharedValue<ScrollPosition>;
  pageIndex: number;
};

export const PageWithInterpolation = ({
  children,
  pageInterpolator,
  scrollPosition,
  pageIndex,
}: Props) => {
  const pageInterpolatorStyle = useAnimatedStyle(() => {
    const { position, offset } = scrollPosition.value;

    const distance = position + offset - pageIndex;

    return pageInterpolator({ distance, pageIndex: pageIndex });
  });

  return children(pageInterpolatorStyle);
};
