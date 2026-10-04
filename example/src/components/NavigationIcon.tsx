import React from 'react';

import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';

import { styles } from '../styles';

interface NavigationIconProps {
  icon: string;
  animatedPage: SharedValue<number>;
  index: number;
  pageCount: number;
}

export const NavigationIcon: React.FC<NavigationIconProps> = ({
  icon,
  animatedPage,
  index,
  pageCount,
}) => {
  const iconAnimatedStyle = useAnimatedStyle(() => {
    // Shortest distance around the loop, so the first and the last tabs are neighbours
    const pageOffset = animatedPage.value - index;
    const loopedPageOffset =
      pageOffset - Math.round(pageOffset / pageCount) * pageCount;

    const scale = interpolate(
      loopedPageOffset,
      [-1, 0, 1],
      [1, 1.2, 1],
      'clamp',
    );

    return {
      transform: [{ scale: withSpring(scale) }],
    };
  });

  return (
    <Animated.Text style={[styles.navIcon, iconAnimatedStyle]}>
      {icon}
    </Animated.Text>
  );
};
