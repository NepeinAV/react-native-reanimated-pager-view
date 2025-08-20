import type { ReactNode } from 'react';

import { type ViewStyle } from 'react-native';

import { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { type PageStyleInterpolator, type ScrollPosition } from './types';

type Props = {
  children: (style?: ViewStyle) => ReactNode;
  pageStyleInterpolator: PageStyleInterpolator;
  scrollPosition: SharedValue<ScrollPosition>;
  pageIndex: number;
};

export const PageWithInterpolation = ({
  children,
  pageStyleInterpolator,
  scrollPosition,
  pageIndex,
}: Props) => {
  const pageInterpolatorStyle = useAnimatedStyle(() => {
    const { position, offset } = scrollPosition.value;

    const pageOffset = position + offset - pageIndex;

    return pageStyleInterpolator({ pageOffset, pageIndex: pageIndex });
  });

  return children(pageInterpolatorStyle);
};
