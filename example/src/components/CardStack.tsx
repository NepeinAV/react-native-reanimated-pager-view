import { useCallback } from 'react';

import { StyleSheet, View } from 'react-native';

import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import {
  getOverscrollOffset,
  type PageStyleInterpolator,
  type ScrollPosition,
} from 'react-native-reanimated-pager-view';

import { CONSTANTS } from '../constants';
import { bannersData } from '../data/banners';

import { BannerItem } from './BannerItem';
import { CustomPagerView } from './CustomPagerView';

export const cardStackPageInterpolator: PageStyleInterpolator = ({
  pageOffset,
  pageIndex,
  pageSize,
  scrollPosition,
}) => {
  'worklet';

  if (pageOffset >= 0) {
    return {
      transform: [
        {
          translateX:
            pageIndex * -pageSize +
            16 * (pageIndex - scrollPosition) +
            scrollPosition * pageSize,
        },
        {
          scale: interpolate(pageOffset, [0, 1], [1, 0.965]),
        },
      ],
      zIndex: 100 - pageIndex,
      opacity: interpolate(pageOffset, [0, 1.5, 2], [1, 1, 0.3]),
    };
  }

  return {
    opacity: interpolate(pageOffset, [-1, 0], [0, 1]),
    zIndex: 100 - pageIndex,
  };
};

export const CardStack = () => {
  const scrollOffset = useSharedValue(0);

  const onPageScroll = useCallback(
    (position: ScrollPosition) => {
      'worklet';

      scrollOffset.value = position;
    },
    [scrollOffset],
  );

  return (
    <>
      <CustomPagerView
        pageStyleInterpolator={cardStackPageInterpolator}
        onPageScroll={onPageScroll}
        removeClippedPages={false}
        blockParentScrollableWrapperActivation
      >
        {bannersData.map((banner) => (
          <View key={banner.id} style={styles.bannerPage}>
            <BannerItem banner={banner} />
          </View>
        ))}
      </CustomPagerView>
      <CardStackProgressBar
        scrollOffset={scrollOffset}
        totalPages={bannersData.length}
      />
    </>
  );
};

const CardStackProgressBar: React.FC<{
  scrollOffset: SharedValue<number>;
  totalPages: number;
}> = ({ scrollOffset, totalPages }) => {
  const progressAnimatedStyle = useAnimatedStyle(() => {
    const progress = scrollOffset.value / (totalPages - 1);

    return {
      width: `${Math.max(0, Math.min(100, progress * 100))}%`,
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const overscrollOffset = getOverscrollOffset(
      scrollOffset.value,
      totalPages - 1,
    );

    return {
      transform: [{ translateX: overscrollOffset * 100 }],
    };
  });

  return (
    <Animated.View
      style={[styles.pagerIndicator, containerAnimatedStyle]}
      pointerEvents="none"
    >
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, progressAnimatedStyle]} />
      </View>
    </Animated.View>
  );
};

export const styles = StyleSheet.create({
  bannerPage: {
    flex: 1,
    marginHorizontal: CONSTANTS.SPACING.MEDIUM * 2,
  },
  pagerIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -30,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    flex: 1,
    maxWidth: 40,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});
