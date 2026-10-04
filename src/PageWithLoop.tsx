import type { PropsWithChildren } from 'react';

import { StyleSheet } from 'react-native';

import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { type Orientation, type ScrollPosition } from './types';
import { getMainAxisTranslation, getNearestLoopPage } from './utils';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

type Props = PropsWithChildren<{
  scrollPosition: SharedValue<ScrollPosition>;
  pageIndex: number;
  pageSize: number;
  loopPageCount: number | null;
  orientation: Orientation;
}>;

/**
 * Moves the page to the loop cycle closest to the current scroll position.
 *
 * It's a separate view rather than a part of the page style: Android decomposes the transform matrix,
 * and this translation combined with 3D transforms of `pageStyleInterpolator` (e.g. perspective) gets distorted.
 */
export const PageWithLoop = ({
  children,
  scrollPosition,
  pageIndex,
  pageSize,
  loopPageCount,
  orientation,
}: Props) => {
  const isVertical = orientation === 'vertical';

  // Changes only when the page jumps to another loop cycle,
  // so the style below is not recalculated on every frame
  const loopPageIndex = useDerivedValue(() =>
    getNearestLoopPage(pageIndex, scrollPosition.value, loopPageCount),
  );

  const loopStyle = useAnimatedStyle(() => ({
    transform: [
      getMainAxisTranslation(
        (loopPageIndex.value - pageIndex) * pageSize,
        isVertical,
      ),
    ],
  }));

  return (
    <Animated.View
      style={[
        isVertical ? { height: pageSize } : { width: pageSize },
        styles.flex,
        loopStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};
