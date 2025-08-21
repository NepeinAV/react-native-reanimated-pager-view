import React from 'react';

import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import { styles } from '../styles';

interface NavigationIconProps {
  icon: string;
  animatedPage: Animated.SharedValue<number>;
  index: number;
}

export const NavigationIcon: React.FC<NavigationIconProps> = ({
  icon,
  animatedPage,
  index,
}) => {
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animatedPage.value,
      [index - 1, index, index + 1],
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
