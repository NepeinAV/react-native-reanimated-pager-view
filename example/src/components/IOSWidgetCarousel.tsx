import { useEffect } from 'react';

import { StyleSheet, Image } from 'react-native';

import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { type PageStyleInterpolator } from 'react-native-reanimated-pager-view';

import { CustomPagerView } from './CustomPagerView';

type Widget = {
  width: number;
  aspectRatio: number;
  backgroundUrl: string;
};

const widgets: Widget[] = [
  {
    width: 80,
    aspectRatio: 1,
    backgroundUrl:
      'https://images.unsplash.com/photo-1754377479970-bc010d2732ed?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    width: 40,
    aspectRatio: 1,
    backgroundUrl:
      'https://images.unsplash.com/photo-1755441172753-ac9b90dcd930?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    width: 80,
    aspectRatio: 2,
    backgroundUrl:
      'https://plus.unsplash.com/premium_photo-1669828831467-bc0b867e2947?q=80&w=1286&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    width: 40,
    aspectRatio: 1,
    backgroundUrl:
      'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?q=80&w=800&auto=format&fit=crop&crop=entropy',
  },
  {
    width: 80,
    aspectRatio: 2,
    backgroundUrl:
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop&crop=entropy',
  },
];

const additionalTranslation = 14;
const rotationDegree = 4;

export const iosWidgetCarouselPageInterpolator: PageStyleInterpolator = ({
  pageOffset,
  pageIndex,
  pageSize,
}) => {
  'worklet';

  const itemEmptySpace =
    (pageSize - pageSize * ((widgets[pageIndex]?.width || 0) / 100)) / 2;

  return {
    transform: [
      {
        translateX: interpolate(
          pageOffset,
          [-1, 0, 1],
          [
            itemEmptySpace + additionalTranslation,
            0,
            -itemEmptySpace - additionalTranslation,
          ],
        ),
      },
    ],
  };
};

const Widget = ({
  item,
  widgetRotationStyle,
}: {
  item: Widget;
  widgetRotationStyle: any;
}) => {
  return (
    <Animated.View style={[styles.widgetWrapper]}>
      <Animated.View
        style={[
          { width: `${item.width}%`, aspectRatio: item.aspectRatio },
          widgetRotationStyle,
          styles.widgetAnimated,
        ]}
      >
        <Image
          source={{ uri: item.backgroundUrl }}
          style={styles.widgetImage}
        />
      </Animated.View>
    </Animated.View>
  );
};

export const IOSWidgetCarousel = () => {
  const widgetRotation = useSharedValue(0);

  useEffect(() => {
    widgetRotation.value = withRepeat(
      withTiming(4, { duration: 15000, easing: Easing.linear }),
      0,
    );
  }, [widgetRotation]);

  const widgetRotationStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 500 },
        {
          rotateX: `${interpolate(widgetRotation.value, [0, 1, 2, 3, 4], [rotationDegree, -rotationDegree, -rotationDegree, rotationDegree, rotationDegree])}deg`,
        },
        {
          rotateY: `${interpolate(widgetRotation.value, [0, 1, 2, 3, 4], [rotationDegree, rotationDegree, -rotationDegree, -rotationDegree, rotationDegree])}deg`,
        },
      ],
    };
  });

  return (
    <CustomPagerView pageStyleInterpolator={iosWidgetCarouselPageInterpolator}>
      {widgets.map((item, index) => (
        <Widget
          key={index}
          item={item}
          widgetRotationStyle={widgetRotationStyle}
        />
      ))}
    </CustomPagerView>
  );
};

const styles = StyleSheet.create({
  widgetWrapper: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetAnimated: {
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: [
      { offsetY: 10, offsetX: 0, blurRadius: 30, color: 'rgba(0, 0, 0, 0.3)' },
    ],
  },
  widgetImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
});
