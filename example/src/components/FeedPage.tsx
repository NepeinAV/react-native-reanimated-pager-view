import React, { useCallback, useMemo } from 'react';

import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { interpolate } from 'react-native-reanimated';
import {
  PagerView,
  ScrollableWrapper,
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

const bounceInterpolator = createBounceScrollOffsetInterpolator();

const categories = [
  '🔥 Trending',
  '⭐ Favorites',
  '📸 Photos',
  '🎵 Music',
  '📱 Apps',
  '🎮 Games',
];

const BannersHeader: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const scrollOffset = useSharedValue(0);

  const onPageScroll = useCallback(
    (position: ScrollPosition) => {
      'worklet';

      scrollOffset.value = position;
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

      <View style={localStyles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollableWrapper orientation="horizontal">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={localStyles.categoriesContainer}
          >
            {categories.map((action, index) => (
              <View
                key={action}
                style={[
                  localStyles.categoryItem,
                  { backgroundColor: `hsl(${index * 60}, 70%, 60%)` },
                ]}
              >
                <Text style={localStyles.categoryText}>{action}</Text>
              </View>
            ))}
          </ScrollView>
        </ScrollableWrapper>
      </View>
    </View>
  );
};

export const FeedPage: React.FC = () => {
  const posts = useMemo(() => postsData, []);
  const banners = useMemo(() => bannersData, []);
  const flatListConfig = useOptimizedFlatListConfig();

  const renderPost = ({ item }: { item: Post }) => <PostItem post={item} />;

  return (
    <ScrollableWrapper orientation="vertical">
      <FlatList
        style={styles.pageContainer}
        data={posts}
        renderItem={renderPost}
        keyExtractor={keyExtractorById}
        ListHeaderComponent={<BannersHeader banners={banners} />}
        contentContainerStyle={postStyles.postsSection}
        {...flatListConfig}
      />
    </ScrollableWrapper>
  );
};

const localStyles = StyleSheet.create({
  categoriesSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryItem: {
    padding: 10,
    borderRadius: 99999,
  },
  categoryText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
});
