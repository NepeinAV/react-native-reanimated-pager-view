import React, { useCallback, useMemo } from 'react';

import { View, Text, FlatList } from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { interpolate } from 'react-native-reanimated';
import {
  PagerView,
  createBounceScrollOffsetInterpolator,
  getOverscrollOffset,
  type PageStyleInterpolator,
  type ScrollPosition,
} from 'react-native-reanimated-pager-view';

import { bannersData } from '../data/banners';
import { postsData } from '../data/posts';
import {
  useOptimizedFlatListConfig,
  keyExtractorById,
} from '../hooks/useFlatListOptimization';
import { styles } from '../styles';
import { postStyles } from '../styles/postStyles';

import { BannerItem } from './BannerItem';
import { PostItem } from './PostItem';

import type { Banner, Post } from '../types';

const PagerProgressBar: React.FC<{
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
    <Animated.View style={[styles.pagerIndicator, containerAnimatedStyle]}>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, progressAnimatedStyle]} />
      </View>
    </Animated.View>
  );
};

export const cardStackPageInterpolator: PageStyleInterpolator = ({
  pageOffset,
  pageIndex,
  pageSize,
  scrollOffset,
}) => {
  'worklet';

  if (pageOffset >= 0) {
    return {
      transform: [
        {
          translateX:
            pageIndex * -pageSize +
            16 * (pageIndex - scrollOffset) +
            scrollOffset * pageSize,
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

const bounceInterpolator = createBounceScrollOffsetInterpolator();

const BannersHeader: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const scrollOffset = useSharedValue(0);

  const onPageScroll = useCallback(
    (e: ScrollPosition) => {
      'worklet';

      scrollOffset.value = e.offset + e.position;
    },
    [scrollOffset],
  );

  return (
    <View style={styles.bannersSection}>
      <Text style={styles.sectionTitle}>Featured</Text>
      <PagerView
        pageStyleInterpolator={cardStackPageInterpolator}
        scrollOffsetInterpolator={bounceInterpolator}
        orientation="horizontal"
        onPageScroll={onPageScroll}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={styles.bannerPage}>
            <BannerItem banner={banner} />
          </View>
        ))}
      </PagerView>
      <PagerProgressBar
        scrollOffset={scrollOffset}
        totalPages={banners.length}
      />
    </View>
  );
};

export const FeedPage: React.FC = () => {
  const posts = useMemo(() => postsData, []);
  const banners = useMemo(() => bannersData, []);
  const flatListConfig = useOptimizedFlatListConfig();

  const renderPost = ({ item }: { item: Post }) => <PostItem post={item} />;

  return (
    <FlatList
      style={styles.pageContainer}
      data={posts}
      renderItem={renderPost}
      keyExtractor={keyExtractorById}
      ListHeaderComponent={<BannersHeader banners={banners} />}
      contentContainerStyle={postStyles.postsSection}
      {...flatListConfig}
    />
  );
};
